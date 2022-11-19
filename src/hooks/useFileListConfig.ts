import { useCallback, useEffect } from "react";
import { useHashParamJson } from "@metapages/hash-query";
import { useFileStore } from "/@/store";
import { Howl } from "howler";

export interface FileListItem {
  url: string;
  label: string;
}

export interface FileListConfig {
  files: FileListItem[];
}

export const useFileListConfig: () => [
  FileListConfig,
  (config: FileListConfig) => void
] = () => {
  const [fileList, setFileListInternal] = useHashParamJson<FileListConfig>(
    "sounds",
    { files: [] }
  );
  const deleteAll = useFileStore((state) => state.deleteAll);
  const addFile = useFileStore((state) => state.addFile);
  const onEnd = useFileStore((state) => state.onEnd);
  const onLoad = useFileStore((state) => state.onLoad);

  const setFileList = useCallback(
    (fileList: FileListConfig) => {
      setFileListInternal(fileList);
    },
    [setFileListInternal]
  );

  // sync files from the hash params (source of truth) to the store
  useEffect(() => {
    deleteAll();
    // then add
    fileList?.files.forEach((f) => {
      const sound = new Howl({
        src: [f.url],
        autoplay: false,
        onend: () => onEnd(f.label),
      });
      sound.once("load", () => {
        onLoad(f.label);
      });
      addFile({ url: f.url, label: f.label, sound });
    });
  }, [fileList, deleteAll, addFile, onEnd, onLoad]);

  return [fileList, setFileList];
};
