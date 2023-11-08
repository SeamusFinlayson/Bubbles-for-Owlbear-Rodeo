// metadata object names
export type ActionMetadataId = "offset" | "bar-at-top" | "name-tags" | "show-bars" | "segments"

const offsetMetadataId = "offset";
const barAtTopMetadataId = "bar-at-top";
const nameTagsMetadataId = "name-tags";
const showHealthBarsMetadataId = "show-bars";
const segmentsMetadataId = "segments";

class ActionInput {
    id: ActionMetadataId;
    type: "CHECKBOX" | "NUMBER";

    constructor(id: ActionMetadataId, type: "CHECKBOX" | "NUMBER") {
        this.id = id;
        this.type = type;
    }
}

export const actionInputs: ActionInput[] = [
    new ActionInput(offsetMetadataId, "NUMBER"),
    new ActionInput(barAtTopMetadataId, "CHECKBOX"),
    new ActionInput(showHealthBarsMetadataId, "CHECKBOX"),
    new ActionInput(segmentsMetadataId, "NUMBER"),
    new ActionInput(nameTagsMetadataId, "CHECKBOX"),
];


