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
  setFiles: (files: FileBlob[]) => void;
  /**
   * This returns the FileBlob (which you may already have)
   * but with the File field populated.
   * This could be maybe clearer.
   */
  getFileBlob: (filename: string) => Promise<FileBlob>;
  copyFileToClipboard: (filename: string) => Promise<void>;
  cacheFile: (file: FileBlob) => void;
  syncCachedFiles: () => void;

  deleteFile: (filename: string) => Promise<void>;
  deleteAllFiles: () => Promise<void>;

  error: string | null;
  setError: (error: string | null) => void;
}

export const useFileStore = create<FilesState>((set, get) => {
  return {
    files: [],
    setFiles: (files: FileBlob[]) => set((state) => ({ files })),

    getFileBlob: async (filename: string) => {
      const fileBlob = get().files.find((file) => file.name === filename);
      if (!fileBlob) {
        throw new Error("File not found");
      }

      let changed = false;

      if (fileBlob.cached && fileBlob.value === undefined) {
        const valueFromCache: any | undefined | null =
          await localForage.getItem(fileBlob.name);
        fileBlob.cached = true;
        fileBlob.value = valueFromCache;
        changed = true;
      }

      // maybe we just uploaded this
      if (fileBlob.value === undefined && fileBlob.file) {
        fileBlob.value = await possiblySerializeValueToDataref(fileBlob.file);
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
            filename,
            {
              type:
                typeof fileBlob.value === "string"
                  ? "text/plain"
                  : "application/json",
            }
          );
        } else {
          const blob: Blob = fileBlob.file;
          fileBlob.file = new File([blob], filename, {
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

    copyFileToClipboard: async (filename: string) => {
      const blob = await get().getFileBlob(filename);
      navigator.clipboard.writeText(blob.value);
    },

    cacheFile: async (file: FileBlob) => {
      if (file.cached) {
        return;
      }

      if (!file.value) {
        throw `cacheFile failed, not file File not found for: ${file.name}`;
      }

      try {
        await localForage.setItem(file.name, file.value);
        file.cached = true;
        // trigger updates
        set((state) => ({
          files: [...get().files],
        }));
      } catch (err) {
        console.log(err);
      }
    },

    syncCachedFiles: async () => {
      const keys = await localForage.keys();

      const files = get().files;
      const newFiles: FileBlob[] = [];
      keys.forEach((key) => {
        if (!files.find((f) => f.name === key)) {
          newFiles.push({
            name: key,
            cached: true,
          });
        }
      });

      set((state) => ({
        files: [...files, ...newFiles],
      }));
    },

    addFile: async (file: FileBlob) => {
      set((state) => ({
        // overwrite if already exists
        files: [
          ...state.files.filter((f) => f.name !== file.name),
          { ...file },
        ],
      }));
    },

    deleteFile: async (filename: string) => {
      const files = [...get().files];
      const fileBlob = get().files.find((file) => file.name === filename);

      if (fileBlob) {
        files.splice(files.indexOf(fileBlob), 1);
        try {
          await localForage.removeItem(filename);
        } catch (err) {
          console.log(err);
        }
      }

      set((state) => ({
        files,
      }));
    },

    deleteAllFiles: async () => {
      get().files.forEach(async (file) => {
        try {
          await localForage.removeItem(file.name);
        } catch (err) {
          console.log(err);
        }
      });

      set((state) => ({
        files: [],
      }));

      return Promise.resolve();
    },

    error: null,
    setError: (error: string | null) => set((state) => ({ error })),
  };
});
