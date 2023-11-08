import OBR, { Theme } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import { barAtTopMetadataId, nameTagsMetadataId, offsetMetadataId, segmentsMetadataId, showHealthBarsMetadataId } from "./sceneMetadataObjects";
import actionPopover from '../actionPopover.html?raw';
import "./actionStyle.css"
import { ActionInput } from "./ActionInputClass";

var initDone: boolean = false; // check if on change listener has been attached yet
var roleLast: "GM" | "PLAYER";

const numberInputIds = [offsetMetadataId, segmentsMetadataId];
const checkboxInputIds = [barAtTopMetadataId, nameTagsMetadataId, showHealthBarsMetadataId];

const actionInputs: ActionInput[] = [
    new ActionInput(offsetMetadataId, "NUMBER"),
    new ActionInput(barAtTopMetadataId, "CHECKBOX"),
    new ActionInput(showHealthBarsMetadataId, "CHECKBOX"),
    new ActionInput(segmentsMetadataId, "NUMBER"),
    new ActionInput(nameTagsMetadataId, "CHECKBOX"),
];

OBR.onReady(async ()=> {

    // Handle when the scene is either changed or made ready after extension load
    OBR.scene.onReadyChange(async (isReady) => {
        if (isReady) {
            const role = await OBR.player.getRole();
            setUpActionPopover(role);
        } else {
            initDone = false;
        }
    });
  
    // Check if the scene is already ready once the extension loads
    const isReady = await OBR.scene.isReady();
    if (isReady) {
        const role = await OBR.player.getRole();
        setUpActionPopover(role);
    }

    // Handle role changes
    OBR.player.onChange(async (player) => {
        //console.log("action" + player.role);
        setUpActionPopover(player.role);
    });

    // Update text on theme change
    OBR.theme.onChange(async (theme) => {
        updateActionTheme(theme);
    });

});

async function updateActionTheme(theme: Theme) {

    //change text color
    const labels = document.getElementsByClassName("settings-label")
    for (let i = 0; i < labels.length; i++) {
        (labels[i] as HTMLLabelElement).style.color = theme.text.primary;
    }

    const headers = document.getElementsByClassName("action-heading")
    for (let i = 0; i < headers.length; i++) {
        (headers[i] as HTMLParagraphElement).style.color = theme.text.primary;
    }

    const buttons = document.getElementsByClassName("action-button")
    for (let i = 0; i < buttons.length; i++) {
        (buttons[i] as HTMLButtonElement).style.color = theme.text.primary;
    }

    const inputs = document.getElementsByClassName("settings-input")
    for (let i = 0; i < inputs.length; i++) {
        (inputs[i] as HTMLInputElement).style.color = theme.text.primary;
    }

    if (theme.mode == "LIGHT") {

        const hrs = document.getElementsByClassName("action-hr")
        for (let i = 0; i < hrs.length; i++) {
            (hrs[i] as HTMLHRElement).style.borderColor = "rgba(0, 0, 0, 0.15)";
        }
        
    } else {

        const hrs = document.getElementsByClassName("action-hr")
        for (let i = 0; i < hrs.length; i++) {
            (hrs[i] as HTMLHRElement).style.borderColor = "rgba(255, 255, 255, 0.12)";
        }

    }
}

async function setUpActionPopover(role: "GM" | "PLAYER") {

    //console.log("Setting up action popover")

    if(!initDone || (role !== roleLast)) {
        initDone = true;
        roleLast = role;

        if (role == "PLAYER") {
            try {
                (document.getElementById("parent") as HTMLDivElement).innerHTML = 
                `
                <p class="action-heading">
                    Settings
                </p>
    
                <hr class="action-hr">
    
                <div class="action-row">
                    <p class="action-p">Must have GM access to change settings.</p>
                </div>
                `;
            } catch (error) {
                console.log(error);
            }
        } else {
            (document.getElementById("parent") as HTMLDivElement).innerHTML = actionPopover;
            setUpInputs();
        }

        //initialize with correct theme
        const theme = await OBR.theme.getTheme();
        updateActionTheme(theme);
    }
}

function fillInput(input: ActionInput, value: any) {
    
    if(input.type === "CHECKBOX") {

        // Write value into checkbox input field if it is valid
        if (value !== null && typeof value !== "undefined") {
            (document.getElementById(input.id) as HTMLInputElement).checked = value;
        } else {
            (document.getElementById(input.id) as HTMLInputElement).checked = false;
        }
    } else if (input.type === "NUMBER") {
        
        // Write value into number input field if it is valid
        if (value !== null && typeof value !== "undefined") {
            (document.getElementById(input.id) as HTMLInputElement).value = String(value);
        } else {
            (document.getElementById(input.id) as HTMLInputElement).value = String(0);
        }
    } else {
        throw "Error: bad input type."
    }
}

