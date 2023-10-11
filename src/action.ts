import OBR, { Player } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import { barAtTopMetadataId, nameTagsMetadataId, offsetMetadataId } from "./sceneMetadataObjects";
import actionPopover from './actionPopover.html?raw';


var initDone: boolean = false; // check if on change listener has been attached yet

OBR.onReady(async ()=> {

    // Handle when the scene is either changed or made ready after extension load
    OBR.scene.onReadyChange(async (isReady) => {
        if (isReady) {
            const role = await OBR.player.getRole();
            setUpActionPopover(role)
        }
    });
  
    // Check if the scene is already ready once the extension loads
    const isReady = await OBR.scene.isReady();
    if (isReady) {
        const role = await OBR.player.getRole();
        setUpActionPopover(role)
    }

    //hide settings from players
    OBR.player.onChange(async (player) => {
        //console.log(player.role);
        setUpActionPopover(player.role);
    })
})

async function setUpActionPopover(role: String) {
    if (role == "PLAYER") {
        try {
            (document.getElementById("parent") as HTMLDivElement).innerHTML = 
            `
            <p class="action-heading">
                Settings
            </p>

            <hr class="action-hr">

            <div class="action-row">
                <p style="margin: 16px">Must have GM access to change settings.</p>
            </div>
            `;
        } catch (error) {
            console.log(error)
        }
    } else {
        (document.getElementById("parent") as HTMLDivElement).innerHTML = actionPopover;
        initDone = false;
        fillSettings();
    }
}

async function fillSettings() {

    //only do this once
    if (!initDone) {
        initDone = true;
        //console.log("Starting action listeners")

        //fill action popover based on scene metadata
        const sceneMetadata = await OBR.scene.getMetadata();
        //console.log(sceneMetadata)
        const retrievedMetadata = JSON.parse(JSON.stringify(sceneMetadata));
        try {
            const offset: any = retrievedMetadata[getPluginId("metadata")][offsetMetadataId];
            //console.log("retrieved" + offset);
            if (offset !== null && offset != "undefined") {
                //console.log("here" + offset);
                (document.getElementById(offsetMetadataId) as HTMLInputElement).value = String(offset);
            } else {
                (document.getElementById(offsetMetadataId) as HTMLInputElement).value = String(0);
            }
        } catch (error) {}
        try {
            const barAtTop: any = retrievedMetadata[getPluginId("metadata")][barAtTopMetadataId];
            //console.log("retrieved" + barAtTop);
            if (barAtTop !== null && barAtTop !== "undefined") {
                (document.getElementById(barAtTopMetadataId) as HTMLInputElement).checked = barAtTop;
            } else {
                (document.getElementById(barAtTopMetadataId) as HTMLInputElement).checked = false;
            }
        } catch (error) {}
        try {
            const nameTags: any = retrievedMetadata[getPluginId("metadata")][nameTagsMetadataId];
            //console.log("retrieved" + nameTags);
            if (nameTags !== null && nameTags !== "undefined") {
                (document.getElementById(nameTagsMetadataId) as HTMLInputElement).checked = nameTags;
            } else {
                (document.getElementById(nameTagsMetadataId) as HTMLInputElement).checked = false;
            }
        } catch (error) {}

        // offset bar
        (document.getElementById(offsetMetadataId) as HTMLInputElement).addEventListener("change", async (event) => {

            // create metadata object based on user input
            const offset = parseFloat((event.target as HTMLInputElement).value);
            let newMetadata = {[offsetMetadataId]: offset}

            updateSceneMetadata(newMetadata);
        });

        // bar above token
        (document.getElementById(barAtTopMetadataId) as HTMLInputElement).addEventListener("change", async (event) => {

            // create metadata object based on user input
            const barAtTop = (event.target as HTMLInputElement).checked;
            let newMetadata = {[barAtTopMetadataId]: barAtTop};

            updateSceneMetadata(newMetadata);
        });

        //name tags
        (document.getElementById(nameTagsMetadataId) as HTMLInputElement).addEventListener("change", async (event) => {

            // create metadata object based on user input
            const nameTags = (event.target as HTMLInputElement).checked;
            let newMetadata = {[nameTagsMetadataId]: nameTags};

            updateSceneMetadata(newMetadata);
        });
    }
}

async function updateSceneMetadata(newMetadata: any) {

    // get scene metadata
    const sceneMetadata = await OBR.scene.getMetadata();
    //console.log(sceneMetadata)

    const retrievedMetadata = JSON.parse(JSON.stringify(sceneMetadata))[getPluginId("metadata")];

    // combine metadata
    const combinedMetadata = {...retrievedMetadata, ...newMetadata} //overwrite only the updated item

    //write metadata into scene
    OBR.scene.setMetadata({[getPluginId("metadata")]: combinedMetadata});
}