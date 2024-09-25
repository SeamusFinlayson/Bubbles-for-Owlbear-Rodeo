export type EditorMode = "setValues" | "damage" | "healing";

export type StampedDiceRoll = {
  timeStamp: number;
  total: number;
  roll: string;
};
