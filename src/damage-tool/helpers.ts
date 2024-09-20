import Token from "@/TokenClass";
import OBR, { Item } from "@owlbear-rodeo/sdk";
import {
  calculateNewHealth,
  calculateScaledHealthDiff,
} from "./healthCalculations";
import { HEALTH_METADATA_ID, TEMP_HEALTH_METADATA_ID } from "@/itemMetadataIds";
import { getPluginId } from "@/getPluginId";

export const DEFAULT_DAMAGE_SCALE = 3;
export const DEFAULT_INCLUDED = true;

export const getDamageScaleOption = (
  key: string,
  map: Map<string, number>,
): number => {
  const value = map.get(key);
  if (typeof value !== "number") return DEFAULT_DAMAGE_SCALE;
  return value;
};

export const getIncluded = (key: string, map: Map<string, boolean>) => {
  const value = map.get(key);
  if (typeof value !== "boolean") return DEFAULT_INCLUDED;
  return value;
};

export function applyHealthDiffToItems(
  healthDiff: number,
  includedItems: Map<string, boolean>,
  damageScaleSettings: Map<string, number>,
  tokens: Token[],
) {
  const validItems: Item[] = [];
  tokens.forEach((token) => {
    validItems.push(token.item);
  });

  OBR.scene.items.updateItems(validItems, (items) => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id !== tokens[i].item.id) {
        throw "Error: Item mismatch in Stat Bubbles Damage Tool, could not update token.";
      }

      const included = getIncluded(tokens[i].item.id, includedItems);
      const scaledHealthDiff = calculateScaledHealthDiff(
        included
          ? getDamageScaleOption(tokens[i].item.id, damageScaleSettings)
          : 0,
        healthDiff,
      );

      // Set new health and temp health values
      const [newHealth, newTempHealth] = calculateNewHealth(
        tokens[i].health.valueOf(),
        tokens[i].maxHealth.valueOf(),
        tokens[i].tempHealth.valueOf(),
        scaledHealthDiff,
      );

      const newMetadata = {
        [HEALTH_METADATA_ID]: newHealth,
        [TEMP_HEALTH_METADATA_ID]: newTempHealth,
      };

      let retrievedMetadata: any;
      if (items[i].metadata[getPluginId("metadata")]) {
        retrievedMetadata = JSON.parse(
          JSON.stringify(items[i].metadata[getPluginId("metadata")]),
        );
      }

      const combinedMetadata = { ...retrievedMetadata, ...newMetadata }; //overwrite only the modified value

      items[i].metadata[getPluginId("metadata")] = combinedMetadata;
    }
  });
}
