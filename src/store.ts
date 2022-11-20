import create from "zustand";
import { FileBlob } from "/@/components/FileBlob";

interface FilesState {
  files: FileBlob[];
  addFile: (file: FileBlob) => void;
  updateFile: (file: FileBlob) => void;
  deleteFile: (filename: string) => Promise<void>;
  playFile: (label: string) => Promise<void>;
  stopFile: (label: string) => Promise<void>;
  onEnd: (label: string) => Promise<void>;
  onLoad: (label: string) => Promise<void>;
  deleteAll: () => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useFileStore = create<FilesState>((set, get) => {
  return {
    files: [],

    playFile: async (label: string) => {
      const file = get().files.find((file) => file.label === label);
      if (!file) {
        console.error(`Cannot playFile("${label}"): file not found`);
        return;
      }
      if (!file.loaded) {
        return;
      }

      if (file.playing) {
        file.playAgain = true;
      } else {
        if (file.loaded) {
          file.sound.play();
        }
      }
      file.playing = true;
      // update
      const index = get().files.findIndex((f) => file.label === f.label);
      if (index < 0) {
        return;
      }
      const updateFiles = [...get().files];
      updateFiles[index] = { ...file };

      set((state) => ({
        files: updateFiles,
      }));
    },

    stopFile: async (label: string) => {
      const file = get().files.find((file) => file.label === label);
      if (!file) {
        console.error(`Cannot playFile("${label}"): file not found`);
        return;
      }
      if (!file.loaded) {
        return;
      }

      let changed = false;
      if (file.playing || file.playAgain) {
        file.playing = false;
        file.playAgain = false;
        changed = true;
      }

      file?.sound.stop();

      // update
      if (changed) {
        const index = get().files.findIndex((f) => file.label === f.label);
        const updateFiles = [...get().files];
        updateFiles[index] = { ...file };
        set((state) => ({
          files: updateFiles,
        }));
      }
    },

    onEnd: async (label: string) => {
      const file = get().files.find((file) => file.label === label);
      if (file) {
        if (file.playAgain) {
          file.sound.play();
          file.playAgain = false;
        } else {
          file.playing = false;
        }
        // update
        const index = get().files.findIndex((f) => file.label === f.label);
        if (index < 0) {
          return;
        }
        const updateFiles = [...get().files];
        updateFiles[index] = { ...file };

        set((state) => ({
          files: updateFiles,
        }));
      }
    },
    onLoad: async (label: string) => {
      const file = get().files.find((file) => file.label === label);
      if (file) {
        file.loaded = true;
        if (file.playing) {
          file.sound.play();
        }
        // update

        const index = get().files.findIndex((f) => file.label === f.label);
        if (index < 0) {
          return;
        }
        const updateFiles = [...get().files];
        updateFiles[index] = { ...file };

        set((state) => ({
          files: updateFiles,
        }));
      }
    },

    addFile: async (file: FileBlob) => {
      set((state) => ({
        // overwrite if already exists
        files: [
          ...state.files.filter((f) => f.url !== file.url),
          { ...file },
        ].sort((f1, f2) => f1.label.localeCompare(f2.label)),
      }));
    },

    // only update if it already exists
    updateFile: async (file: FileBlob) => {
      const index = get().files.findIndex((f) => file.label === f.label);
      if (index < 0) {
        return;
      }
      const updateFiles = [...get().files];
      updateFiles[index] = { ...file };

      set((state) => ({
        files: updateFiles,
      }));
    },

    deleteFile: async (label: string) => {
      const files = [...get().files];
      const fileBlob = get().files.find((file) => file.label === label);

      if (fileBlob) {
        fileBlob.sound.unload();
        files.splice(files.indexOf(fileBlob), 1);
      }

      set((state) => ({
        files,
      }));
    },

    deleteAll: () => {
      const files = [...get().files];
      files.forEach((f) => f.sound.unload());
      set((state) => ({
        files: [],
      }));
    },

    error: null,
    setError: (error: string | null) => set((state) => ({ error })),
  };
});
