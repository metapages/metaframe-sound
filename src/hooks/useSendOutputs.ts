import { useCallback } from "react";
import { useMetaframe } from "@metapages/metaframe-hook";
import { useFileStore } from "/@/store";
import { MetaframeInputMap } from "@metapages/metapage";

export const useSendOutputs: () => (
  filenames: string[]
) => Promise<void> = () => {
  const metaframeBlob = useMetaframe();
  const getFileBlob = useFileStore((state) => state.getFileBlob);
  const sendOutputs = useCallback(
    async (filenames: string[]) => {
      const outputs: MetaframeInputMap = {};

      for (const filename of filenames) {
        const fileBlob = await getFileBlob(filename);
        outputs[filename] = fileBlob.value;
      }
      metaframeBlob?.metaframe?.setOutputs(outputs);
    },
    [metaframeBlob?.metaframe]
  );

  return sendOutputs;
};
