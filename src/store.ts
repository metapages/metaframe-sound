import create from "zustand";
import localForage from "localforage";
import { FileBlob } from "/@/components/FileBlob";
import {
  possiblyDeserializeDatarefToValue,
  possiblySerializeValueToDataref,
} from "@metapages/metapage";

interface FilesState {
  files: FileBlob[];
  addFile: (file: FileBlob) => void;
  updateFile: (file: FileBlob) => void;
  setFiles: (files: FileBlob[]) => void;
  /**
   * This returns the FileBlob (which you may already have)
   * but with the File field populated.
   * This could be maybe clearer.
   */
  getFileBlob: (filename: string) => Promise<FileBlob>;
  deleteFile: (filename: string) => Promise<void>;

  error: string | null;
  setError: (error: string | null) => void;
}

export const useFileStore = create<FilesState>((set, get) => {
  return {
    files: [],
    setFiles: (files: FileBlob[]) => set((state) => ({ files })),

    getFileBlob: async (url: string) => {
      const fileBlob = get().files.find((file) => file.url === url);
      if (!fileBlob) {
        throw new Error("File not found");
      }

      if (fileBlob.error) {
        return fileBlob;
      }

      let changed = false;

      if (fileBlob.cached && fileBlob.value === undefined) {
        const valueFromCache: any | undefined | null =
          await localForage.getItem(fileBlob.url);
        fileBlob.cached = true;
        fileBlob.value = valueFromCache;
        fileBlob.sent = false;
        changed = true;
      }

      // Ok, now download
      if (fileBlob.value === undefined && !fileBlob.file) {
        const res = await fetch(fileBlob.url);
        if (res.ok) {
          const blob = await res.blob();
          const tokens = fileBlob.url.split("/");
          fileBlob.file = new File([blob], tokens[tokens.length - 1]);
        } else {
          fileBlob.error = res.statusText;
        }
        changed = true;
      }

      // maybe we just uploaded this
      if (fileBlob.value === undefined && fileBlob.file) {
        fileBlob.value = await possiblySerializeValueToDataref(fileBlob.file);
        changed = true;
      }

      if (fileBlob.file && fileBlob.size === undefined) {
        fileBlob.size = fileBlob.file.size;
        changed = true;
      }

      // convert to file
      if (fileBlob.value !== undefined && !fileBlob.file) {
        fileBlob.file = possiblyDeserializeDatarefToValue(fileBlob.value);
        // TODO this doesn't account for TypedArrays
        // TODO need a generic "convert to File" function
        if (!(fileBlob.file instanceof Blob)) {
          fileBlob.file = new File(
            [
              typeof fileBlob.value === "string"
                ? fileBlob.value
                : JSON.stringify(fileBlob.value),
            ],
            url,
            {
              type:
                typeof fileBlob.value === "string"
                  ? "text/plain"
                  : "application/json",
            }
          );
        } else {
          const blob: Blob = fileBlob.file;
          fileBlob.file = new File([blob], url, {
            type: blob.type,
          });
        }

        fileBlob.size = fileBlob.file.size;
        changed = true;
      }

      // everything is deserialized etc
      if (changed) {
        // trigger updates
        get().addFile(fileBlob);
      }
      return fileBlob;
    },

    addFile: async (file: FileBlob) => {
      set((state) => ({
        // overwrite if already exists
        files: [...state.files.filter((f) => f.url !== file.url), { ...file }],
      }));
    },

    updateFile: async (file: FileBlob) => {
      set((state) => ({
        // overwrite if already exists
        files: state.files.find((f) => f.url === file.url)
          ? [...state.files.filter((f) => f.url !== file.url), { ...file }]
          : state.files,
      }));
    },

    deleteFile: async (url: string) => {
      const files = [...get().files];
      const fileBlob = get().files.find((file) => file.url === url);

      if (fileBlob) {
        files.splice(files.indexOf(fileBlob), 1);
        try {
          await localForage.removeItem(url);
        } catch (err) {
          console.log(err);
        }
      }

      set((state) => ({
        files,
      }));
    },

    error: null,
    setError: (error: string | null) => set((state) => ({ error })),
  };
});
