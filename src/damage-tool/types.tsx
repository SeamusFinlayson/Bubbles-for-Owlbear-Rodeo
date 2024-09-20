import { DiceRoll } from "@dice-roller/rpg-dice-roller";

export type EditorMode = "setValues" | "damage" | "healing";

export type StampedDiceRoll = {
  timeStamp: number;
  diceRoll: DiceRoll;
};
