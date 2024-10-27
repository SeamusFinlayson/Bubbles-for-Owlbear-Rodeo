import { addThemeToBody } from "@/colorHelpers";
import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from "react-dom/client";
import Settings from "./Settings";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";
import { getPluginId } from "@/getPluginId";
import { BROADCAST_CHANNEL, TOGGLE_ACTION_OPEN } from "@/damage-tool/helpers";

export const menuIcon = new URL(
  "../status.svg#icon",
  import.meta.url,
).toString();

OBR.onReady(async () => {
  addThemeToBody();
  createToolActionShortcut();

  const root = createRoot(document.getElementById("app") as HTMLDivElement);
  root.render(
    <React.StrictMode>
      <TooltipProvider delayDuration={150} disableHoverableContent>
        <Settings />
      </TooltipProvider>
    </React.StrictMode>,
  );
});

async function createToolActionShortcut() {
  const actionID = getPluginId("shortcut");
  OBR.tool.createAction({
    id: actionID,
    icons: [
      {
        icon: menuIcon,
        label: "Open Stat Bubbles for D&D",
        filter: {
          roles: ["GM"],
          activeTools: ["rodeo.owlbear.tool/select", "rodeo.owlbear.tool/move"],
        },
      },
    ],
    shortcut: "Shift + S",
    onClick: () => {
      OBR.broadcast.sendMessage(BROADCAST_CHANNEL, TOGGLE_ACTION_OPEN, {
        destination: "LOCAL",
      });
    },
  });
}
