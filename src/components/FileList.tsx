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
  WarningTwoIcon,
} from "@chakra-ui/icons";
import prettyBytes from "pretty-bytes";
import { FileBlob } from "/@/components/FileBlob";
import { Options } from "/@/components/PanelOptions";
import { useHashParamJson } from "@metapages/hash-query";
import { useSendOutput } from "../hooks/useSendOutputs";

const maxWidthForColumnCompute = 1000;

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

  const columns =
    5 +
    (options.pausedOutputs ? 1 : 0) +
    (options.showSizes ? 1 : 0) +
    (options.showTimeArrived ? 1 : 0);
  const pixelsPerColumn = Math.floor(maxWidthForColumnCompute / columns);
  let column = 1;

  return (
    <HStack>
      <TableContainer>
        <Table variant="simple">
          {/* <TableCaption>Inputs</TableCaption> */}
          <Thead>
            <Tr>
              {options.pausedOutputs ? (
                <Th id={`c${column++}`}></Th>
              ) : undefined}
              <Th id={`c${column++}`}>Name</Th>
              {options.showSizes ? (
                <Th id={`c${column++}`}>Size</Th>
              ) : undefined}
              {options.showPreviews ? (
                <Th id={`c${column++}`}>Preview</Th>
              ) : undefined}

              {options.showTimeArrived ? (
                <Th id={`c${column++}`}>Arrived</Th>
              ) : undefined}

              <Show breakpoint={`(min-width: ${pixelsPerColumn * column++}px)`}>
                <Th>Send</Th>
              </Show>

              <Show breakpoint={`(min-width: ${pixelsPerColumn * column++}px)`}>
                <Th>Delete</Th>
              </Show>

              <Show breakpoint={`(min-width: ${pixelsPerColumn * column++}px)`}>
                <Th>Local cache</Th>
              </Show>

              {/* <Show breakpoint={`(min-width: ${pixelsPerColumn * column++}px)`}>
                <Th>Download</Th>
              </Show> */}
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
  const copyFileToClipboard = useFileStore(
    (state) => state.copyFileToClipboard
  );
  const toast = useToast();

  // const getFile = useFileStore((state) => state.getFile);
  const [objectUrl, setObjectUrl] = useState<string | undefined>();
  const copyClipboard = useCallback(async () => {
    await copyFileToClipboard(file);
    toast({
      position: "top",
      title: "Copied to clipboard",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  }, [file, copyFileToClipboard, toast]);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | undefined;
    (async () => {
      try {
        // const file = await getFile(name);
        // if (cancelled) {
        //   return;
        // }
        // objectUrl = URL.createObjectURL(file);
        // setObjectUrl(objectUrl);
      } catch (err) {
        console.error(err);
      }
    })();
    return () => {
      cancelled = true;
      if (objectUrl) {
        // cleanup
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [name, setObjectUrl]);

  const columns =
    5 +
    (options.pausedOutputs ? 1 : 0) +
    (options.showSizes ? 1 : 0) +
    (options.showTimeArrived ? 1 : 0);
  const pixelsPerColumn = Math.floor(maxWidthForColumnCompute / columns);
  let column = 1;

  return (
    <Tr>
      {options.pausedOutputs ? (
        <Td id={`c${column++}`}>
          <WarningTwoIcon color="red" /> Paused outputs
        </Td>
      ) : undefined}

      <Td id={`c${column++}`}>{name}</Td>

      {options.showSizes ? (
        <Td id={`c${column++}`}>
          {file.value ? prettyBytes(JSON.stringify(file.value).length) : 0}
        </Td>
      ) : undefined}

      {options.showPreviews ? (
        <Td id={`c${column++}`}>
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
        </Td>
      ) : undefined}

      {options.showTimeArrived ? (
        <Td id={`c${column++}`}>{file?.arrived?.toLocaleTimeString() ?? ""}</Td>
      ) : undefined}

      <Show breakpoint={`(min-width: ${pixelsPerColumn * column++}px)`}>
        <Td>
          <IconButton
            aria-label="send"
            onClick={send}
            icon={<ArrowForwardIcon />}
          />
        </Td>
      </Show>

      <Show breakpoint={`(min-width: ${pixelsPerColumn * column++}px)`}>
        <Td>
          <IconButton
            aria-label="delete"
            onClick={() => deleteFile(name)}
            icon={<DeleteIcon />}
          />
        </Td>
      </Show>

      <Show breakpoint={`(min-width: ${pixelsPerColumn * column++}px)`}>
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
      </Show>

      {/* <Show breakpoint={`(min-width: ${pixelsPerColumn * column++}px)`}>
        <Td>
          <IconButton
            aria-label="download"
            icon={<DownloadIcon />}
            onClick={() => {
              if (!objectUrl) {
                return;
              }
              const link = document.createElement("a");
              link.download = `download.txt`;
              link.href = objectUrl;
              link.click();
            }}
          />
        </Td>
      </Show> */}
    </Tr>
  );
};
