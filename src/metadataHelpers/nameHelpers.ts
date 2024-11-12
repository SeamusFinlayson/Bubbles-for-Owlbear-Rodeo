import OBR, { Item } from "@owlbear-rodeo/sdk";
import { getSelectedItems } from "./itemMetadataHelpers";
import { getPluginId } from "@/getPluginId";

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
