import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";

const inputIds = ["enable-name-tag", "hide-name-tag"]
const metadataPath = "name-tag"

OBR.onReady(async ()=> {

    setUpTheme();
    setUpInputs();
    closePopoverOnEscapeKey();
});

async function setUpTheme() {

    // Get theme
    const theme = await OBR.theme.getTheme();

    // Change element colours based on theme
    const labels = document.getElementsByClassName("settings-label")
    for (let i = 0; i < labels.length; i++) {
        (labels[i] as HTMLLabelElement).style.color = theme.text.primary;
    }
}

async function setUpInputs() {
    
    // Get selected items
    const selection = await OBR.player.getSelection();
    const items = await OBR.scene.items.getItems(selection);

    // Fill checkbox inputs with previous value
    for (const inputId of inputIds) {

        // If any of the selected items is checked the box becomes checked
        let anyChecked = false;
        for (const item of items) {
            try {
                const checked = JSON.parse(JSON.stringify(item.metadata[getPluginId(metadataPath)]))[inputId];
                if (checked) {
                    anyChecked = true;
                }
            } catch (error) {}
        }
        if (document.getElementById(inputId) !== null) {
            (document.getElementById(inputId) as HTMLInputElement).checked = anyChecked;
        }
    }

    // Set checkbox listeners
    inputIds.forEach( (id)=> {
        document.getElementById(id)?.addEventListener("change", function() {handleInputChange(id)});
    });
}

async function handleInputChange(id:string) {
    
    // Get new value
    const value = (document.getElementById(id) as HTMLInputElement).checked;

    // Get selected items
    const selection = await OBR.player.getSelection();
    const selectedItems = await OBR.scene.items.getItems(selection);

    // Write metadata into items
    OBR.scene.items.updateItems(selectedItems, (items) => {

        // Modify item
        for (let item of items) {

            // Create new metadata
            let newMetadata = {[id]: value}

            // Get item metadata
            let retrievedMetadata: any;
            if (item.metadata[getPluginId(metadataPath)]) {
                retrievedMetadata = JSON.parse(JSON.stringify(item.metadata[getPluginId(metadataPath)]))
            }

            // Combine metadata
            const combinedMetadata = {...retrievedMetadata, ...newMetadata} //overwrite only the modified value

            item.metadata[getPluginId(metadataPath)] = combinedMetadata;
        }
    });
}

async function closePopoverOnEscapeKey() {
    
    // attach keydown listener to close popover on escape key pressed
    document.addEventListener("keydown", (event) => {
        // var name = event.key;
        // var code = event.code;
        //console.log(`Key pressed ${name} \r\n Key code value: ${code}`); // log key pressed

        if (event.key == "Escape") {
            OBR.popover.close(getPluginId("bubbles-name-tag"));
        }
    }, false);
}