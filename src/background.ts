import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import menuIcon from "./status.svg";
import { initScene } from "./helpers";

/**
 * This file represents the background script run when the plugin loads.
 * It creates the context menu items.
 */

OBR.onReady( async () => {

  fetch("./manifest.json")
  .then((response) => response.json())
  .then((json) => console.log(json["name"] + " - version: " + json["version"]));

  //create player context menu icon
  OBR.contextMenu.create({
    id: getPluginId("player-menu"),
    icons: [
      {
        icon: menuIcon,
        label: "Edit Stats",
        filter: {
          every: [
            { key: "type", value: "IMAGE" },
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT", coordinator: "||" },
            { key: "layer", value: "PROP" },
            { key: ["metadata", "com.owlbear-rodeo-bubbles-extension/metadata", "hide"], value: true, operator: "!="},
          ],
          permissions: ["UPDATE"],
          roles: ["PLAYER"],
          max: 1,
        },
      },
    ],
    onClick(_context, elementId) {
      OBR.popover.open({
        id: getPluginId("number-bubbles"),
        url: "/playerPopover.html",
        height: 54,
        width: 313,
        anchorElementId: elementId,
      });
    },
    shortcut: "Shift + S"
  });

  //create GM context menu icon
  OBR.contextMenu.create({
    id: getPluginId("gm-menu"),
    icons: [
      {
        icon: menuIcon,
        label: "Edit Stats",
        filter: {
          every: [
            { key: "type", value: "IMAGE" },
            { key: "layer", value: "CHARACTER", coordinator: "||" },
            { key: "layer", value: "MOUNT", coordinator: "||" },
            { key: "layer", value: "PROP" },
          ],
          roles: ["GM"],
          max: 1,
        },
      },
    ],
    onClick(_context, elementId) {
      OBR.popover.open({
        id: getPluginId("number-bubbles"),
        url: "/popover.html",
        height: 54,
        width: 400,
        anchorElementId: elementId,
        //hidePaper: false,
        //anchorOrigin: {vertical: "BOTTOM", horizontal: "LEFT"}
        //transformOrigin: {vertical: "TOP", horizontal: "RIGHT"}
      });
    },
    shortcut: "Shift + S"
  });

  //startHealthBars(await OBR.scene.isReady());
  initScene();
});