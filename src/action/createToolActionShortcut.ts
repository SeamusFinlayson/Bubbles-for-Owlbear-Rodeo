import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "@/getPluginId";
import { BROADCAST_CHANNEL, TOGGLE_ACTION_OPEN } from "@/action/helpers";
import menuIcon from "@/menuIcon";

export default async function createToolActionShortcut() {
  const actionID = getPluginId("shortcut");
  OBR.tool.createAction({
    id: actionID,
    icons: [
      {
        icon: menuIcon,
        label: "Open Stat Bubbles for D&D",
        filter: {
          roles: ["GM"],
          activeTools: [
            // "rodeo.owlbear.tool/move",
            "rodeo.owlbear.tool/select",
          ],
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
