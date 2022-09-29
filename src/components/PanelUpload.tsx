import { useCallback, useState } from "react";
import { VStack } from "@chakra-ui/react";
import { Dropzone, FileItem, FileValidated } from "@dropzone-ui/react";
import { useFileStore } from "../store";
import { possiblySerializeValueToDataref } from "@metapages/metapage";

export const PanelUpload: React.FC = () => {
  const [ files, setFiles ] = useState<FileValidated[]>([]);
  const addStoreFile = useFileStore((state) => state.addFile);
  const storeFiles = useFileStore((state) => state.files);

  const updateFiles = useCallback(
    async (incomingFiles: FileValidated[]) => {
      for (const file of incomingFiles) {
        if (!storeFiles.find(f => f.name === file.file.name)) {
          const serializedFile = await possiblySerializeValueToDataref(file.file);
          addStoreFile({
            name: file.file.name,
            file: file.file,
            value: serializedFile,
            size: file.file.size,
            arrived: new Date(),
            cached: false,
          });
        }
      }
      setFiles(incomingFiles);
    },
    [setFiles, storeFiles, addStoreFile]
  );

  const removeFile = useCallback(
    (id: string | number | undefined) => {
      setFiles(files.filter((x) => x.file.name !== id));
    },
    [files, setFiles]
  );

  return (
    <VStack>
      {/* @ts-ignore */}
      <Dropzone
        style={{ minWidth: "505px" }}
        onChange={updateFiles}
        value={files}
      >
        {files.length > 0 &&
          files.map((file, i) => (
            <FileItem {...file} onDelete={removeFile} key={i} info />
          ))}
      </Dropzone>
    </VStack>
  );
};
