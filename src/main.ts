import OBR, { Image, buildShape } from "@owlbear-rodeo/sdk";
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
    <input class="number-box" type="text" id="health" name="health">

    <label>/</label>
    <input class="number-box" type="text" id="max health" name="max health">

    <label>Temp</label>
    <input class="number-box" type="text" id="temporary health" name="temporary health"
    style="border-color: lightgreen;">

    <label>AC</label>
    <input class="number-box" type="text" id="armor class" 
      name="armor class" style="border-color: lightblue;">

    <label>Hide Bar</label>
    <label class="switch">
      <input type="checkbox" id="hide">
      <span class="slider round"></span>
    </label>

  </div>`;

  //list of input element ids in document
  var bubbles:string[] = ["health", "max health", "temporary health", "armor class", "hide"];

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

  try {
    (document.getElementById(bubbles[4]) as HTMLInputElement).checked = retrievedMetadata[bubbles[4]];
  } catch (error) {}

  //select health field by default
  (document.getElementById(bubbles[0]) as HTMLInputElement)?.select()

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
    //console.log(`Key pressed ${name} \r\n Key code value: ${code}`); // log keypressed

    if (event.key == "Escape") { // || event.key == "Enter"
      //console.log("Closing")
      OBR.popover.close(getPluginId("number-bubbles"));
    }
  }, false);

  console.log(items);
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
  
  console.log("Updating... " + id + ": " + value); //log incoming metadata modification
  var newMetadata = {[id]: value}

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

      retrievedMetadata = JSON.parse(JSON.stringify(metadata));

      //try to add new value to previous value
      if (id != "hide") {
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
      item.metadata[getPluginId("metadata/")] = combinedMetadata
    }
  });

  var visible = true;
  if (combinedMetadata["hide"] == true) {
    visible = false;
  }
  
  //draw shape
  for (const item of items) {
    const shapes = await createShapes(item, combinedMetadata, visible);
    if (shapes) {
      //console.log("Drawing shape")
      await OBR.scene.items.addItems(shapes);
    }
  }
}

const createShapes = async (item: Image, metadata: any, visible: boolean): Promise<any> => {

  const height = 20;
  // const bounds = await OBR.scene.items.getItemBounds([item.id]);
  const dpi = await OBR.scene.grid.getDpi();
  const bounds = getImageBounds(item, dpi);
  const offsetFactor = bounds.height / 150;
  let offset = 130 * offsetFactor;
  const position = {
      x: item.position.x - bounds.width / 2,
      y: item.position.y + bounds.height / 2 - height - offset,
  };
  var color = "darkgray"
  if (!visible) {
    color = "black"
  }

  if (parseFloat(metadata["max health"]) > 0) {

    const backgroundShape = buildShape()
    .width(bounds.width)
    .height(height)
    .shapeType("RECTANGLE")
    .fillColor(color)
    .fillOpacity(0.5)
    .strokeColor(color)
    .strokeOpacity(0.5)
    .position({x: position.x, y: position.y})
    .attachedTo(item.id)
    .layer("ATTACHMENT")
    .locked(true)
    .id(item.id + "health-background")
    .visible(visible)
    .build();
    
    var percentage = 0;

    const health = parseFloat(metadata["health"]);
    const maxHealth = parseFloat(metadata["max health"]);

    if (health <= 0) {
      percentage = 0;
    } else if (health < maxHealth) {
      percentage = health / maxHealth;
    } else if (health >= maxHealth){
      percentage = 1;
    } else {
      //console.log("Error: failed to give percentage value");
    }

    // console.log(
    //   "Percentage: " + percentage + 
    //   ", Health: " + metadata["health"] + 
    //   ", Max Health: " + metadata["max health"]);

    const hpShape = buildShape()
    .width(percentage === 0 ? 0 : (bounds.width - 4) * percentage)
    .height(height - 4)
    .shapeType("RECTANGLE")
    .fillColor("red")
    .fillOpacity(0.5)
    .strokeWidth(0)
    .strokeOpacity(0)
    .position({ x: position.x + 2, y: position.y + 2 })
    .attachedTo(item.id)
    .layer("ATTACHMENT")
    .locked(true)
    .id(item.id + "health")
    .visible(visible)
    .build();

    return[backgroundShape, hpShape];
  } else {

    const backgroundShape = buildShape()
    .width(0)
    .height(0)
    .shapeType("RECTANGLE")
    .fillColor("black")
    .fillOpacity(0.5)
    .strokeColor("black")
    .strokeOpacity(0.5)
    .position({x: position.x, y: position.y})
    .attachedTo(item.id)
    .layer("ATTACHMENT")
    .locked(true)
    .id(item.id + "health-background")
    .visible(visible)
    .build();

    const hpShape = buildShape()
    .width(0)
    .height(0)
    .shapeType("RECTANGLE")
    .fillColor("red")
    .fillOpacity(0.5)
    .strokeWidth(0)
    .strokeOpacity(0)
    .position({ x: position.x + 2, y: position.y + 2 })
    .attachedTo(item.id)
    .layer("ATTACHMENT")
    .locked(true)
    .id(item.id + "health")
    .build();

    return[backgroundShape, hpShape];
  }
}

const getImageBounds = (item: Image, dpi: number) => {
  const dpiScale = dpi / item.grid.dpi;
  const width = item.image.width * dpiScale * item.scale.x;
  const height = item.image.height * dpiScale * item.scale.y;
  return { width, height };
};