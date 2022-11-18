import { CheckIcon, EditIcon, WarningIcon } from "@chakra-ui/icons";
import {
  Box,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useHashParamBoolean } from "@metapages/hash-query";
import prettyBytes from "pretty-bytes";
import { useCallback, useEffect } from "react";

import { useFileList } from "../hooks/useFileList";
import { useFileStore } from "../store";
import { FormUrlList } from "./FormUrlList";
import { FileBlob } from "/@/components/FileBlob";
import { useSendOutputs } from "/@/hooks/useSendOutputs";

export const FileList: React.FC = () => {
  const [hideMenu] = useHashParamBoolean("hidemenu");
  const files = useFileStore((state) => state.files);
  const deleteFile = useFileStore((state) => state.deleteFile);
  const addFile = useFileStore((state) => state.addFile);
  const { isOpen, onClose, onOpen } = useDisclosure();

  const sendFiles = useSendOutputs();
  const [filesFromUrl] = useFileList();

  useEffect(() => {
    // remove first
    files.forEach((existingFile) => {
      if (!filesFromUrl.find((f) => f === existingFile.url)) {
        deleteFile(existingFile.url);
      }
    });
    // then add new
    const added: string[] = [];
    filesFromUrl.forEach((f: string) => {
      if (!files.find((existingFile) => existingFile.url === f)) {
        addFile({ url: f });
        added.push(f);
      }
    });
    if (added.length > 0) {
      sendFiles(added);
    }
  }, [filesFromUrl, files, deleteFile, addFile, sendFiles]);

  return isOpen ? (
    <>
      <br />
      <FormUrlList onClose={onClose} />
    </>
  ) : (
    <VStack justifyContent="space-between" alignItems="flex-start">
      <TableContainer>
        <Table variant="simple">
          <Tbody>
            {files.map((file, i) => (
              <FileLineItem key={i} file={file} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      {hideMenu ? null : (
        <Box alignSelf="flex-start" p={2}>
          <IconButton
            variant="outline"
            border={3}
            icon={<EditIcon />}
            onClick={onOpen}
            aria-label={""}
          />
        </Box>
      )}
    </VStack>
  );
};

const FileLineItem: React.FC<{
  file: FileBlob;
}> = ({ file }) => {
  const { url } = file;

  return (
    <Tr>
      <Td>{url}</Td>
      <Td>{file.size !== undefined ? prettyBytes(file.size) : "none"}</Td>
      <Td>
        {file.sent ? (
          <CheckIcon color="green" />
        ) : file.error ? (
          <IconButton
            aria-label="status"
            onClick={() => {}}
            icon={<WarningIcon color="red" />}
          />
        ) : undefined}
      </Td>
    </Tr>
  );
};
