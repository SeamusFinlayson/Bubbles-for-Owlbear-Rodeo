import OBR, { Theme } from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import settings from "./components/settings.html?raw";
import "./actionStyle.css"
import { ActionInput, actionInputs } from "./ActionInputClass";
import setupReact from "./setupReact";

let initDone: boolean = false; // check if on change listener has been attached yet
let roleLast: "GM" | "PLAYER";
let metadataChangeListenerAdded: boolean = false;
let reactSetupDone: boolean = false;

OBR.onReady(async () => {

    // Handle when the scene is either changed or made ready after extension load
    OBR.scene.onReadyChange(async (isReady) => {
        if (isReady) {

            // Initialize action popover
            setUpActionPopover();
        } else {
            initDone = false;
        }
    });

    // Check if the scene is already ready once the extension loads
    const isReady = await OBR.scene.isReady();
    if (isReady) {

        // Initialize action popover
        setUpActionPopover();
    }

    // Handle role changes
    OBR.player.onChange(async (player) => {

        // Reinitialize action popover for new role
        setUpActionPopover(player.role);
    });

    // Update text on theme change
    OBR.theme.onChange(async (theme) => {
        updateActionTheme(theme);
    });
});

async function updateActionTheme(theme: Theme) {

    //change text color
    const labels = document.getElementsByClassName("settings-label");
    for (let i = 0; i < labels.length; i++) {
        (labels[i] as HTMLLabelElement).style.color = theme.text.primary;
    }

    const headers = document.getElementsByClassName("heading-p");
    for (let i = 0; i < headers.length; i++) {
        (headers[i] as HTMLParagraphElement).style.color = theme.text.primary;
    }

    const buttons = document.getElementsByClassName("action-button");
    for (let i = 0; i < buttons.length; i++) {
        (buttons[i] as HTMLButtonElement).style.color = theme.text.primary;
    }

    const inputs = document.getElementsByClassName("settings-input");
    for (let i = 0; i < inputs.length; i++) {
        (inputs[i] as HTMLInputElement).style.color = theme.text.primary;
    }

    if (theme.mode === "LIGHT") {

        const hrs = document.getElementsByClassName("action-hr");
        for (let i = 0; i < hrs.length; i++) {
            (hrs[i] as HTMLHRElement).style.borderColor = "rgba(0, 0, 0, 0.15)";
        }

        const buttonSvgs = document.getElementsByClassName("button-svg");
        for (let i = 0; i < buttonSvgs.length; i++) {
            (buttonSvgs[i] as HTMLElement).classList.add("button-svg-light-mode");
            (buttonSvgs[i] as HTMLElement).classList.remove("button-svg-dark-mode");
        }

    } else {

        const hrs = document.getElementsByClassName("action-hr")
        for (let i = 0; i < hrs.length; i++) {
            (hrs[i] as HTMLHRElement).style.borderColor = "rgba(255, 255, 255, 0.12)";
        }

        const buttonSvgs = document.getElementsByClassName("button-svg");
        for (let i = 0; i < buttonSvgs.length; i++) {
            (buttonSvgs[i] as HTMLElement).classList.add("button-svg-dark-mode");
            (buttonSvgs[i] as HTMLElement).classList.remove("button-svg-light-mode");
        }
    }
}

async function setUpActionPopover(role?: "GM" | "PLAYER") {
    
    if (!reactSetupDone) {
        reactSetupDone = true;
        setupReact();
    }

    // Get role if not provided
    if (typeof role === "undefined") {
        role = await OBR.player.getRole();
    }

    // Fill popover according to role
    if (!initDone || (role !== roleLast)) {
        initDone = true;
        roleLast = role;

        if (role === "PLAYER") {
            try {
                OBR.action.setHeight(192);
                (document.getElementById("settings-grid") as HTMLDivElement).outerHTML = `
                    <div id="settings-grid" class="action-row">
                        <p class="settings-label">Must have GM access to change settings.</p>
                    </div>
                `;
            } catch (error) {
                console.log(error);
            }
        } else {

            // Set up the popover for GM view
            OBR.action.setHeight(390);
            (document.getElementById("settings-grid") as HTMLDivElement).outerHTML = settings;
            setUpInputs();

            // Update inputs if scene metadata changes
            updateInputs();
        }

        //initialize with correct theme
        const theme = await OBR.theme.getTheme();
        updateActionTheme(theme);
    }
}

