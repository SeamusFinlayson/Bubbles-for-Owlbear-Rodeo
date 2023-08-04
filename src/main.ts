import OBR, { Image, } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import "./style.css";

/**
 * This file represents the HTML of the popover that is shown once
 * the status ring context menu item is clicked.
*/

OBR.onReady(async () => {

  // Setup the document
  document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div class="center">

    <label>HP</label>
    <input class="number-box" type="number" id="health" name="health">

    <label>/</label>
    <input class="number-box" type="number" id="max health" name="max health">

    <label>Temp</label>
    <input class="number-box" type="number" id="temporary health" name="temporary health"
    style="border-color: lightgreen;">

    <label>AC</label>
    <input class="number-box" type="number" id="armor class" 
      name="armor class" style="border-color: lightblue;">

  </div>`;

  //list of input element ids in document
  var bubbles:string[] = ["health", "max health", "temporary health", "armor class"]; 

  //get existing metadata from token
  const selection = await OBR.player.getSelection();
  const items = await OBR.scene.items.getItems<Image>(selection);
  var retrievedMetadata, metadata;
  for (const item of items) {
    metadata = item.metadata[getPluginId("metadata/")];
    //console.log("stringified: " + JSON.stringify(metadata)) //this is retrieved metadata
    if (metadata) {
      retrievedMetadata = JSON.parse(JSON.stringify(metadata));
    }
  }

  // try to fill input fields with previous data
  for (const bubble of bubbles) {
    try {
      (document.getElementById(bubble) as HTMLInputElement).value = retrievedMetadata[bubble];
    } catch (error) {}
  }

  //select health field by default
  (document.getElementById(bubbles[0]) as HTMLInputElement)?.select()

  // Attach on input listeners
  bubbles.forEach(
    (id) => {
      // Attach on input listeners
      // note consider switching to 
      document.getElementById(id)?.addEventListener("input", function(){handleBubbleValueUpdate(id)});
    }
  );

  // attach keydown listener to close popover on "Escape" or "Enter" pressed
  document.addEventListener('keydown', (event) => {
    // var name = event.key;
    // var code = event.code;
    //console.log(`Key pressed ${name} \r\n Key code value: ${code}`); // log keypressed

    if (event.key == "Escape" || event.key == "Enter") {
      //console.log("Closing")
      OBR.popover.close(getPluginId("number-bubbles"));
    }
  }, false);
});

//save changes to bubble values in meta data
async function handleBubbleValueUpdate(id: string) {

  //set value of new metadata
  var value = (document.getElementById(id) as HTMLInputElement).value;
  const newMetadata = {[id]: value}
  //console.log("Updating... " + id + ": " + value); //log incoming metadata modification

  //find selected token
  const selection = await OBR.player.getSelection();
  const items = await OBR.scene.items.getItems<Image>(selection);

  //get existing metadata from token, if it exists
  //max one object selected
  var retrievedMetadata, combinedMetadata: any;
  for (const item of items) {
    const metadata = item.metadata[getPluginId("metadata/")];

    //set new metadata value
    if (metadata) {
      //console.log("stringified: " + JSON.stringify(metadata)) //this is retrieved metadata
      retrievedMetadata = JSON.parse(JSON.stringify(metadata));
      combinedMetadata = {...retrievedMetadata, ...newMetadata} //modify only the new metadata item
    }
    else {
      combinedMetadata = newMetadata
    }
  }
  //console.log(combinedMetadata); //metadata is modified to this value

  //write value from number input into scene item's metadata
  OBR.scene.items.updateItems(items, (items) => {
    for (let item of items) {
      item.metadata[getPluginId("metadata/")] = combinedMetadata
    }
  });
}