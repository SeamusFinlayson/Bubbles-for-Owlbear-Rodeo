import { Item } from "@owlbear-rodeo/sdk";

type Token = {
  item: Item;
  health: number;
  maxHealth: number;
  tempHealth: number;
  armorClass: number;
  hideStats: boolean;
  group: number;
  index: number;
};
export default Token;
