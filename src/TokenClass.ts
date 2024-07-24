import { Item } from "@owlbear-rodeo/sdk";
import {
  ARMOR_CLASS_METADATA_ID,
  HEALTH_METADATA_ID,
  HIDE_METADATA_ID,
  MAX_HEALTH_METADATA_ID,
  StatMetadataID,
  TEMP_HEALTH_METADATA_ID,
} from "./itemMetadataIds";

export default class Token {
  item: Item;
  health: number;
  maxHealth: number;
  tempHealth: number;
  armorClass: number;
  hideStats: boolean;

  constructor(
    item: Item,
    health: number,
    maxHealth: number,
    tempHealth: number,
    armorClass: number,
    hideStats: boolean,
  ) {
    this.item = item;
    this.health = health;
    this.maxHealth = maxHealth;
    this.tempHealth = tempHealth;
    this.armorClass = armorClass;
    this.hideStats = hideStats;
  }

  /**
   * convertFromInputClassId
   */
  public setUsingStatMetadataId(
    statId: StatMetadataID,
    value: string | boolean,
  ) {
    if (typeof value === "string") {
      switch (statId) {
        case HEALTH_METADATA_ID:
          this.health = parseFloat(value);
          return this;
        case MAX_HEALTH_METADATA_ID:
          this.maxHealth = parseFloat(value);
          return;
        case TEMP_HEALTH_METADATA_ID:
          this.tempHealth = parseFloat(value);
          return;
        case ARMOR_CLASS_METADATA_ID:
          this.armorClass = parseFloat(value);
          return;
        default:
          throw "Error invalid stat Id";
      }
    } else if (typeof value === "boolean" && statId === HIDE_METADATA_ID) {
      this.hideStats = value;
      return;
    } else {
      throw "Error invalid stat Id";
    }
  }

  /**
   * returnAsObject
   */
  public returnStatsAsObject(): StatsObject {
    return {
      health: this.health,
      maxHealth: this.maxHealth,
      tempHealth: this.tempHealth,
      armorClass: this.armorClass,
      hideStats: this.hideStats,
    };
  }
}

export type StatsObject = {
  health: number;
  maxHealth: number;
  tempHealth: number;
  armorClass: number;
  hideStats: boolean;
};
