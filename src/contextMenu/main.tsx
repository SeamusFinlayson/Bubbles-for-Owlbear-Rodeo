import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from "react-dom/client";
import StatsMenuApp from "./StatsMenuApp";
import {
  getSelectedItems,
  parseItems,
} from "../metadataHelpers/itemMetadataHelpers";
import { addThemeToBody } from "@/colorHelpers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getName } from "@/metadataHelpers/nameHelpers";
import getGlobalSettings from "@/background/getGlobalSettings";

OBR.onReady(async () => {
  const [selectedItems, role, sceneMetadata, roomMetadata] = await Promise.all([
    getSelectedItems(),
    OBR.player.getRole(),
    OBR.scene.getMetadata(),
    OBR.room.getMetadata(),
  ]);

  const initialTokens = parseItems(selectedItems);
  const initialName = getName(selectedItems[0]);

  addThemeToBody();

  const initialNameTagsEnabled = (
    await getGlobalSettings(undefined, sceneMetadata, roomMetadata)
  ).settings.nameTags;

  if (selectedItems.length !== 1) {
    throw "Error: Invalid Tokens Selection";
  } else {
    // Render React component
    const root = createRoot(document.getElementById("app") as HTMLDivElement);
    root.render(
      <TooltipProvider>
        <StatsMenuApp
          initialToken={initialTokens[0]}
          initialTokenName={initialName}
          initialNameTagsEnabled={
            typeof initialNameTagsEnabled === "boolean"
              ? initialNameTagsEnabled
              : false
          }
          role={role}
        />
      </TooltipProvider>,
    );
  }
});
