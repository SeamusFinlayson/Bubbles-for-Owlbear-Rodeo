import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import { StatMetadataID } from "./StatInputClass";

export async function writeInputValueToTokenMetadata(id: StatMetadataID, value: string | boolean): Promise<number | boolean> {

    let returnValue: number | boolean = (typeof value === "string") ? parseFloat(value) : value;

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

                // Get new value
                const value = (document.getElementById(id) as HTMLInputElement).checked;

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
                //console.log(combinedMetadata[id])
                // Write the metadata into the item
                item.metadata[getPluginId("metadata")] = combinedMetadata;
                returnValue = combinedMetadata[id];

                // Write validated value back into input - handled by on change callback
                // (document.getElementById(id) as HTMLInputElement).value = String(newMetadata[id]);
            } else {
                throw "Error: bad input type.";
            }
        }
    });
    return returnValue;
}

interface StatsArray {
    [index: string]: number | boolean;
}