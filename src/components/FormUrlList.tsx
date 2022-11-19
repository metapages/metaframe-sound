import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Button,
  Heading,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { FieldArray, Form, Formik } from "formik";
import { useCallback } from "react";
import * as yup from "yup";

import {
  FileListConfig,
  FileListItem,
  useFileListConfig,
} from "../hooks/useFileListConfig";

const validationSchemaFile = yup.object({
  url: yup.string(),
  label: yup.string(),
});

const validationSchema = yup.object({
  files: yup.array().of(validationSchemaFile),
});

interface FormType extends yup.InferType<typeof validationSchema> {}

export const FormUrlList: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [filesConfig, setFilesConfig] = useFileListConfig();

  const onSubmit = useCallback(
    (values: FormType) => {
      const maybeFiles = values.files;
      const notEmpty: FileListItem[] = [];
      if (maybeFiles) {
        maybeFiles.forEach((f) => {
          if (f) {
            notEmpty.push({ url: f.url || "", label: f.label || "" });
          }
        });
      }
      const newConfig: FileListConfig = {
        files: notEmpty,
      };
      setFilesConfig(newConfig);
      onClose();
    },
    [setFilesConfig, onClose]
  );

  return (
    <VStack width="100%" alignItems="flex-start">
      <Heading size="sm">Sound clip URLs </Heading>
      <VStack
        justifyContent="flex-start"
        borderWidth="1px"
        borderRadius="lg"
        p={2}
        width="100%"
        align="stretch"
      >
        <Formik
          initialValues={{ files: filesConfig.files }}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
        >
          {({ values, handleChange }) => (
            <Form>
              <FieldArray name="files">
                {({ remove, push }) => (
                  <>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>Playing</Th>
                            <Th>Label</Th>
                            <Th> URL</Th>
                            <Th> </Th>
                          </Tr>
                        </Thead>

                        <Tbody>
                          {values.files
                            .sort((f1, f2) => f1.label.localeCompare(f2.label))
                            .map((file, index) => (
                              <Tr key={index}>
                                <Td>Playing</Td>
                                <Td>
                                  <InputGroup>
                                    <Input
                                      name={`files[${index}].label`}
                                      type="text"
                                      value={file.label ?? ""}
                                      onChange={handleChange}
                                    />
                                  </InputGroup>
                                </Td>
                                <Td>
                                  <InputGroup>
                                    <Input
                                      name={`files[${index}].url`}
                                      type="text"
                                      value={file.url ?? ""}
                                      onChange={handleChange}
                                    />
                                  </InputGroup>
                                </Td>
                                <Td>
                                  <IconButton
                                    aria-label="delete module"
                                    icon={<DeleteIcon />}
                                    onClick={() => {
                                      remove(index);
                                    }}
                                  />
                                </Td>
                              </Tr>
                            ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                    <HStack p={2}>
                      <IconButton
                        verticalAlign="top"
                        aria-label="add module"
                        icon={<AddIcon />}
                        size="md"
                        onClick={() => push({ url: "", label: "" })}
                        mr="4"
                      />

                      <Button type="submit">Update</Button>
                      <Spacer />
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
