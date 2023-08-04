import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

import icon from "./status.svg";

/**
 * This file represents the background script run when the plugin loads.
 * It creates the context menu item for the status ring.
 */

OBR.onReady(() => {
  OBR.contextMenu.create({
    id: getPluginId("menu"),
    icons: [
      {
        icon,
        label: "Trackers",
        filter: {
          every: [
            { key: "type", value: "IMAGE" },
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT", coordinator: "||" },
            { key: "layer", value: "PROP", coordinator: "||" },
          ],
          permissions: ["UPDATE"],
          max: 1,
        },
      },
    ],
    onClick(_context, elementId) {
      OBR.popover.open({
        id: getPluginId("number-bubbles"),
        url: "/",
        height: 60,
        width: 310,
        anchorElementId: elementId,
        hidePaper: false,
        //anchorOrigin: {vertical: "BOTTOM", horizontal: "LEFT"}
        //transformOrigin: {vertical: "TOP", horizontal: "RIGHT"}
      });
    },
    shortcut: "Shift + S"
  });
});
