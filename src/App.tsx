import {
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
import {
  HamburgerIcon,
  ViewIcon,
  EditIcon,
  InfoIcon,
  AddIcon,
} from "@chakra-ui/icons";
import { useHashParamBoolean, useHashParamInt } from "@metapages/hash-query";
import { useCallback } from "react";
import { PanelHelp } from "/@/components/PanelHelp";
import { PanelOptions } from "/@/components/PanelOptions";
import { PanelMain } from "/@/components/PanelMain";
import { PanelUpload } from "/@/components/PanelUpload";
import { useMetaframeInputsPassthrough } from "/@/hooks/useMetaframeInputsPassthrough";
import "/@/app.css";

export const App: React.FC = () => {
  const [hideMenu, sethideMenu] = useHashParamBoolean("hidemenu");
  const [tabIndex, setTabIndex] = useHashParamInt("tab", 0);
  const toggleMenu = useCallback(() => {
    sethideMenu(!hideMenu);
  }, [hideMenu, sethideMenu]);
  useMetaframeInputsPassthrough();

  const ButtonTabsToggle = (
    <IconButton
      style={{zIndex:10}}
      aria-label="options"
      variant="ghost"
      onClick={toggleMenu}
      icon={<HamburgerIcon />}
    />
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
        {tabIndex === 1 ? <PanelUpload /> : <PanelMain />}
      </>
    );
  }
  return (
    <Tabs index={tabIndex} onChange={setTabIndex}>
      <TabList>
        <Tab>
          <ViewIcon /> &nbsp; Inputs
        </Tab>
        <Tab>
          <AddIcon /> &nbsp; Upload
        </Tab>
        <Tab>
          <EditIcon /> &nbsp; Options
        </Tab>
        <Tab>
          <InfoIcon />
          &nbsp; Help
        </Tab>
        <Spacer /> {ButtonTabsToggle}
      </TabList>

      <TabPanels>
        <TabPanel>
          <PanelMain />
        </TabPanel>
        <TabPanel>
          <PanelUpload />
        </TabPanel>
        <TabPanel>
          <PanelOptions />
        </TabPanel>
        <TabPanel>
          <PanelHelp />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
