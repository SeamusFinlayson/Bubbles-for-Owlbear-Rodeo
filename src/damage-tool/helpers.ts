import Token from "@/TokenClass";
import OBR, { Math2, Metadata, Vector2 } from "@owlbear-rodeo/sdk";
import {
  calculateNewHealth,
  calculateScaledHealthDiff,
} from "./healthCalculations";
import {
  HEALTH_METADATA_ID,
  StatMetadataID,
  TEMP_HEALTH_METADATA_ID,
} from "@/itemMetadataIds";
import { getPluginId } from "@/getPluginId";
import {
  Action,
  BulkEditorState,
  StampedDiceRoll,
  StatOverwriteData,
} from "./types";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";

/* Items */

export const DEFAULT_DAMAGE_SCALE = 3;
export const DEFAULT_INCLUDED = false;

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

export async function applyHealthDiffToItems(
  healthDiff: number,
  includedItems: Map<string, boolean>,
  damageScaleSettings: Map<string, number>,
  tokens: Token[],
) {
  await OBR.scene.items.updateItems(
    tokens.map((token) => token.item),
    (items) => {
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
    },
  );
}

export async function overwriteStats(
  statOverwrites: StatOverwriteData,
  includedItems: Map<string, boolean>,
  tokens: Token[],
) {
  await OBR.scene.items.updateItems(
    tokens.map((token) => token.item),
    (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id !== tokens[i].item.id) {
          throw "Error: Item mismatch in Stat Bubbles Damage Tool, could not update token.";
        }

        const included = getIncluded(tokens[i].item.id, includedItems);

        if (included) {
          let newMetadata = {};
          const stats: [string, StatMetadataID][] = [
            [statOverwrites.hitPoints, "health"],
            [statOverwrites.maxHitPoints, "max health"],
            [statOverwrites.tempHitPoints, "temporary health"],
            [statOverwrites.armorClass, "armor class"],
          ];

          for (const stat of stats) {
            if (stat[0] !== "") {
              const value = parseFloat(stat[0]);
              if (Number.isInteger(value)) {
                newMetadata = { ...newMetadata, [stat[1]]: value };
              }
            }
          }

          let retrievedMetadata: any;
          if (items[i].metadata[getPluginId("metadata")]) {
            retrievedMetadata = JSON.parse(
              JSON.stringify(items[i].metadata[getPluginId("metadata")]),
            );
          }

          const combinedMetadata = { ...retrievedMetadata, ...newMetadata }; //overwrite only the modified value

          items[i].metadata[getPluginId("metadata")] = combinedMetadata;
        }
      }
    },
  );
}

