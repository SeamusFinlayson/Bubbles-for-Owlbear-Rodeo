import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import { StatMetadataID } from "./StatInputClass";

export async function writeInputValueToTokenMetadata(inputName: InputName, value: string | boolean): Promise<string | boolean> {

    let returnValue: number | boolean | string = (typeof value === "string") ? parseFloat(value) : value;

    const id = convertInputNameToMetadataId(inputName);

    // Get selected items
    const selection = await OBR.player.getSelection();
    const selectedItems = await OBR.scene.items.getItems(selection);

    // Throw error if more than one token selected
    if (selectedItems.length > 1) {
        throw "Selection exceeded max length, expected 1, got: " + selectedItems.length;
    }

    // Write metadata into items
    OBR.scene.items.updateItems(selectedItems, (items) => {

        // Modify item
        for (let item of items) {

            if (typeof value === "boolean") {

                // Create new metadata
                let newMetadata = { [id]: value };

                // Get item metadata
                let retrievedMetadata: any;
                if (item.metadata[getPluginId("metadata")]) {
                    retrievedMetadata = JSON.parse(JSON.stringify(item.metadata[getPluginId("metadata")]));
                }

                // Combine metadata
                const combinedMetadata = { ...retrievedMetadata, ...newMetadata }; //overwrite only the modified value

                item.metadata[getPluginId("metadata")] = combinedMetadata;

            } else if (typeof value === "string") {

                const newValue = value;
                const newValueNumber = parseFloat(newValue);
                let newMetadata: StatsArray = { [id]: Math.trunc(newValueNumber) };;

                let combinedMetadata: StatsArray;

                if (item.metadata[getPluginId("metadata")]) {

                    const retrievedMetadata = JSON.parse(JSON.stringify(item.metadata[getPluginId("metadata")]));
                    // console.log(retrievedMetadata)

                    // Check if new value is valid
                    if (!isNaN(newValueNumber)) {

                        // Check if new value starts with addition or subtraction operator
                        if ((newValue.startsWith("+") || newValue.startsWith("-"))) {

                            // Add to the previous value if both are valid
                            let previousValue: string;
                            let hasPreviousValue: boolean;

                            try {
                                previousValue = retrievedMetadata[id];
                                hasPreviousValue = true;
                            } catch (error) {
                                if (error instanceof TypeError) {
                                    previousValue = "";
                                    hasPreviousValue = false;
                                } else { throw error; }
                            }

                            if (hasPreviousValue) {

                                const previousValueNumber = parseFloat(previousValue);

                                if (!isNaN(previousValueNumber)) {

                                    newMetadata = { [id]: Math.trunc(previousValueNumber) + Math.trunc(newValueNumber) };
                                }
                            }
                        }

                    } else {
                        newMetadata = { [id]: 0 };
                    }

                    combinedMetadata = { ...retrievedMetadata, ...newMetadata }; //overwrite only the updated item

                } else {

                    combinedMetadata = newMetadata;
                }

                // console.log(combinedMetadata[id])
                switch (id) {
                    case "health":
                    case "max health":
                        if (combinedMetadata[id] as number > 9999) {
                            combinedMetadata[id] = 9999;
                        } else if (combinedMetadata[id] as number < -999) {
                            combinedMetadata[id] = -999;
                        }
                        break;
                    case "temporary health":
                    case "armor class":
                        if (combinedMetadata[id] as number > 999) {
                            combinedMetadata[id] = 999;
                        } else if (combinedMetadata[id] as number < -999) {
                            combinedMetadata[id] = -999;
                        }
                        break;
                    default: break;
                }

                // Write the metadata into the item
                item.metadata[getPluginId("metadata")] = combinedMetadata;
                returnValue = combinedMetadata[id];

            } else {
                throw "Error: bad input type.";
            }
        }
    });
    if (typeof returnValue === "number") {
        returnValue = returnValue.toString()
    }
    return returnValue;
}

interface StatsArray {
    [index: string]: number | boolean;
}

export type InputName = "health" | "maxHealth" | "tempHealth" | "armorClass" | "hideStats";

const inputNames: InputName[] = ["health", "maxHealth", "tempHealth", "armorClass", "hideStats"];
export function isInputName(id: string): id is InputName {
    return inputNames.includes(id as InputName);
}

function convertInputNameToMetadataId(id: InputName): StatMetadataID {
    switch(id) {
        case "health": return ("health");
        case "maxHealth": return ("max health");
        case "tempHealth": return ("temporary health");
        case "armorClass": return ("armor class");
        case "hideStats": return ("hide");
    }
}