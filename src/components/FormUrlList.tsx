import { useCallback } from "react";
import {
  IconButton,
  VStack,
  HStack,
  Input,
  InputGroup,
  Spacer,
  Button,
  Heading,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { FieldArray, Form, ErrorMessage, Formik } from "formik";
import * as yup from "yup";
import { useFileList } from "../hooks/useFileList";

const validationSchema = yup.object({
  files: yup.array().of(yup.string()),
});

interface FormType extends yup.InferType<typeof validationSchema> {}

export const FormUrlList: React.FC<{onClose:() => void}> = ({onClose}) => {
  const [files, setFiles] = useFileList();

  const onSubmit = useCallback(
    (values: FormType) => {
      const maybeFiles = values.files;
      const notEmpty: string[] = [];
      if (maybeFiles) {
        maybeFiles.forEach((f) => {
          if (f) {
            notEmpty.push(f);
          }
        });
      }
      setFiles(notEmpty);
      onClose();
    },
    [setFiles, onClose]
  );

  return (
    <VStack width="100%" alignItems="flex-start">
      <Heading size="sm">
        Download URLs{" "}
      </Heading>
      <VStack
        justifyContent="flex-start"
        borderWidth="1px"
        borderRadius="lg"
        p={2}
        width="100%"
        align="stretch"
      >
        <Formik
          initialValues={{files}}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          {({ values, handleSubmit }) => (
            <Form>
              <FieldArray name="files">
                {({ remove, push, replace }) => (
                  <>
                    {values.files.length > 0 &&
                      values.files.map((filestring, index) => (
                        <HStack key={index} width="100%" padding={1}>
                          <InputGroup>
                            <Input
                              name={`files.${index}`}
                              type="text"
                              value={filestring ?? ""}
                              onChange={(e) => {
                                replace(index, e.target.value);
                              }}
                            />
                            <ErrorMessage
                              name={`files.${index}`}
                              component="div"
                              className="field-error"
                            />
                          </InputGroup>
                          <Spacer />

                          <IconButton
                            aria-label="delete module"
                            icon={<DeleteIcon />}
                            onClick={() => {
                              remove(index);
                              handleSubmit();
                            }}
                          />
                        </HStack>
                      ))}
                    <br />

                    <HStack>
                      <Spacer />
                      <IconButton
                        verticalAlign="top"
                        aria-label="add module"
                        icon={<AddIcon />}
                        size="md"
                        onClick={() => push("")}
                        mr="4"
                      />

                      <Button type="submit" >Update</Button>
                    </HStack>
                  </>
                )}
              </FieldArray>
            </Form>
          )}
        </Formik>
      </VStack>
    </VStack>
  );
};
