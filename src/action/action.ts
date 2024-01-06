import OBR, { Theme } from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import actionPopover from "./actionPopover.html?raw";
import "./actionStyle.css"
import { actionInputs } from "./ActionInputClass";

var initDone: boolean = false; // check if on change listener has been attached yet
var roleLast: "GM" | "PLAYER";
var metadataChangeListenerAdded: boolean = false;

OBR.onReady(async ()=> {

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

    if (theme.mode == "LIGHT") {

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

    // Get role if not provided
    if (typeof role === "undefined") {
        role = await OBR.player.getRole();
    }

    // Fill popover according to role
    if(!initDone || (role !== roleLast)) {
        initDone = true;
        roleLast = role;

        if (role == "PLAYER") {
            try {
                (document.getElementById("parent") as HTMLDivElement).innerHTML = 
                `
                <div class="action-heading">
                    <p class="heading-p">Settings</p>
                    <a class="action-button patreon-button" title="Patreon" href="https://www.patreon.com/SeamusFinlayson"
                    target="_blank" rel="noreferrer noopener">
                    <svg class="button-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 436 476" width="19px" height="19px">
                        <path data-fill="1"
                        d="M436 143c-.084-60.778-47.57-110.591-103.285-128.565C263.528-7.884 172.279-4.649 106.214 26.424 26.142 64.089.988 146.596.051 228.883c-.77 67.653 6.004 245.841 106.83 247.11 74.917.948 86.072-95.279 120.737-141.623 24.662-32.972 56.417-42.285 95.507-51.929C390.309 265.865 436.097 213.011 436 143Z">
                        </path>
                    </svg>
                    </a>
                    <a class="action-button change-log-button" title="Change Log"
                    href="https://www.patreon.com/collection/306916?view=expanded" target="_blank" rel="noreferrer noopener">
                    <svg class="button-svg" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                        <path d="M12 8V12L14.5 14.5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        <path
                            d="M5.60423 5.60423L5.0739 5.0739V5.0739L5.60423 5.60423ZM4.33785 6.87061L3.58786 6.87438C3.58992 7.28564 3.92281 7.61853 4.33408 7.6206L4.33785 6.87061ZM6.87963 7.63339C7.29384 7.63547 7.63131 7.30138 7.63339 6.88717C7.63547 6.47296 7.30138 6.13549 6.88717 6.13341L6.87963 7.63339ZM5.07505 4.32129C5.07296 3.90708 4.7355 3.57298 4.32129 3.57506C3.90708 3.57715 3.57298 3.91462 3.57507 4.32882L5.07505 4.32129ZM3.75 12C3.75 11.5858 3.41421 11.25 3 11.25C2.58579 11.25 2.25 11.5858 2.25 12H3.75ZM16.8755 20.4452C17.2341 20.2378 17.3566 19.779 17.1492 19.4204C16.9418 19.0619 16.483 18.9393 16.1245 19.1468L16.8755 20.4452ZM19.1468 16.1245C18.9393 16.483 19.0619 16.9418 19.4204 17.1492C19.779 17.3566 20.2378 17.2341 20.4452 16.8755L19.1468 16.1245ZM5.14033 5.07126C4.84598 5.36269 4.84361 5.83756 5.13505 6.13191C5.42648 6.42626 5.90134 6.42862 6.19569 6.13719L5.14033 5.07126ZM18.8623 5.13786C15.0421 1.31766 8.86882 1.27898 5.0739 5.0739L6.13456 6.13456C9.33366 2.93545 14.5572 2.95404 17.8017 6.19852L18.8623 5.13786ZM5.0739 5.0739L3.80752 6.34028L4.86818 7.40094L6.13456 6.13456L5.0739 5.0739ZM4.33408 7.6206L6.87963 7.63339L6.88717 6.13341L4.34162 6.12062L4.33408 7.6206ZM5.08784 6.86684L5.07505 4.32129L3.57507 4.32882L3.58786 6.87438L5.08784 6.86684ZM12 3.75C16.5563 3.75 20.25 7.44365 20.25 12H21.75C21.75 6.61522 17.3848 2.25 12 2.25V3.75ZM12 20.25C7.44365 20.25 3.75 16.5563 3.75 12H2.25C2.25 17.3848 6.61522 21.75 12 21.75V20.25ZM16.1245 19.1468C14.9118 19.8483 13.5039 20.25 12 20.25V21.75C13.7747 21.75 15.4407 21.2752 16.8755 20.4452L16.1245 19.1468ZM20.25 12C20.25 13.5039 19.8483 14.9118 19.1468 16.1245L20.4452 16.8755C21.2752 15.4407 21.75 13.7747 21.75 12H20.25ZM6.19569 6.13719C7.68707 4.66059 9.73646 3.75 12 3.75V2.25C9.32542 2.25 6.90113 3.32791 5.14033 5.07126L6.19569 6.13719Z">
                        </path>
                        </g>
                    </svg>
                    </a>
                    <a class="action-button help-button" title="Instructions"
                    href="https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo?tab=readme-ov-file#how-it-works"
                    target="_blank" rel="noreferrer noopener">
                    <svg class="button-svg" width="22px" height="20px" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                        <g>
                            <path class="st0"
                            d="M396.138,85.295c-13.172-25.037-33.795-45.898-59.342-61.03C311.26,9.2,280.435,0.001,246.98,0.001 c-41.238-0.102-75.5,10.642-101.359,25.521c-25.962,14.826-37.156,32.088-37.156,32.088c-4.363,3.786-6.824,9.294-6.721,15.056 c0.118,5.77,2.775,11.186,7.273,14.784l35.933,28.78c7.324,5.864,17.806,5.644,24.875-0.518c0,0,4.414-7.978,18.247-15.88 c13.91-7.85,31.945-14.173,58.908-14.258c23.517-0.051,44.022,8.725,58.016,20.717c6.952,5.941,12.145,12.594,15.328,18.68 c3.208,6.136,4.379,11.5,4.363,15.574c-0.068,13.766-2.742,22.77-6.603,30.442c-2.945,5.729-6.789,10.813-11.738,15.744 c-7.384,7.384-17.398,14.207-28.634,20.479c-11.245,6.348-23.365,11.932-35.612,18.68c-13.978,7.74-28.77,18.858-39.701,35.544 c-5.449,8.249-9.71,17.686-12.416,27.641c-2.742,9.964-3.98,20.412-3.98,31.071c0,11.372,0,20.708,0,20.708 c0,10.719,8.69,19.41,19.41,19.41h46.762c10.719,0,19.41-8.691,19.41-19.41c0,0,0-9.336,0-20.708c0-4.107,0.467-6.755,0.917-8.436 c0.773-2.512,1.206-3.14,2.47-4.668c1.29-1.452,3.895-3.674,8.698-6.331c7.019-3.946,18.298-9.276,31.07-16.176 c19.121-10.456,42.367-24.646,61.972-48.062c9.752-11.686,18.374-25.758,24.323-41.968c6.001-16.21,9.242-34.431,9.226-53.96 C410.243,120.761,404.879,101.971,396.138,85.295z">
                            </path>
                            <path class="st0"
                            d="M228.809,406.44c-29.152,0-52.788,23.644-52.788,52.788c0,29.136,23.637,52.772,52.788,52.772 c29.136,0,52.763-23.636,52.763-52.772C281.572,430.084,257.945,406.44,228.809,406.44z">
                            </path>
                        </g>
                        </g>
                    </svg>
                    </a>
                </div>
          
                <hr class="action-hr">
    
                <div class="action-row">
                    <p class="settings-label">Must have GM access to change settings.</p>
                </div>
                `;
            } catch (error) {
                console.log(error);
            }
        } else {

            // Set up the popover for GM view
            (document.getElementById("parent") as HTMLDivElement).innerHTML = actionPopover;
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

                // Get input's previous value from the scene metadata
                let value: number | boolean;
                let retrievedValue: boolean;

                try {
                    value = metadata[getPluginId("metadata")][actionInput.id];
                    retrievedValue = true;
                } catch (error) {
                    if (error instanceof TypeError) {
                        value = 0;
                    } else {throw error;}
                    retrievedValue = false;
                }

                // If a value was retrieved fill the input
                if (retrievedValue) {

                    // Use validation appropriate to the input type
                    if(actionInput.type === "CHECKBOX") {

                        if (value !== null && typeof value !== "undefined"  && typeof value === "boolean") {
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
                        throw "Error: bad input type."
                    }
                }
            }
        });

        const unsubscribeFromPlayerChange = OBR.player.onChange((player) => {

            if(player.role === "PLAYER") {
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

        // Get input's previous value from the scene metadata
        let value: number | boolean;
        let retrievedValue: boolean;

        try {
            value = sceneMetadata[getPluginId("metadata")][actionInput.id];
            retrievedValue = true;
        } catch (error) {
            if (error instanceof TypeError) {
                value = 0;
            } else {throw error;}
            retrievedValue = false;
        }

        // If a value was retrieved fill the input
        if (retrievedValue) {

            // Use validation appropriate to the input type
            if(actionInput.type === "CHECKBOX") {

                if (value !== null && typeof value !== "undefined"  && typeof value === "boolean") {
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
                throw "Error: bad input type."
            }
        }

        // Add event an event lister to the input so changes are written to the scene's metadata
        (document.getElementById(actionInput.id) as HTMLInputElement).addEventListener("change", async (event) => {

            // Use validation appropriate to the input type
            if (actionInput.type === "CHECKBOX") {

                const value = (event.target as HTMLInputElement).checked;

                if (value === true) {
                    const newMetadata = {[actionInput.id]: true};
                    updateSceneMetadata(newMetadata);
                } else {
                    let newMetadata = {[actionInput.id]: false};
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
                        const newMetadata = {[actionInput.id]: intValue}
                        updateSceneMetadata(newMetadata);
                    } else {
                        (event.target as HTMLInputElement).value = String(value);
                        const newMetadata = {[actionInput.id]: value}
                        updateSceneMetadata(newMetadata);
                    }
                } else {
                    (event.target as HTMLInputElement).value = String(0);
                    let newMetadata = {[actionInput.id]: 0}
                    updateSceneMetadata(newMetadata);
                }

            } else {
                throw "Error: bad input type."
            }
        });
    }

    // Add listener to "Create debug report" button
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

