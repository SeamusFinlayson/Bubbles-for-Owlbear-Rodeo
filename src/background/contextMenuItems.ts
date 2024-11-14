import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import menuIcon from "@/menuIcon";
import { Settings } from "@/metadataHelpers/settingMetadataHelpers";

const NAME_HEIGHT = 40;
const STATS_HEIGHT = 84;
const HIDE_HEIGHT = 50;
const BOTTOM_PADDING = 2;

export default async function createContextMenuItems(
  settings: Settings,
  themeMode: "DARK" | "LIGHT",
) {
  let menuHeight = STATS_HEIGHT + BOTTOM_PADDING;
  if (settings.nameTags) menuHeight += NAME_HEIGHT;

  createPlayerMenu(themeMode, menuHeight);
  createGmMenu(themeMode, menuHeight + HIDE_HEIGHT);
  // createDamageToolContextItem(themeMode);
}

function createPlayerMenu(
  themeMode: "DARK" | "LIGHT",
  playerMenuHeight: number,
) {
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
            { key: "layer", value: "MOUNT" },
            {
              key: [
                "metadata",
                "com.owlbear-rodeo-bubbles-extension/metadata",
                "hide",
              ],
              value: true,
              operator: "!=",
            },
          ],
          permissions: ["UPDATE"],
          roles: ["PLAYER"],
          max: 1,
        },
      },
    ],
    shortcut: "Shift + S",
    embed: {
      url: `/src/contextMenu/contextMenu.html?themeMode=${themeMode}`,
      height: playerMenuHeight,
    },
  });
}

function createGmMenu(themeMode: "DARK" | "LIGHT", gmMenuHeight: number) {
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
            { key: "layer", value: "MOUNT" },
          ],
          roles: ["GM"],
          max: 1,
        },
      },
    ],
    shortcut: "Shift + S",
    embed: {
      url: `/src/contextMenu/contextMenu.html?themeMode=${themeMode}`,
      height: gmMenuHeight,
    },
  });
}
