import OBR from "@owlbear-rodeo/sdk";
import startBackground from "./statAttachments";
import { getPluginId } from "@/getPluginId";
import { BROADCAST_CHANNEL, TOGGLE_ACTION_OPEN } from "@/damage-tool/helpers";
export const menuIcon = new URL(
  "../status.svg#icon",
  import.meta.url,
).toString();

/**
 * This file represents the background script run when the plugin loads.
 * It creates the context menu items.
 */

OBR.onReady(async () => {
  printVersionToConsole();
  startBackground();
  createToolActionShortcut();
});

function printVersionToConsole() {
  fetch("/manifest.json")
    .then((response) => response.json())
    .then((json) =>
      console.log(json["name"] + " - version: " + json["version"]),
    );
}

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
  OBR.tool.remove("com.measure-extension/tool");
  console.log(await OBR.tool.getActiveTool());
}
