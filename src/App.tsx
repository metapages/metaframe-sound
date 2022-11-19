import "/@/app.css";

import { HamburgerIcon, InfoIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Center,
  HStack,
  IconButton,
  Show,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { useHashParamBoolean, useHashParamInt } from "@metapages/hash-query";
import { useCallback } from "react";
import { HiVolumeUp } from "react-icons/hi";

import { PanelHelp } from "/@/components/PanelHelp";
import { FileList } from "/@/components/FileList";

export const App: React.FC = () => {
  const [hideMenu, sethideMenu] = useHashParamBoolean("hidemenu");
  const [tabIndex, setTabIndex] = useHashParamInt("tab", 0);
  const toggleMenu = useCallback(() => {
    sethideMenu(!hideMenu);
  }, [hideMenu, sethideMenu]);

  const ButtonTabsToggle = (
    <Center>
      <IconButton
        p={3}
        style={{ zIndex: 10 }}
        aria-label="options"
        variant="ghost"
        onClick={toggleMenu}
        icon={<HamburgerIcon />}
      />
    </Center>
  );

  if (hideMenu) {
    return (
      <>
        <HStack
          style={{ position: "absolute" }}
          width="100%"
          justifyContent="flex-end"
        >
          <Spacer />
          <Show breakpoint="(min-width: 200px)">{ButtonTabsToggle}</Show>
        </HStack>
        <FileList />
      </>
    );
  }
  return (
    <Tabs index={tabIndex} onChange={setTabIndex}>
      <TabList>
        <Tab>
          <HiVolumeUp /> &nbsp; Sounds
        </Tab>
        <Tab>
          <InfoIcon />
          &nbsp; Help
        </Tab>
        <Spacer /> {ButtonTabsToggle}
      </TabList>

      <TabPanels>
        <TabPanel>
          <FileList />
        </TabPanel>

        <TabPanel>
          <PanelHelp />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
