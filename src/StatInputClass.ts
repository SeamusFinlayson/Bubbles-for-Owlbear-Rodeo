export type StatMetadataID =  "health"| "max health"| "temporary health"| "armor class"| "hide";

class StatInput {
    id: StatMetadataID;
    type: "TEXT" | "CHECKBOX";

    constructor(id: StatMetadataID, type: "TEXT" | "CHECKBOX") {
        this.id = id;
        this.type = type;
    }
}

export const statInputs: StatInput[] = [
    new StatInput("health", "TEXT"),
    new StatInput("max health", "TEXT"),
    new StatInput("temporary health", "TEXT"),
    new StatInput("armor class", "TEXT"),
    new StatInput("hide", "CHECKBOX"),
];