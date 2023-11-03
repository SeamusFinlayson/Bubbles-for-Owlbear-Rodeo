import OBR, { Image } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
//import "./style.css";
//import popoverHTML from './popover.html?raw';
// import actionPopoverHTML from './actionPopover.html?raw';

/**
 * This file represents the HTML of the popover that is shown once
 * the status ring context menu item is clicked.
*/

OBR.onReady(async () => {

  // const app = document.querySelector<HTMLDivElement>("#app");
  // console.log("app: " + app);

  // Setup the document
  //document.querySelector<HTMLDivElement>("#app")!.innerHTML = popoverHTML;

  // OBR.action.onOpenChange((isOpen) => {
  //   if (isOpen) {
  //     document.querySelector<HTMLDivElement>("#app")!.innerHTML = actionPopoverHTML;
  //   }
  // });

  //OBR.theme.onChange( (theme) => {
    const theme = OBR.theme.getTheme()
    if ((await theme).mode == "LIGHT") {

      //change text color
      const labels = document.getElementsByClassName("label")
      //console.log("Theme changed for " + labels.length + " labels") 
      for (let i = 0; i < labels.length; i++) {
        (labels[i] as HTMLLabelElement).style.color = (await theme).text.primary;
      }

      //change bubble focus color
      const numberBoxes = document.getElementsByClassName("number-box");
      //console.log("Theme changed for " + numberBoxes.length + " inputs") 
      for (let i = 0; i < numberBoxes.length; i++) {
        //console.log("Theme changed for " + numberBoxes[i].id);
        numberBoxes[i].classList.replace("dark", "light");
      }

      const checkBoxSlider = document.getElementById("slider span");
      checkBoxSlider?.classList.replace("dark", "light");
    } 

    // labels.forEach((label) => {
    //   label.style.color = theme.text.primary
    // })
  //})

  //list of input element ids in document
  var bubbles:string[] = ["health", "max health", "temporary health", "armor class", "hide"];

  //get existing metadata from token
  const selection = await OBR.player.getSelection();
  const items = await OBR.scene.items.getItems<Image>(selection);
  var retrievedMetadata, metadata;
  for (const item of items) {
    metadata = item.metadata[getPluginId("metadata")];
    //console.log("stringified: " + JSON.stringify(metadata)) //this is retrieved metadata
    if (metadata) {
      retrievedMetadata = JSON.parse(JSON.stringify(metadata));
    }
  }

  // try to fill input fields with previous data
  for (const bubble of bubbles) {
    try {
      if (!(retrievedMetadata[bubble] === undefined)) {
        (document.getElementById(bubble) as HTMLInputElement).value = retrievedMetadata[bubble];
      }
    } catch (error) {}
  }

  try {
    (document.getElementById(bubbles[4]) as HTMLInputElement).checked = retrievedMetadata[bubbles[4]];
  } catch (error) {}

  //select health field by default
  (document.getElementById(bubbles[0]) as HTMLInputElement)?.select();

  // Attach on input listeners
  bubbles.forEach(
    (id) => {
      // Attach on input listeners
      // note consider switching to 
      document.getElementById(id)?.addEventListener("change", function(){handleBubbleValueUpdate(id)});
    }
  );

  // attach keydown listener to close popover on "Escape" or "Enter" pressed
  document.addEventListener('keydown', (event) => {
    // var name = event.key;
    // var code = event.code;
    //console.log(`Key pressed ${name} \r\n Key code value: ${code}`); // log key pressed

    if (event.key == "Escape") { // || event.key == "Enter"
      //console.log("Closing")
      OBR.popover.close(getPluginId("number-bubbles"));
    }
  }, false);

  //OBR.scene.onMetadataChange

  //console.log(items);
});

//save changes to bubble values in meta data
async function handleBubbleValueUpdate(id: string) {

  var value: any;

  //set value of new metadata
  if (id == "hide") {
    value = (document.getElementById(id) as HTMLInputElement).checked;
  } else {
    value = (document.getElementById(id) as HTMLInputElement).value;
  }
  
  //console.log("Updating... " + id + ": " + value); //log incoming metadata modification
  var newMetadata = {[id]: value}

  //find selected token
  const selection = await OBR.player.getSelection();
  const items = await OBR.scene.items.getItems<Image>(selection);

  // Throw error if more than one token selected
  if (items.length > 1) {
    throw "Selection exceeded max length, expected 1, got: " + items.length;
  }

  //get existing metadata from token, if it exists
  //max one object selected
  var retrievedMetadata, combinedMetadata: any;
  for (const item of items) {
    //console.log(item);

    const metadata = item.metadata[getPluginId("metadata")];

    //set new metadata value
    if (metadata) {

      retrievedMetadata = JSON.parse(JSON.stringify(metadata));

      //try to add new value to previous value
      if (id != "hide" && !isNaN(parseFloat(value))) {
        if ((value.startsWith("+") || value.startsWith("-")) && !isNaN(parseFloat(retrievedMetadata[id]))) {
          try {
            const newValue = parseFloat(retrievedMetadata[id]) + parseFloat(value);
            newMetadata = {[id]: newValue };
            (document.getElementById(id) as HTMLInputElement).value = String(newValue);
          } catch (error) {
            newMetadata = {[id]: value};
            (document.getElementById(id) as HTMLInputElement).value = String(value);
          }
        } else { //try to extract float from number
          try {
            const newValue = parseFloat(value);
            if (!isNaN(newValue)) {
              newMetadata = {[id]: newValue };
              (document.getElementById(id) as HTMLInputElement).value = String(newValue);
            }
          } catch (error) {
            newMetadata = {[id]: value};
            (document.getElementById(id) as HTMLInputElement).value = String(value);
          }
        }
      }

      combinedMetadata = {...retrievedMetadata, ...newMetadata} //overwrite only the updated item
    }
    else {
      combinedMetadata = newMetadata
    }
  }
  //console.log(combinedMetadata); //metadata is modified to this value

  //write value from number input into scene item's metadata
  OBR.scene.items.updateItems(items, (items) => {
    for (let item of items) {
      item.metadata[getPluginId("metadata")] = combinedMetadata;
    }
  });

  // all code below should be in a on metadata update listener
}