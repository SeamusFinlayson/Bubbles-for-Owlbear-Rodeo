import OBR, { Image, Item, buildShape, buildText, isImage } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

var tokenIds: String[] = []; // for orphan health bar management
var itemsLast: Image[] = []; // for item change checks
var addItemsArray: Item[] = []; // for bulk addition or changing of items  
var deleteItemsArray: string[] = []; // for bulk deletion of scene items
var initDone: boolean = false; // check if on change listener has been attached yet

async function startHealthBarUpdates() {

    // generate all health bars based on scene token metadata
    //refreshAllHealthBars();

    //only execute this code once
    if (!initDone) {
        initDone = true;

        //update health bars on change
        OBR.scene.items.onChange( async (_) => {
            //console.log("Item change detected")
    
            //get rid of health bars that no longer attach to anything
            await deleteOrphanHealthBars();
    
            //get shapes from scene
            const items: Image[] = await OBR.scene.items.getItems(
                (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
            );
    
            //console.log("Changed items length: " + items.length)
    
            //create list of modified items
            var changedItems: Image[] = [];
            for (let i = 0; i < items.length; i++) {
    
                if(i > itemsLast.length - 1) { //check for extra items at the end of the list 
                    changedItems.push(items[i]);
                }
                else if( //check for notable changes in item values
                    (itemsLast[i].position.x == items[i].position.x) &&
                    (itemsLast[i].position.y == items[i].position.y) &&
                    (itemsLast[i].scale.x == items[i].scale.x) &&
                    (itemsLast[i].scale.y == items[i].scale.y) &&
                    (itemsLast[i].rotation == items[i].rotation) &&
                    (itemsLast[i].visible == items[i].visible) &&
                    (JSON.stringify(itemsLast[i].metadata[getPluginId("metadata")]) == JSON.stringify(items[i].metadata[getPluginId("metadata")]))
                ) {} //do nothing
                else { //add changed items to change list
                    changedItems.push(items[i]);
                }
            }
    
            //update array of all items currently on the board
            itemsLast = items;
    
            //draw health bars
            for (const item of changedItems) {
                await drawHealthBar(item);
            }
            //console.log("Detected " + changedItems.length + " changes");
    
            //bulk add items 
            OBR.scene.local.addItems(addItemsArray);
    
            //bulk delete items
            OBR.scene.local.deleteItems(deleteItemsArray);
    
            //clear add and delete arrays arrays
            addItemsArray.length = 0;
            deleteItemsArray.length = 0;
        });
    }
};

const drawHealthBar = async (item: Image) => {

    const metadata: any = item.metadata[getPluginId("metadata")];

    //try to extract health from metadata
    var health: number;
    var maxHealth: number;
    try {
        health = parseFloat(metadata["health"]);
        maxHealth = parseFloat(metadata["max health"]);
    } catch (error) {
        health = 0;
        maxHealth = 0;
    }
    if(isNaN(health)) {
        health = 0;
    }
    if(isNaN(maxHealth)) {
        maxHealth = 0;
    }

    //try to extract visibility from metadata
    var visible: boolean;
    try {
        visible = !metadata["hide"];
    } catch (error) {
        if (!(error instanceof TypeError)) {
            //console.log("type error")
            throw {
                error
            }
        } else {
            visible = true;
        }
    }

    const roll = await OBR.player.getRole();
    
    if ((maxHealth > 0) && !((roll === "PLAYER") && !visible)) { //draw bar if it has max health and is visible

        //get physical token properties
        const height = 26;
        const dpi = await OBR.scene.grid.getDpi();
        const bounds = getImageBounds(item, dpi);
        const position = {
            x: item.position.x - bounds.width / 2,
            y: item.position.y - bounds.height / 2 - height,
        };
    
        //set color based on visibility
        var color = "darkgrey";
        if (!visible) {
            color = "black";
        }

        const backgroundShape = buildShape()
        .width(bounds.width)
        .height(height)
        .shapeType("RECTANGLE")
        .fillColor(color)
        .fillOpacity(0.7)
        .strokeColor(color)
        .strokeOpacity(0.5)
        .strokeWidth(0)
        .position({x: position.x, y: position.y})
        .attachedTo(item.id)
        .layer("ATTACHMENT")
        .locked(true)
        .id(item.id + "health-background")
        .visible(item.visible)
        .build();
        
        var percentage = 0;
        if (health <= 0) {
            percentage = 0;
        } else if (health < maxHealth) {
            percentage = health / maxHealth;
        } else if (health >= maxHealth){
            percentage = 1;
        } else {
            percentage = 0;
        }
    
        const hpShape = buildShape()
        .width(percentage === 0 ? 0 : (bounds.width) * percentage)
        .height(height)
        .shapeType("RECTANGLE")
        .fillColor("red")
        .fillOpacity(0.5)
        .strokeWidth(0)
        .strokeOpacity(0)
        .position({ x: position.x, y: position.y})
        .attachedTo(item.id)
        .layer("ATTACHMENT")
        .locked(true)
        .id(item.id + "health")
        .visible(item.visible)
        .build();

        const healthLabel = buildText()
        .position({x: position.x, y: position.y + 2})
        .plainText("" + health + "/" + maxHealth)
        .textAlign("CENTER")
        .textAlignVertical("MIDDLE")
        .fontSize(height + 0)
        .fontFamily("Lucidia Console, sans-serif")
        .textType("PLAIN")
        .height(height + 0)
        .width(bounds.width)
        .fontWeight(400)
        .visible(item.visible)
        //.strokeColor("black")
        //.strokeWidth(0)
        .attachedTo(item.id)
        .layer("TEXT")
        .locked(true)
        .id(item.id + "health-label")
        .build();

        //add health bar to add array
        addItemsArray.push(backgroundShape, hpShape, healthLabel);
        
    } else { // delete health bar

        deleteItemsArray.push(item.id + "health-background", item.id + "health", item.id + "health-label");
    }

    return[];
}

const getImageBounds = (item: Image, dpi: number) => {
    const dpiScale = dpi / item.grid.dpi;
    const width = item.image.width * dpiScale * item.scale.x;
    const height = item.image.height * dpiScale * item.scale.y;
    return { width, height };
};

async function deleteOrphanHealthBars() {

    //get ids of all items on map that could have health bars
    const newItems: Image[] = await OBR.scene.items.getItems(
        (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
    );
    var newItemIds: String[] = [];
    for(const item of newItems) {
        newItemIds.push(item.id);
    }
    
    var orphanFound = false; 

    //check for orphaned health bars
    for(const oldId of tokenIds) {
        if(!newItemIds.includes(oldId)) {

            // delete orphaned health bar
            //await OBR.scene.local.deleteItems([oldId + "health-background", oldId + "health", oldId + "health-label"]);
            deleteItemsArray.push(oldId + "health-background", oldId + "health", oldId + "health-label");

            orphanFound = true;
        }
    }

    OBR.scene.local.deleteItems(deleteItemsArray);
    deleteItemsArray.length = 0;

    // update item list with current values
    tokenIds = newItemIds;

    // update current items list
    if(orphanFound) {
        itemsLast = newItems;
        //console.log("orphan found: " + orphanFound)
    }
}

async function refreshAllHealthBars() {

    //get shapes from scene
    const items: Image[] = await OBR.scene.items.getItems(
        (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
    );

    //store array of all items currently on the board for change monitoring
    itemsLast = items;

    //draw health bars
    for (const item of items) {
        await drawHealthBar(item);
    }
    OBR.scene.local.addItems(addItemsArray); //bulk add items 
    OBR.scene.local.deleteItems(deleteItemsArray); //bulk delete items
    //clear add and delete arrays arrays
    addItemsArray.length = 0;
    deleteItemsArray.length = 0;

    //update global item id list for orphaned health bar monitoring
    var itemIds: String[] = [];
    for(const item of items) {
        itemIds.push(item.id);
    }
    tokenIds = itemIds;
}

export async function initScene() {

    // Handle when the scene is either changed or made ready after extension load
    OBR.scene.onReadyChange((isReady) => {
        if (isReady) {
            refreshAllHealthBars();
            startHealthBarUpdates();
        }
    });
  
    // Check if the scene is already ready once the extension loads
    const isReady = await OBR.scene.isReady();
    if (isReady) {
        refreshAllHealthBars();
        startHealthBarUpdates();
    }
}