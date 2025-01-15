import React from "react";

export type Operation = "none" | "damage" | "healing" | "overwrite";

export type StampedDiceRoll =
  | {
      timeStamp: number;
      total: number;
      roll: string;
      playerName: string;
      visibility: "PUBLIC" | "GM";
    }
  | {
      timeStamp: number;
      total: number;
      roll: string;
      playerName: string;
      visibility: "PRIVATE";
      playerId: string;
    };

export type StatOverwriteData = {
  hitPoints: string;
  maxHitPoints: string;
  tempHitPoints: string;
  armorClass: string;
};

export type BulkEditorState = {
  operation: Operation;
  rolls: StampedDiceRoll[];
  value: number | null;
  animateRoll: boolean;
  statOverwrites: StatOverwriteData;
  damageScaleOptions: Map<string, number>;
  includedItems: Map<string, boolean>;
  showItems: "ALL" | "SELECTED";
  mostRecentSelection: string[];
};

export type Action =
  | {
      type: "set-operation";
      operation: Operation;
    }
  | {
      type: "set-rolls";
      rolls: StampedDiceRoll[];
    }
  | {
      type: "add-roll";
      diceExpression: string;
      playerName: string;
      visibility: "PUBLIC" | "GM";
      dispatch: React.Dispatch<Action>;
    }
  | {
      type: "add-roll";
      diceExpression: string;
      playerName: string;
      visibility: "PRIVATE";
      playerId: string;
      dispatch: React.Dispatch<Action>;
    }
  | {
      type: "set-value";
      value: number | null;
    }
  | {
      type: "set-animate-roll";
      animateRoll: boolean;
    }
  | {
      type: "set-stat-overwrites";
      statOverWrites: StatOverwriteData;
    }
  | {
      type: "clear-stat-overwrites";
    }
  | {
      type: "set-hit-points-overwrite";
      hitPointsOverwrite: string;
    }
  | {
      type: "set-max-hit-points-overwrite";
      maxHitPointsOverwrite: string;
    }
  | {
      type: "set-temp-hit-points-overwrite";
      tempHitPointsOverwrite: string;
    }
  | {
      type: "set-armor-class-overwrite";
      armorClassOverwrite: string;
    }
  | {
      type: "set-damage-scale-options";
      damageScaleOptions: Map<string, number>;
    }
  | {
      type: "set-included-items";
      includedItems: Map<string, boolean>;
    }
  | {
      type: "set-show-items";
      showItems: "ALL" | "SELECTED";
    }
  | {
      type: "set-most-recent-selection";
      mostRecentSelection: string[];
    };