export function writeTokenSortingToItems(tokens: Token[]) {
  OBR.scene.items.updateItems(
    tokens.map((token) => token.item),
    (items) => {
      for (let i = 0; i < items.length; i++) {
        if (items[i].id !== tokens[i].item.id) {
          throw "Error: Item mismatch in Stat Bubbles Damage Tool, could not update token.";
        }

        let newMetadata = {
          // group: tokens[i].group,
          index: tokens[i].index,
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
    },
  );
}

/* Dice */

const DICE_METADATA_ID = getPluginId("diceRolls");

export async function setSceneRolls(rolls: StampedDiceRoll[]) {
  await OBR.scene.setMetadata({ [DICE_METADATA_ID]: rolls });
}

export async function getRollsFromScene(sceneMetadata?: Metadata) {
  if (sceneMetadata === undefined)
    sceneMetadata = await OBR.scene.getMetadata();
  const diceRolls = sceneMetadata[DICE_METADATA_ID];
  if (diceRolls === undefined) return [];
  if (!isDiceRollArray(diceRolls)) throw "Error: invalid dice roll array";
  return diceRolls;
}

function isDiceRollArray(rolls: unknown): rolls is StampedDiceRoll[] {
  if (!Array.isArray(rolls)) return false;
  for (const roll of rolls) {
    if (typeof roll?.timeStamp !== "number") return false;
    if (typeof roll?.total !== "number") return false;
    if (typeof roll?.roll !== "string") return false;
  }
  return true;
}

export function reducer(
  state: BulkEditorState,
  action: Action,
): BulkEditorState {
  switch (action.type) {
    case "set-operation":
      return {
        ...state,
        operation: action.operation,
        ...(state.operation !== action.operation
          ? {
              damageScaleOptions: new Map<string, number>(),
              includedItems:
                action.operation === "none"
                  ? new Map<string, boolean>()
                  : state.includedItems,
            }
          : {}),
      };
    case "set-rolls":
      return { ...state, rolls: action.rolls };
    case "add-roll":
      const roll = new DiceRoll(action.diceExpression);
      const rolls = [
        {
          timeStamp: Date.now(),
          total: roll.total,
          roll: roll.toString(),
        },
        ...state.rolls.splice(0, 19),
      ];
      setSceneRolls(rolls);
      setTimeout(
        () => action.dispatch({ type: "set-animate-roll", animateRoll: false }),
        500,
      );
      return {
        ...state,
        rolls: rolls,
        animateRoll: true,
      };
    case "set-value":
      return { ...state, value: action.value };
    case "set-animate-roll":
      return { ...state, animateRoll: action.animateRoll };
    case "set-stat-overwrites":
      return { ...state, statOverwrites: action.statOverWrites };
    case "clear-stat-overwrites":
      return { ...state, statOverwrites: unsetStatOverwrites() };
    case "set-hit-points-overwrite":
      return {
        ...state,
        statOverwrites: {
          ...state.statOverwrites,
          hitPoints: action.hitPointsOverwrite,
        },
      };
    case "set-max-hit-points-overwrite":
      return {
        ...state,
        statOverwrites: {
          ...state.statOverwrites,
          maxHitPoints: action.maxHitPointsOverwrite,
        },
      };
    case "set-temp-hit-points-overwrite":
      return {
        ...state,
        statOverwrites: {
          ...state.statOverwrites,
          tempHitPoints: action.tempHitPointsOverwrite,
        },
      };
    case "set-armor-class-overwrite":
      return {
        ...state,
        statOverwrites: {
          ...state.statOverwrites,
          armorClass: action.armorClassOverwrite,
        },
      };
    case "set-damage-scale-options":
      return {
        ...state,
        damageScaleOptions: new Map(action.damageScaleOptions),
      };
    case "set-included-items":
      return {
        ...state,
        includedItems: new Map(action.includedItems),
      };
    case "set-show-items":
      return { ...state, showItems: action.showItems };
    default:
      console.log("unhandled action");
      return state;
  }
}

export const unsetStatOverwrites = () => {
  return {
    hitPoints: "",
    maxHitPoints: "",
    tempHitPoints: "",
    armorClass: "",
  };
};

export async function handleTokenClicked(itemId: string, replace: boolean) {
  const selectedItems = await OBR.player.getSelection();
  if (selectedItems && selectedItems.includes(itemId))
    OBR.player.deselect([itemId]);
  else OBR.player.select([itemId], replace);
}

async function deselectText() {
  // Deselect the list item text
  window.getSelection()?.removeAllRanges();
}

export async function focusItem(itemId: string) {
  // User may have selected text by double clicking on the initiative item
  deselectText();

  await OBR.player.select([itemId]);
  // Focus on this item

  // Convert the center of the selected item to screen-space
  const bounds = await OBR.scene.items.getItemBounds([itemId]);
  const boundsAbsoluteCenter = await OBR.viewport.transformPoint(bounds.center);

  // Get the center of the viewport in screen-space
  const viewportWidth = await OBR.viewport.getWidth();
  const viewportHeight = await OBR.viewport.getHeight();
  const viewportCenter: Vector2 = {
    x: viewportWidth / 2,
    y: viewportHeight / 2,
  };

  // Offset the item center by the viewport center
  const absoluteCenter = Math2.subtract(boundsAbsoluteCenter, viewportCenter);

  // Convert the center to world-space
  const relativeCenter =
    await OBR.viewport.inverseTransformPoint(absoluteCenter);

  // Invert and scale the world-space position to match a viewport position offset
  const viewportScale = await OBR.viewport.getScale();
  const viewportPosition = Math2.multiply(relativeCenter, -viewportScale);

  await OBR.viewport.animateTo({
    scale: viewportScale,
    position: viewportPosition,
  });

  // Select this item
  OBR.player.select([itemId]);
}
