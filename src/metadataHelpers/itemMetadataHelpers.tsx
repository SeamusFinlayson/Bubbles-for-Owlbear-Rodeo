import OBR, { isImage, Item } from "@owlbear-rodeo/sdk";

import {
  HEALTH_METADATA_ID,
  MAX_HEALTH_METADATA_ID,
  TEMP_HEALTH_METADATA_ID,
  ARMOR_CLASS_METADATA_ID,
  HIDE_METADATA_ID,
  GROUP_METADATA_ID,
  INDEX_METADATA_ID,
} from "./itemMetadataIds";
import Token from "./TokenType";
import {
  getPluginMetadata,
  readBooleanFromObject,
  readNumberFromObject,
} from "./metadataHelpers";

// parse stats

export async function getSelectedItems(selection?: string[]): Promise<Item[]> {
  if (selection === undefined) selection = await OBR.player.getSelection();
  if (selection === undefined) return [];
  const selectedItems = await OBR.scene.items.getItems(selection);
  return selectedItems;
}

export function parseItems(items: Item[]): Token[] {
  const validItems = items.filter((item) => itemFilter(item));

  const Tokens: Token[] = [];
  for (const item of validItems) {
    const metadata = getPluginMetadata(item.metadata);
    Tokens.push(
      tokenFactory(
        item,
        readNumberFromObject(metadata, HEALTH_METADATA_ID),
        readNumberFromObject(metadata, MAX_HEALTH_METADATA_ID),
        readNumberFromObject(metadata, TEMP_HEALTH_METADATA_ID),
        readNumberFromObject(metadata, ARMOR_CLASS_METADATA_ID),
        readBooleanFromObject(metadata, HIDE_METADATA_ID),
        readNumberFromObject(metadata, GROUP_METADATA_ID),
        readNumberFromObject(metadata, INDEX_METADATA_ID, -1),
      ),
    );
  }

  return Tokens;
}

/** Returns true for images on the mount and character layers */
export function itemFilter(item: Item) {
  return (
    isImage(item) && (item.layer === "CHARACTER" || item.layer === "MOUNT")
  );
}

export function getTokenStats(
  item: Item,
): [
  health: number,
  maxHealth: number,
  tempHealth: number,
  armorClass: number,
  statsVisible: boolean,
] {
  const metadata = getPluginMetadata(item.metadata);
  return [
    readNumberFromObject(metadata, HEALTH_METADATA_ID),
    readNumberFromObject(metadata, MAX_HEALTH_METADATA_ID),
    readNumberFromObject(metadata, TEMP_HEALTH_METADATA_ID),
    readNumberFromObject(metadata, ARMOR_CLASS_METADATA_ID),
    !readBooleanFromObject(metadata, HIDE_METADATA_ID),
  ];
}

export function tokenFactory(
  item: Item,
  health: number,
  maxHealth: number,
  tempHealth: number,
  armorClass: number,
  hideStats: boolean,
  group: number,
  index: number,
): Token {
  return {
    item,
    health,
    maxHealth,
    tempHealth,
    armorClass,
    hideStats,
    group,
    index,
  };
}
