export type Operation = "none" | "damage" | "healing" | "overwrite";

export type StampedDiceRoll = {
  timeStamp: number;
  total: number;
  roll: string;
};

export type StatOverwriteData = {
  hitPoints: string;
  maxHitPoints: string;
  tempHitPoints: string;
  armorClass: string;
};