async function setUpInputs() {

    // Get scene metadata
    const sceneMetadata = await OBR.scene.getMetadata();
    const retrievedMetadata = JSON.parse(JSON.stringify(sceneMetadata));

    // Give number inputs previous values
    for (const actionInput of actionInputs) {
        try {

            // Get value from metadata
            const value = retrievedMetadata[getPluginId("metadata")][actionInput.id];
            
            // Write value into settings menu
            fillInput(actionInput, value);

        } catch (error) {}
    }

    // // Give number inputs previous values
    // for (const numberInputID of numberInputIds) {
    //     try {

    //         // Get value from metadata
    //         const value = retrievedMetadata[getPluginId("metadata")][numberInputID];
            
    //         // Write value into settings menu
    //         if (value !== null && typeof value !== "undefined") {
    //             (document.getElementById(numberInputID) as HTMLInputElement).value = String(value);
    //         } else {
    //             (document.getElementById(numberInputID) as HTMLInputElement).value = String(0);
    //         }
    //     } catch (error) {}
    // }

    // // Give checkbox inputs previous values
    // for (const checkboxInputId of checkboxInputIds) {
    //     try {

    //         // Get value from metadata
    //         const value = retrievedMetadata[getPluginId("metadata")][checkboxInputId];

    //         // Write value into settings menu
    //         if (value !== null && typeof value !== "undefined") {
    //             (document.getElementById(checkboxInputId) as HTMLInputElement).checked = value;
    //         } else {
    //             (document.getElementById(checkboxInputId) as HTMLInputElement).checked = false;
    //         }
    //     } catch (error) {}
    // }

    // offset bar
    (document.getElementById(offsetMetadataId) as HTMLInputElement).addEventListener("change", async (event) => {

        // create metadata object based on user input
        const offset = parseFloat((event.target as HTMLInputElement).value);

        // let newMetadata = {[offsetMetadataId]: offset}
        // updateSceneMetadata(newMetadata);

        // console.log(offset)
        // console.log("type: " + typeof offset)
        if (typeof offset === "number" && offset !== null && !isNaN(offset)) {
            let newMetadata = {[offsetMetadataId]: offset}
            updateSceneMetadata(newMetadata);
        } else {
            let newMetadata = {[offsetMetadataId]: 0}
            updateSceneMetadata(newMetadata);
        }
    });

    // bar above token
    (document.getElementById(barAtTopMetadataId) as HTMLInputElement).addEventListener("change", async (event) => {

        // create metadata object based on user input
        const barAtTop = (event.target as HTMLInputElement).checked;

        if (barAtTop === true) {
            let newMetadata = {[barAtTopMetadataId]: true};
            updateSceneMetadata(newMetadata);
        } else {
            let newMetadata = {[barAtTopMetadataId]: false};
            updateSceneMetadata(newMetadata);
        }

    });

    //name tags
    (document.getElementById(nameTagsMetadataId) as HTMLInputElement).addEventListener("change", async (event) => {

        // create metadata object based on user input
        const nameTags = (event.target as HTMLInputElement).checked;

        if (nameTags === true) {
            let newMetadata = {[nameTagsMetadataId]: true};
            updateSceneMetadata(newMetadata);
        } else {
            let newMetadata = {[nameTagsMetadataId]: false};
            updateSceneMetadata(newMetadata);
        }
    });

    //name tags
    (document.getElementById(showHealthBarsMetadataId) as HTMLInputElement).addEventListener("change", async (event) => {

        // create metadata object based on user input
        const showBars = (event.target as HTMLInputElement).checked;

        if (showBars === true) {
            let newMetadata = {[showHealthBarsMetadataId]: true};
            updateSceneMetadata(newMetadata);
        } else {
            let newMetadata = {[showHealthBarsMetadataId]: false};
            updateSceneMetadata(newMetadata);
        }
    });

    //log scene metadata button
    (document.getElementById("log-scene-metadata") as HTMLButtonElement).addEventListener("click",async () => {
        const sceneMetadata = await OBR.scene.getMetadata();
        console.log("Scene:");
        console.log(sceneMetadata);
        console.log("Bubbles:");
        console.log(JSON.parse(JSON.stringify(sceneMetadata))[getPluginId("metadata")]);
    });
}

async function updateSceneMetadata(newMetadata: any) {

    //console.log("updating scene metadata")

    // get scene metadata
    const sceneMetadata = await OBR.scene.getMetadata();
    //console.log(sceneMetadata)

    const retrievedMetadata = JSON.parse(JSON.stringify(sceneMetadata))[getPluginId("metadata")];

    // combine metadata
    const combinedMetadata = {...retrievedMetadata, ...newMetadata} //overwrite only the updated item

    //write metadata into scene
    OBR.scene.setMetadata({[getPluginId("metadata")]: combinedMetadata});
}

