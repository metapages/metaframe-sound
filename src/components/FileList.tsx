import { useEffect, useState, useCallback } from "react";
import {
  HStack,
  IconButton,
  Show,
  Table,
  TableContainer,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import { useFileStore } from "../store";
import {
  ArrowDownIcon,
  ArrowForwardIcon,
  CheckIcon,
  CopyIcon,
  DeleteIcon,
  DownloadIcon,
  QuestionIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";
import prettyBytes from "pretty-bytes";
import { FileBlob } from "/@/components/FileBlob";
import { Options } from "/@/components/PanelOptions";
import { useHashParamJson } from "@metapages/hash-query";
import { useSendOutput } from "../hooks/useSendOutputs";

export const FileList: React.FC = () => {
  const [options] = useHashParamJson<Options>("options", {});
  const syncCachedFiles = useFileStore((state) => state.syncCachedFiles);
  const files = useFileStore((state) => state.files);

  useEffect(() => {
    syncCachedFiles();
  }, [syncCachedFiles]);

  const onClick = useCallback(async (fileBlob: FileBlob) => {
    // const file = await getFile(fileBlob.name);
    // if (file) {
    //   if (!fileBlob.urlEncoded) {
    //     fileBlob.urlEncoded = URL.createObjectURL(file);
    //   }
    //   setVideoSrc({ src: fileBlob.urlEncoded!, type: file.type });
    // }
  }, []);

  return (
    <HStack>
      <TableContainer>
        <Table variant="simple">
          {/* <TableCaption>Inputs</TableCaption> */}
          <Thead>
            <Tr>
              {options.pausedOutputs ? <Th></Th> : undefined}
              <Th>Name</Th>
              {options.showSizes ? <Th>Size</Th> : undefined}
              {options.showPreviews ? <Th>Preview</Th> : undefined}
              {options.showTimeArrived ? <Th>Arrived</Th> : undefined}
              <Th>Send</Th>
              {options.showDeleteButton ? <Th>Delete</Th> : undefined}
              {options.showLocalCache ? <Th>Local cache</Th> : undefined}
              {options.hideDownloads ? undefined : <Th>Download</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {files.map((file, i) => (
              <FileLineItem
                key={i}
                options={options}
                file={file}
                onClick={async () => {
                  onClick(file);
                }}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </HStack>
  );
};

const FileLineItem: React.FC<{
  file: FileBlob;
  onClick: () => void;
  options: Options;
}> = ({ file, options, onClick }) => {
  const { cached, name } = file;
  const send = useSendOutput(file.name);
  const deleteFile = useFileStore((state) => state.deleteFile);
  const cacheFile = useFileStore((state) => state.cacheFile);
  const getFileBlob = useFileStore((state) => state.getFileBlob);
  const copyFileToClipboard = useFileStore(
    (state) => state.copyFileToClipboard
  );
  const toast = useToast();

  const copyClipboard = useCallback(async () => {
    await copyFileToClipboard(file.name);
    toast({
      position: "top",
      title: "Copied to clipboard",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, [file, copyFileToClipboard, toast]);

  const refreshSize = useCallback(() => {
    getFileBlob(file.name);
  }, [file.name, getFileBlob]);

  const clickDownload = useCallback(async () => {
    const fileWithBlob = await getFileBlob(file.name);
    const fileBlob = fileWithBlob.file!;
    let objectUrl: string | undefined;
    try {
      objectUrl = URL.createObjectURL(fileBlob);
      const link = document.createElement("a");
      link.download = fileBlob.name;
      link.href = objectUrl;
      link.click();
      setTimeout(() => {
        URL.revokeObjectURL(objectUrl!);
      }, 1);
    } catch (err) {
      console.error(err);
    }
  }, [getFileBlob, file.name]);

  return (
    <Tr>
      {options.pausedOutputs ? (
        <Td>
          <WarningTwoIcon color="red" /> Paused outputs
        </Td>
      ) : undefined}

      <Td>{name}</Td>

      {options.showSizes ? (
        <Td>
          {file.size !== undefined ? (
            prettyBytes(file.size)
          ) : (
            <IconButton
              aria-label="refresh size"
              icon={<QuestionIcon />}
              onClick={refreshSize}
            />
          )}
        </Td>
      ) : undefined}

      {/* The field '_s:true' means the file is a serialized blob
            so we cannot copy binary  */}
      {options.showPreviews ? (
        <Td>
          {file.value === undefined ||
          file.value instanceof Blob ||
          file.value?._s === true ? (
            "binary"
          ) : (
            <>
              <Textarea
                readOnly
                resize="both"
                value={
                  file.value
                    ? JSON.stringify(file.value).substring(0, 100000)
                    : undefined
                }
              />
              <IconButton
                onClick={copyClipboard}
                aria-label="copy"
                icon={<CopyIcon />}
              />
            </>
          )}
        </Td>
      ) : undefined}

      {options.showTimeArrived ? (
        <Td>{file?.arrived?.toLocaleTimeString() ?? ""}</Td>
      ) : undefined}

      <Td>
        <IconButton
          aria-label="send"
          onClick={send}
          icon={<ArrowForwardIcon />}
        />
      </Td>

      {options.showDeleteButton ? (
        <Td>
          <IconButton
            aria-label="delete"
            onClick={() => deleteFile(name)}
            icon={<DeleteIcon />}
          />
        </Td>
      ) : undefined}

      {options.showLocalCache ? (
        <Td>
          {cached ? (
            <CheckIcon color="black" />
          ) : (
            <IconButton
              aria-label="cache"
              onClick={() => cacheFile(file)}
              icon={<ArrowDownIcon />}
            />
          )}
        </Td>
      ) : undefined}

      {options.hideDownloads ? undefined : (
        <Td>
          <IconButton
            aria-label="download"
            icon={<DownloadIcon />}
            onClick={clickDownload}
          />
        </Td>
      )}
    </Tr>
  );
};
