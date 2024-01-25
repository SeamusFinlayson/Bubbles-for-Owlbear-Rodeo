// metadata object names
export type ActionMetadataId = "offset" | "bar-at-top" | "name-tags" | "show-bars" | "segments";

export class ActionInput {
    id: ActionMetadataId;
    type: "CHECKBOX" | "NUMBER";

    constructor(id: ActionMetadataId, type: "CHECKBOX" | "NUMBER") {
        this.id = id;
        this.type = type;
    }
}

export const actionInputs: ActionInput[] = [
    new ActionInput("offset", "NUMBER"),
    new ActionInput("bar-at-top", "CHECKBOX"),
    new ActionInput("show-bars", "CHECKBOX"),
    new ActionInput("segments", "NUMBER"),
    new ActionInput("name-tags", "CHECKBOX"),
    // new ActionInput("always-show-ac", "CHECKBOX"),
]; 


