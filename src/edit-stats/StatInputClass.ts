export type StatMetadataID = "health" | "max health" | "temporary health" | "armor class" | "hide";

const statMetadataIDs: StatMetadataID[] = ["health", "max health", "temporary health", "armor class", "hide"];
export function isStatMetadataID(id: string): id is StatMetadataID {
    return statMetadataIDs.includes(id as StatMetadataID);
}

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