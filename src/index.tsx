import { createRoot } from "react-dom/client";
import { WithMetaframe } from "@metapages/metaframe-hook";
import localForage from "localforage";
import { ChakraProvider } from "@chakra-ui/react";
import { App } from "./App";

// for caching blobs
localForage.config({
  driver: localForage.INDEXEDDB,
  name: "metaframe-download",
  version: 1.0,
  storeName: "files", // Should be alphanumeric, with underscores.
  description: "Cached files",
});

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(
  <ChakraProvider>
    <WithMetaframe>
      <App />
    </WithMetaframe>
  </ChakraProvider>);
