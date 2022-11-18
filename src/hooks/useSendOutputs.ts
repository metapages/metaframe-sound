import { useMetaframe } from "@metapages/metaframe-hook";
import { MetaframeInputMap } from "@metapages/metapage";
import { useCallback, useEffect } from "react";

import { FileBlob } from "../components/FileBlob";
import { useFileStore } from "/@/store";

export const useSendOutputs: () => (
  filenames: string[]
) => Promise<void> = () => {
  const metaframeBlob = useMetaframe();
  const getFileBlob = useFileStore((state) => state.getFileBlob);
  const updateFile = useFileStore((state) => state.updateFile);

  const files = useFileStore((state) => state.files);

  const sendOutputs = useCallback(
    async (urls: string[]) => {
      if (!metaframeBlob?.metaframe) {
        return;
      }
      const outputs: MetaframeInputMap = {};
      const sentFiles: FileBlob[] = [];
      for (const url of urls) {
        let fileBlob: FileBlob | undefined;
        try {
          fileBlob = await getFileBlob(url);
        } catch (err) {}

        if (!fileBlob) {
          return;
        }
        const { value, sent, error } = fileBlob;
        if (sent || error) {
          continue;
        }

        const fileName = url.split("/").pop() || url;

        outputs[fileName] = fileBlob.value;

        sentFiles.push(fileBlob);
      }

      if (Object.keys(outputs).length > 0) {
        metaframeBlob.metaframe?.setOutputs(outputs);
      }
      for (const fileBlob of sentFiles) {
        fileBlob.sent = true;
        updateFile(fileBlob);
      }
    },
    [metaframeBlob?.metaframe, updateFile, getFileBlob]
  );

  useEffect(() => {
    if (!files || files.length === 0) {
      return;
    }
    sendOutputs(files.map((file) => file.url));
  }, [sendOutputs, files]);

  return sendOutputs;
};
