import { useEffect } from "react";
import { useMetaframe } from "@metapages/metaframe-hook";
import { useFileStore } from "../store";
import { Metaframe } from "@metapages/metapage";
import { useHashParamJson } from "@metapages/hash-query";
import { Options } from "/@/components/PanelOptions";

export const useMetaframeInputsPassthrough: () => void = () => {
  const metaframeBlob = useMetaframe();
  const addFile = useFileStore((state) => state.addFile);
  const [options] = useHashParamJson<Options>("options", {});

  useEffect(() => {
    if (!metaframeBlob?.metaframe) {
      return;
    }

    const metaframe: Metaframe = metaframeBlob?.metaframe;
    return metaframe.onInputs((inputs) => {
      if (inputs) {
        // immediately send the inputs onward
        if (!options?.pausedOutputs) {
          metaframe.setOutputs(inputs);
        }

        // then display them in the UI
        Object.entries(inputs).forEach(([key, value]) => {
          addFile({
            name: key,
            value,
            cached: false,
            arrived: new Date(),
          });
        });
      }
    });
  }, [metaframeBlob?.metaframe, options?.pausedOutputs]);
};