async function updateInputs() {

    // Check if listener has already been attached
    if (!metadataChangeListenerAdded) {

        // Prevent the listener from being attached again
        metadataChangeListenerAdded = true;

        // Add metadata change listener
        const unsubscribeFromSceneMetadata = OBR.scene.onMetadataChange((metadata: any) => {

            // Fill inputs with previous values, if they had values
            for (const actionInput of actionInputs) {
                fillInputFromSceneData(actionInput, metadata);
            }
        });

        const unsubscribeFromPlayerChange = OBR.player.onChange((player) => {

            if (player.role === "PLAYER") {
                unsubscribeFromSceneMetadata();
                unsubscribeFromPlayerChange();
                metadataChangeListenerAdded = false;
            }
        });
    }
}

async function setUpInputs() {

    // Get scene metadata
    const sceneMetadata: any = await OBR.scene.getMetadata();

    // Fill inputs with previous values, if they had values
    for (const actionInput of actionInputs) {

        // Set input value based on metadata
        fillInputFromSceneData(actionInput, sceneMetadata);

        // Add event an event lister to the input so changes are written to the scene's metadata
        (document.getElementById(actionInput.id) as HTMLInputElement).addEventListener("change", async (event) => {

            // Use validation appropriate to the input type
            if (actionInput.type === "CHECKBOX") {

                const value = (event.target as HTMLInputElement).checked;

                if (value === true) {
                    const newMetadata = { [actionInput.id]: true };
                    updateSceneMetadata(newMetadata);
                } else {
                    let newMetadata = { [actionInput.id]: false };
                    updateSceneMetadata(newMetadata);
                }

            } else if (actionInput.type === "NUMBER") {

                const value = parseFloat((event.target as HTMLInputElement).value);

                if (typeof value === "number" && value !== null && !isNaN(value)) {
                    if (actionInput.id === "segments") {

                        // Segments only accepts whole numbers
                        let intValue = Math.trunc(value);
                        if (intValue < 0) { // Cannot be less than 0
                            intValue = 0;
                        }
                        (event.target as HTMLInputElement).value = String(intValue); // Update input with valid value 
                        const newMetadata = { [actionInput.id]: intValue }
                        updateSceneMetadata(newMetadata);
                    } else {
                        (event.target as HTMLInputElement).value = String(value);
                        const newMetadata = { [actionInput.id]: value }
                        updateSceneMetadata(newMetadata);
                    }
                } else {
                    (event.target as HTMLInputElement).value = String(0);
                    let newMetadata = { [actionInput.id]: 0 }
                    updateSceneMetadata(newMetadata);
                }

            } else {
                throw "Error: bad input type."
            }
        });
    }

    // Add listener to "Create debug report" button
    // (document.getElementById("log-scene-metadata") as HTMLButtonElement).addEventListener("click", async () => {
    //     const sceneMetadata = await OBR.scene.getMetadata();
    //     console.log("Scene:");
    //     console.log(sceneMetadata);
    //     console.log("Bubbles:");
    //     console.log(JSON.parse(JSON.stringify(sceneMetadata))[getPluginId("metadata")]);
    // });
}

// Fill inputs from scene data
function fillInputFromSceneData(actionInput: ActionInput, sceneMetadata: any) {

    let value: number | boolean;
    let retrievedValue: boolean;

    try {
        value = sceneMetadata[getPluginId("metadata")][actionInput.id];
        retrievedValue = true;
    } catch (error) {
        if (error instanceof TypeError) {
            value = 0;
        } else { throw error; }
        retrievedValue = false;
    }

    // If a value was retrieved fill the input
    if (retrievedValue) {

        // Use validation appropriate to the input type
        if (actionInput.type === "CHECKBOX") {

            if (value !== null && typeof value !== "undefined" && typeof value === "boolean") {
                (document.getElementById(actionInput.id) as HTMLInputElement).checked = value;
            } else {
                (document.getElementById(actionInput.id) as HTMLInputElement).checked = false;
            }

        } else if (actionInput.type === "NUMBER") {

            if (value !== null && typeof value !== "undefined" && typeof value === "number") {
                (document.getElementById(actionInput.id) as HTMLInputElement).value = String(value);
            } else {
                (document.getElementById(actionInput.id) as HTMLInputElement).value = String(0);
            }

        } else {
            throw "Error: bad input type.";
        }
    }
}

async function updateSceneMetadata(newMetadata: any) {

    //console.log("updating scene metadata")

    // get scene metadata
    const sceneMetadata = await OBR.scene.getMetadata();
    //console.log(sceneMetadata)

    const retrievedMetadata = JSON.parse(JSON.stringify(sceneMetadata))[getPluginId("metadata")];

    // combine metadata
    const combinedMetadata = { ...retrievedMetadata, ...newMetadata } //overwrite only the updated item

    //write metadata into scene
    OBR.scene.setMetadata({ [getPluginId("metadata")]: combinedMetadata });
}
