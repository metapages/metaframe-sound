import { EditIcon } from "@chakra-ui/icons";
import {
  Box,
  IconButton,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Tr,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { useHashParamBoolean } from "@metapages/hash-query";
import { useCallback, useEffect } from "react";
import { FaPlay } from "react-icons/fa";
import { HiVolumeUp } from "react-icons/hi";

import { useFileListConfig } from "../hooks/useFileListConfig";
import { useFileStore } from "../store";
import { FormUrlList } from "./FormUrlList";
import { FileBlob } from "/@/components/FileBlob";
import { useMetaframe } from '@metapages/metaframe-hook';

export const FileList: React.FC = () => {
  const [hideMenu] = useHashParamBoolean("hidemenu");
  const files = useFileStore((state) => state.files);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const playFile = useFileStore((state) => state.playFile);

  const metaframeBlob = useMetaframe();
  useEffect(() => {
    if (!metaframeBlob.metaframe) {
      return;
    }
    return metaframeBlob.metaframe.onInput("play", playFile);
  }, [metaframeBlob.metaframe, playFile])


  // adding the files to the store is done in the hook
  useFileListConfig();

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
  const { url, label, playing, loaded } = file;
  const playFile = useFileStore((state) => state.playFile);
  const onClick = useCallback(() => {
    playFile(label);
  }, [label, playFile]);

  return (
    <Tr>
      <Td>
        <IconButton
          aria-label={"play"}
          onClick={onClick}
          disabled={!loaded}
          icon={playing ? <HiVolumeUp color="green" /> : <FaPlay />}
        />{" "}
      </Td>
      <Td>
        <Tag>{label}</Tag>
      </Td>
      <Td>{url}</Td>
    </Tr>
  );
};
