import { Item } from "@owlbear-rodeo/sdk";
import { StatMetadataID } from "./edit-stats/StatInputClass";

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

    /**
     * convertFromInputClassId
     */
    public setUsingStatMetadataId(statId: StatMetadataID, value: string | boolean) {
        if (typeof value === "string") {
            switch (statId) {
                case "health": this.health = parseFloat(value); return this;
                case "max health": this.maxHealth = parseFloat(value); return;
                case "temporary health": this.tempHealth = parseFloat(value); return;
                case "armor class": this.armorClass = parseFloat(value); return;
                default: throw "Error invalid stat Id"
            }
        }
        else if (typeof value === "boolean" && statId === "hide") {
            this.hideStats = value; return;
        }
        else {
            throw "Error invalid stat Id";
        }
    }

    /**
     * returnAsObject
     */
    public returnStatsAsObject(): StatsObject {
        return ({
            "health": this.health,
            "maxHealth": this.maxHealth,
            "tempHealth": this.tempHealth,
            "armorClass": this.armorClass,
            "hideStats": this.hideStats,
        });
    }
}

export type StatsObject = {
    health: Number;
    maxHealth: Number;
    tempHealth: Number;
    armorClass: Number;
    hideStats: Boolean;
}