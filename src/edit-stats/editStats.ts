import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import { StatMetadataID, statInputs } from "./StatInputClass";

OBR.onReady(async () => {

    setUpTheme();
    setUpInputs();
});

async function setUpTheme() {
    
    const theme = OBR.theme.getTheme();
    if ((await theme).mode == "LIGHT") {

        // Change text color
        const labels = document.getElementsByClassName("label");
        for (let i = 0; i < labels.length; i++) {
            (labels[i] as HTMLLabelElement).style.color = (await theme).text.primary;
        }

        const numberBoxes = document.getElementsByClassName("number-bubble");
        for (let i = 0; i < numberBoxes.length; i++) {
            numberBoxes[i].classList.replace("dark", "light");
        }

        (document.getElementById("divisor") as HTMLLabelElement).style.color = "black";

        // Change stat outline color
        const statBackgrounds = document.getElementsByClassName("stat-background");
        console.log(statBackgrounds.length)
        for (let i = 0; i < statBackgrounds.length; i++) {
            statBackgrounds[i].classList.replace("dark", "light");
        }

        // Change grid background color
        const grid = document.getElementsByClassName("stat-grid");
        for (let i = 0; i < grid.length; i++) {
            grid[i].classList.replace("dark", "light");
        }

        // Change hide switch background color
        const hideSwitchRow = document.getElementsByClassName("hide-switch-row")
        for (let i = 0; i < hideSwitchRow.length; i++) {
            hideSwitchRow[i].classList.replace("dark", "light");
        }

    }
}

async function setUpInputs() {
    
    // Get selected Items
    const selection = await OBR.player.getSelection();
    const items = await OBR.scene.items.getItems(selection);

    // Throw an error if more than 1 item is selected, this should not be possible
    if (items.length > 1) {
        throw "Error: Selection exceeded max length, expected 1, got: " + items.length;
    }

    const item = items.at(0);

    if (typeof item === "undefined") {
        throw "Error: No item selected";
    }

    // Fill inputs with previous data
    for (const statInput of statInputs) {

        let value: number | boolean;
        let retrievedValue: boolean;

        try {
            value = JSON.parse(JSON.stringify(item.metadata[getPluginId("metadata")]))[statInput.id];
            retrievedValue = true;
        } catch (error) {
            if (error instanceof TypeError || error instanceof SyntaxError) {
                value = 0;
                retrievedValue = false;
            } else {throw error;}
        }

        if (typeof value === "undefined") {
            retrievedValue = false;
        }

        // If a value was retrieved fill the input
        if (retrievedValue) {

            // Use validation appropriate to the input type
            if(statInput.type === "CHECKBOX") {

                let checkbox = document.getElementById(statInput.id);
                if (checkbox !== null) {
                    if (value !== null && typeof value === "boolean") {
                        (document.getElementById(statInput.id) as HTMLInputElement).checked = value;
                    } else {
                        (document.getElementById(statInput.id) as HTMLInputElement).checked = false;
                    }
                }

            } else if (statInput.type === "TEXT") {

                // Fix bug where first value is read as a string instead of a number
                if (typeof value === "string") {
                    value = parseFloat(value);
                }

                if (value !== null && typeof value === "number" && !isNaN(value)) {
                    (document.getElementById(statInput.id) as HTMLInputElement).value = String(value);
                } else {
                    (document.getElementById(statInput.id) as HTMLInputElement).value = String(0);
                }

            } else {
                throw "Error: bad input type."
            }
        } else {

            // Un retrieved values get set to 0
            if (statInput.type === "CHECKBOX") {
                let checkbox = document.getElementById(statInput.id);
                if (checkbox !== null) {
                    (document.getElementById(statInput.id) as HTMLInputElement).checked = false;
                }
            } else if (statInput.type === "TEXT") {
                (document.getElementById(statInput.id) as HTMLInputElement).value = String(0);
            }
        }

        // Add change listeners to handle input changes
        document.getElementById(statInput.id)?.addEventListener("change", function() {handleInputChange(statInput.id, statInput.type)});
    }

    // Must be called at end to have text pre-selected otherwise text will change after selection
    //selectHealthInput();
}

async function handleInputChange(id: StatMetadataID, type: "TEXT" | "CHECKBOX") {

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

            if (type === "CHECKBOX") {

                // Get new value
                const value = (document.getElementById(id) as HTMLInputElement).checked;

                // Create new metadata
                let newMetadata = {[id]: value}

                // Get item metadata
                let retrievedMetadata: any;
                if (item.metadata[getPluginId("metadata")]) {
                    retrievedMetadata = JSON.parse(JSON.stringify(item.metadata[getPluginId("metadata")]));
                }

                // Combine metadata
                const combinedMetadata = {...retrievedMetadata, ...newMetadata}; //overwrite only the modified value

                item.metadata[getPluginId("metadata")] = combinedMetadata;

            } else if (type === "TEXT") {

                const newValue = (document.getElementById(id) as HTMLInputElement).value;
                const newValueNumber = parseFloat(newValue);
                let newMetadata: {[x: string]: number} = { [id]: Math.trunc(newValueNumber)};;

                let combinedMetadata: any;

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
                                } else {throw error;}
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

                // Write the metadata into the item
                item.metadata[getPluginId("metadata")] = combinedMetadata;

                // Write validated value back into input
                (document.getElementById(id) as HTMLInputElement).value = String(newMetadata[id]);


            } else {
                throw "Error: bad input type."
            }

        }
    });
}

// async function closePopoverOnEscapeKey() {
    
//     // attach keydown listener to close popover on escape key pressed
//     document.addEventListener("keydown", (event) => {
//         // var name = event.key;
//         // var code = event.code;
//         //console.log(`Key pressed ${name} \r\n Key code value: ${code}`); // log key pressed

//         if (event.key == "Escape") {
//             OBR.popover.close(getPluginId("number-bubbles"));
//         }
//     }, false);
// }

// async function selectHealthInput() {

//     // Select health input
//     (document.getElementById(statInputs[0].id) as HTMLInputElement)?.select();
// }