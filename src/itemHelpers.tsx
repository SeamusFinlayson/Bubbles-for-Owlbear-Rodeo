import OBR, { isImage, Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import Token from "./TokenClass";
import {
  HEALTH_METADATA_ID,
  MAX_HEALTH_METADATA_ID,
  TEMP_HEALTH_METADATA_ID,
  ARMOR_CLASS_METADATA_ID,
  HIDE_METADATA_ID,
} from "./itemMetadataIds";

// parse stats

export async function getSelectedItems(selection?: string[]): Promise<Item[]> {
  if (selection === undefined) selection = await OBR.player.getSelection();
  if (selection === undefined) return [];
  const selectedItems = await OBR.scene.items.getItems(selection);
  return selectedItems;
}

function getNumberFromMetadata(
  metadata: unknown,
  metadataId: string,
  fallback = 0,
) {
  try {
    let value = parseFloat((metadata as Record<string, string>)[metadataId]);
    if (Number.isNaN(value)) return fallback;
    return value;
  } catch (error) {
    return fallback;
  }
}

function getBooleanFromMetadata(
  metadata: unknown,
  metadataId: string,
  fallback = false,
) {
  try {
    return Boolean((metadata as Record<string, boolean>)[metadataId]).valueOf();
  } catch (error) {
    return fallback;
  }
}

export function parseItems(items: Item[]): Token[] {
  const validItems = items.filter((item) => itemFilter(item));

  const Tokens: Token[] = [];
  for (const item of validItems) {
    const metadata = item.metadata[getPluginId("metadata")];
    Tokens.push(
      new Token(
        item,
        getNumberFromMetadata(metadata, HEALTH_METADATA_ID),
        getNumberFromMetadata(metadata, MAX_HEALTH_METADATA_ID),
        getNumberFromMetadata(metadata, TEMP_HEALTH_METADATA_ID),
        getNumberFromMetadata(metadata, ARMOR_CLASS_METADATA_ID),
        getBooleanFromMetadata(metadata, HIDE_METADATA_ID),
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
  const metadata = item.metadata[getPluginId("metadata")];
  return [
    getNumberFromMetadata(metadata, HEALTH_METADATA_ID),
    getNumberFromMetadata(metadata, MAX_HEALTH_METADATA_ID),
    getNumberFromMetadata(metadata, TEMP_HEALTH_METADATA_ID),
    getNumberFromMetadata(metadata, ARMOR_CLASS_METADATA_ID),
    !getBooleanFromMetadata(metadata, HIDE_METADATA_ID),
  ];
}

// For name
export const NAME_METADATA_ID = "name";
export async function writeNameToSelectedItem(
  name: string,
  updateName = false,
) {
  // Get selected items
  const selectedItems = await getSelectedItems();

  // Throw error if more than one token selected
  if (selectedItems.length !== 1) {
    throw (
      "Selection exceeded max length, expected 1, got: " + selectedItems.length
    );
  }

  await OBR.scene.items.updateItems(selectedItems, (items) => {
    for (let item of items) {
      item.metadata[getPluginId(NAME_METADATA_ID)] = name;
      if (updateName) item.name = name;
    }
  });
}

export function getName(item: Item, useDefaultAsFallback = false): string {
  const name = item.metadata[getPluginId(NAME_METADATA_ID)];
  if (useDefaultAsFallback && (typeof name !== "string" || name === ""))
    return item.name;
  if (typeof name !== "string") return "";
  return name;
}

export async function getSelectedItemNameProperty() {
  const selectedItems = await getSelectedItems();

  // Throw error if more than one token selected
  if (selectedItems.length !== 1) {
    throw (
      "Selection exceeded max length, expected 1, got: " + selectedItems.length
    );
  }

  return selectedItems[0].name;
}
