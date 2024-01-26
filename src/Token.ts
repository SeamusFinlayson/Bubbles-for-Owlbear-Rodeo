import { Item } from "@owlbear-rodeo/sdk";

export default class Token {
    item: Item;
    health: Number;
    maxHealth: Number;
    tempHealth: Number;
    armorClass: Number;
    hideStats: Boolean;

    constructor(
        item: Item,
        health: Number,
        maxHealth: Number,
        tempHealth: Number,
        armorClass: Number,
        hideStats: Boolean
    ) {
        this.item = item
        this.health = health
        this.maxHealth = maxHealth
        this.tempHealth = tempHealth
        this.armorClass = armorClass
        this.hideStats = hideStats
    }
}