import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from "react-dom/client";
import StatsMenuApp from "./StatsMenuApp";
import {
  getSelectedItems,
  parseItems,
} from "../metadataHelpers/itemMetadataHelpers";
import { getPluginId } from "../getPluginId";
import { addThemeToBody } from "@/colorHelpers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getName } from "@/metadataHelpers/nameHelpers";

OBR.onReady(async () => {
  const [selectedItems, role, sceneMetadata] = await Promise.all([
    getSelectedItems(),
    OBR.player.getRole(),
    OBR.scene.getMetadata(),
  ]);

  const initialTokens = parseItems(selectedItems);
  const initialName = getName(selectedItems[0]);

  addThemeToBody();

  let initialNameTagsEnabled: unknown = (sceneMetadata as any)[
    getPluginId("metadata")
  ]?.["name-tags"];

  if (selectedItems.length !== 1) {
    throw "Error: Invalid Tokens Selection";
  } else {
    // Render React component
    const root = createRoot(
      document.getElementById("mother-flex") as HTMLDivElement,
    );
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
