import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import icon from "./status.svg";
import { updateHealthBars } from "./helpers";

/**
 * This file represents the background script run when the plugin loads.
 * It creates the context menu item for the status ring.
 */

OBR.onReady( async () => {

  fetch("./manifest.json")
    .then((response) => response.json())
    .then((json) => console.log(json["name"] + " - version: " + json["version"]));

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
            { key: "layer", value: "PROP" },
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
        width: 430,
        anchorElementId: elementId,
        //hidePaper: false,
        //anchorOrigin: {vertical: "BOTTOM", horizontal: "LEFT"}
        //transformOrigin: {vertical: "TOP", horizontal: "RIGHT"}
      });
    },
    shortcut: "Shift + S"
  });

    //render all health bars locally 
    OBR.scene.onReadyChange( (ready) => {
      if (ready) {
        updateHealthBars();
      }
    });
});