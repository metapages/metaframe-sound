import { useCallback } from "react";
import { useHashParamJson } from "@metapages/hash-query";

export const useFileList: () => [string[], (urls: string[]) => void] = () => {
  const [fileList, setFileListInternal] = useHashParamJson<string[]>(
    "urls",
    []
  );
  const setFileList = useCallback(
    (fileList: string[]) => {
      setFileListInternal(fileList);
    },
    [setFileListInternal]
  );

  return [fileList, setFileList];
};
