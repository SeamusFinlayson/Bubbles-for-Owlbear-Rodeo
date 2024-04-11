import OBR, { Item } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import Token from "./TokenClass";

// parse stats

export async function getSelectedItems(): Promise<Item[]> {
  const selection = await OBR.player.getSelection();
  const selectedItems = await OBR.scene.items.getItems(selection);
  return selectedItems;
}

export async function parseSelectedTokens(
  mustHaveMaxHealth = false,
  selectedItems?: Item[],
): Promise<Token[]> {
  const selectedTokens: Token[] = [];

  // Get selected Items
  if (selectedItems === undefined) {
    selectedItems = await getSelectedItems();
  }

  for (const item of selectedItems) {
    // Get token metadata
    const metadata: any = item.metadata[getPluginId("metadata")];

    // Extract health metadata
    let health: number = NaN;
    try {
      health = parseFloat(metadata["health"]);
    } catch (error) {
      health = 0;
    }
    if (Number.isNaN(health)) {
      health = 0;
    }

    // Extract max health metadata
    let maxHealth: number = NaN;
    let hasMaxHealth: boolean;
    try {
      maxHealth = parseFloat(metadata["max health"]);
      hasMaxHealth = true;
    } catch (error) {
      hasMaxHealth = false;
      maxHealth = 0;
    }
    if (Number.isNaN(maxHealth)) {
      hasMaxHealth = false;
      maxHealth = 0;
    }

    // Extract temp health metadata
    let tempHealth: number = NaN;
    try {
      tempHealth = parseFloat(metadata["temporary health"]);
    } catch (error) {
      tempHealth = 0;
    }
    if (Number.isNaN(tempHealth)) {
      tempHealth = 0;
    }

    let armorClass: number = NaN;
    try {
      armorClass = parseFloat(metadata["armor class"]);
    } catch (error) {
      armorClass = 0;
    }
    if (Number.isNaN(armorClass)) {
      armorClass = 0;
    }

    let hideStats = false;
    try {
      hideStats = Boolean(metadata["hide"]).valueOf();
    } catch (error) {
      hideStats = false;
    }

    if (mustHaveMaxHealth) {
      // If the token has health and max health add it to the list of valid tokens
      if (hasMaxHealth && maxHealth !== 0) {
        selectedTokens.push(
          new Token(item, health, maxHealth, tempHealth, armorClass, hideStats),
        );
      }
    } else {
      selectedTokens.push(
        new Token(item, health, maxHealth, tempHealth, armorClass, hideStats),
      );
    }
  }

  return selectedTokens;
}

export function getTokenMetadata(
  item: Item,
): [
  health: number,
  maxHealth: number,
  tempHealth: number,
  armorClass: number,
  statsVisible: boolean,
] {
  const metadata: any = item.metadata[getPluginId("metadata")];

  //try to extract armor class metadata
  let armorClass: number;
  try {
    armorClass = parseFloat(metadata["armor class"]);
  } catch (error) {
    armorClass = 0;
  }
  if (Number.isNaN(armorClass)) {
    armorClass = 0;
  }

  //try to extract temporary health metadata
  let tempHealth: number;
  try {
    tempHealth = parseFloat(metadata["temporary health"]);
  } catch (error) {
    tempHealth = 0;
  }
  if (Number.isNaN(tempHealth)) {
    tempHealth = 0;
  }

  //try to extract health from metadata
  let health: number;
  let maxHealth: number;
  try {
    health = parseFloat(metadata["health"]);
    maxHealth = parseFloat(metadata["max health"]);
  } catch (error) {
    health = 0;
    maxHealth = 0;
  }
  if (Number.isNaN(health)) {
    health = 0;
  }
  if (Number.isNaN(maxHealth)) {
    maxHealth = 0;
  }

  //try to extract visibility from metadata
  let statsVisible: boolean;
  try {
    statsVisible = !metadata["hide"];
  } catch (error) {
    // catch type error
    if (error instanceof TypeError) {
      statsVisible = true;
    } else {
      throw error;
    }
  }

  return [health, maxHealth, tempHealth, armorClass, statsVisible];
}

// For name

export const NAME_METADATA_ID = "name";

export async function writeStringToItem(string: string, id: string) {
  // Get selected items
  const selection = await OBR.player.getSelection();
  const selectedItems = await OBR.scene.items.getItems(selection);

  // Throw error if more than one token selected
  if (selectedItems.length > 1) {
    throw (
      "Selection exceeded max length, expected 1, got: " + selectedItems.length
    );
  }

  await OBR.scene.items.updateItems(selectedItems, (items) => {
    for (let item of items) {
      item.metadata[getPluginId(id)] = string;
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
