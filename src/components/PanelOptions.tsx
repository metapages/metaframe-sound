import { Button, FormControl, FormLabel, Switch } from "@chakra-ui/react";
import { useFormik } from "formik";
import { useCallback } from "react";
import * as yup from "yup";
import { useHashParamJson } from "@metapages/hash-query";

export type Options = {
  showSizes?: boolean;
  showBitRate?: boolean;
  showMessagesPerSec?: boolean;
  showPreviews?: boolean;
  showTimeArrived?: boolean;
  pausedOutputs?: boolean;
  hideDownloads?: boolean;
  showDeleteButton?: boolean;
  showLocalCache?: boolean;
};

const descriptions = {
  showSizes: "Show message size",
  showBitRate: "Show bit rate (e.g. Mb/s)",
  showMessagesPerSec: "Show messages/second",
  showPreviews: "Show previews (limited to 100k characters)",
  showTimeArrived: "Show time arrived",
  showLocalCache: "Show local cache button",
  pausedOutputs: "Pause outputs",
  hideDownloads: "Hide download button",
  showDeleteButton: "Show delete button",

};

export const defaultOptions: Options = {
  showSizes: false,
  showBitRate: false,
  showMessagesPerSec: false,
  showPreviews: false,
  pausedOutputs: false,
  showTimeArrived: false,
  showDeleteButton: false,
  hideDownloads: false,
  showLocalCache: false,
};

const validationSchema = yup.object({
  showSizes: yup.boolean().optional(),
  showBitRate: yup.boolean().optional(),
  showMessagesPerSec: yup.boolean().optional(),
  showPreviews: yup.boolean().optional(),
  pausedOutputs: yup.boolean().optional(),
  showTimeArrived: yup.boolean().optional(),
  hideDownloads: yup.boolean().optional(),
  showDeleteButton: yup.boolean().optional(),
  showLocalCache: yup.boolean().optional(),
});

interface FormType extends yup.InferType<typeof validationSchema> {}

export const PanelOptions: React.FC = () => {
  const [options, setOptions] = useHashParamJson<Options>(
    "options",
    defaultOptions
  );

  const onSubmit = useCallback(
    (values: FormType) => {
      setOptions(values);
    },
    [setOptions]
  );

  const formik = useFormik({
    // @ts-ignore
    initialValues: options,
    onSubmit,
    validationSchema,
  });

  const handleSwitch = useCallback(
    (e: React.ChangeEvent<any>) => {
      formik.setFieldValue(e.target.id, e.target.checked);
      formik.submitForm();
    },
    [formik]
  );

  return (
    <>
      <br />
      <form onSubmit={formik.handleSubmit}>
        {Object.keys(defaultOptions)
          .sort()
          .map((optionKey) => (
            <FormControl key={optionKey}>
              <FormLabel htmlFor={optionKey}>
                {/* @ts-ignore */}
                {descriptions[optionKey]}
              </FormLabel>
              <Switch
                id={optionKey}
                onChange={handleSwitch}
                // @ts-ignore
                isChecked={formik.values[optionKey]}
              />
            </FormControl>
          ))}

        <Button type="submit" display="none">
          submit
        </Button>
      </form>
    </>
  );
};
