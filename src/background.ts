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
    shortcut: "Shift + S",
    embed: {
      url: "/playerPopover.html",
      height: 82,
    }
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
    shortcut: "Shift + S",
    embed: {
      url: "/popover.html",
      height: 132,
    }
  });

  //startHealthBars(await OBR.scene.isReady());
  initScene();
});