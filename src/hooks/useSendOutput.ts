import { useCallback } from "react";
import { useMetaframe } from "@metapages/metaframe-hook";
import { useFileStore } from "/@/store";

export const useSendOutput: (name: string) => () => Promise<void> = (name) => {
  const metaframeBlob = useMetaframe();
  const getFileBlob = useFileStore((state) => state.getFileBlob);
  const sendOutputs = useCallback(async () => {
    const fileBlob = await getFileBlob(name);
    metaframeBlob?.metaframe?.setOutputs({ [name]: fileBlob.value });
  }, [metaframeBlob?.metaframe]);

  return sendOutputs;
};
