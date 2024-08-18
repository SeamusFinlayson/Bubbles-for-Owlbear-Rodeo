import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import {
  ARMOR_CLASS_METADATA_ID,
  HEALTH_METADATA_ID,
  HIDE_METADATA_ID,
  MAX_HEALTH_METADATA_ID,
  SHOW_RAW_METADATA_ID,
  StatMetadataID,
  TEMP_HEALTH_METADATA_ID,
} from "../itemMetadataIds";

export async function writeInputValueToTokenMetadata(
  inputName: InputName,
  value: string | boolean,
): Promise<string | boolean> {
  let returnValue: number | boolean | string =
    typeof value === "string" ? parseFloat(value) : value;

  const id = convertInputNameToMetadataId(inputName);

  // Get selected items
  const selection = await OBR.player.getSelection();
  const selectedItems = await OBR.scene.items.getItems(selection);

  // Throw error if more than one token selected
  if (selectedItems.length > 1) {
    throw (
      "Selection exceeded max length, expected 1, got: " + selectedItems.length
    );
  }

  // Write metadata into items
  await OBR.scene.items.updateItems(selectedItems, (items) => {
    // Modify item
    for (let item of items) {
      if (typeof value === "boolean") {
        // Create new metadata
        let newMetadata = { [id]: value };

        // Get item metadata
        let retrievedMetadata: any;
        if (item.metadata[getPluginId("metadata")]) {
          retrievedMetadata = JSON.parse(
            JSON.stringify(item.metadata[getPluginId("metadata")]),
          );
        }

        // Combine metadata
        const combinedMetadata = { ...retrievedMetadata, ...newMetadata }; //overwrite only the modified value

        item.metadata[getPluginId("metadata")] = combinedMetadata;
      } else if (typeof value === "string") {
        const newValue = value;
        const newValueNumber = parseFloat(newValue);
        let newMetadata: StatsArray = { [id]: Math.trunc(newValueNumber) };

        let combinedMetadata: StatsArray;

        if (!item.metadata[getPluginId("metadata")]) {
          // Handle no previous metadata
          combinedMetadata = newMetadata;
        } else {
          const retrievedMetadata = JSON.parse(
            JSON.stringify(item.metadata[getPluginId("metadata")]),
          );

          if (isNaN(newValueNumber)) {
            // Handle invalid entry
            newMetadata = { [id]: 0 };
            console.log(inputName, value);
          }
          // Check if new value starts with addition or subtraction operator
          else if (newValue.startsWith("+") || newValue.startsWith("-")) {
            // Add to the previous value if both are valid
            let previousValue: unknown;
            try {
              previousValue = retrievedMetadata[id];
            } catch (error) {
              if (!(error instanceof TypeError)) throw error;
              previousValue = undefined;
            }
            console.log(previousValue);

            // Previous version erroneously stored some values as strings
            if (typeof previousValue === "string") {
              previousValue = parseFloat(previousValue);
            }

            if (typeof previousValue === "number" && !isNaN(previousValue)) {
              newMetadata = {
                [id]: Math.trunc(previousValue + Math.trunc(newValueNumber)),
              };
            }
          }

          combinedMetadata = { ...retrievedMetadata, ...newMetadata }; //overwrite only the updated item
        }

        combinedMetadata[id] = restrictValueRange(
          id,
          combinedMetadata[id] as number,
        );

        // Write the metadata into the item
        item.metadata[getPluginId("metadata")] = combinedMetadata;
        returnValue = combinedMetadata[id];
      } else {
        throw "Error: bad input type.";
      }
    }
  });

  if (typeof returnValue === "number") {
    returnValue = returnValue.toString();
  }

  return returnValue;
}

interface StatsArray {
  [index: string]: number | boolean;
}

export type InputName =
  | "health"
  | "maxHealth"
  | "tempHealth"
  | "armorClass"
  | "hideStats"
  | "showRaw";

const inputNames: InputName[] = [
  "health",
  "maxHealth",
  "tempHealth",
  "armorClass",
  "hideStats",
  "showRaw",
];

function restrictValueRange(id: string, value: number): number {
  switch (id) {
    case HEALTH_METADATA_ID:
    case MAX_HEALTH_METADATA_ID:
      if (value > 9999) {
        value = 9999;
      } else if (value < -999) {
        value = -999;
      }
      break;
    case TEMP_HEALTH_METADATA_ID:
    case ARMOR_CLASS_METADATA_ID:
      if (value > 999) {
        value = 999;
      } else if (value < -999) {
        value = -999;
      }
      break;
    default:
      break;
  }
  return value;
}

export function isInputName(id: string): id is InputName {
  return inputNames.includes(id as InputName);
}

function convertInputNameToMetadataId(id: InputName): StatMetadataID {
  switch (id) {
    case "health":
      return HEALTH_METADATA_ID;
    case "maxHealth":
      return MAX_HEALTH_METADATA_ID;
    case "tempHealth":
      return TEMP_HEALTH_METADATA_ID;
    case "armorClass":
      return ARMOR_CLASS_METADATA_ID;
    case "hideStats":
      return HIDE_METADATA_ID;
    case "showRaw":
      return SHOW_RAW_METADATA_ID;
  }
}
