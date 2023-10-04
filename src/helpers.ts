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
                } else if( //check for scaling changes
                    !((itemsLast[i].scale.x == items[i].scale.x) &&
                    (itemsLast[i].scale.y == items[i].scale.y))
                ) {
                    deleteItemsArray.push(items[i].id + "health-label");
                    changedItems.push(items[i]);
                } else if( //check position and visibility changes
                    !((itemsLast[i].position.x == items[i].position.x) &&
                    (itemsLast[i].position.y == items[i].position.y) &&
                    // (itemsLast[i].rotation == items[i].rotation) && //shouldn't need this check anymore because attachment rotation is disabled
                    (itemsLast[i].visible == items[i].visible) &&
                    (JSON.stringify(itemsLast[i].metadata[getPluginId("metadata")]) == JSON.stringify(items[i].metadata[getPluginId("metadata")])))
                ) { //update items
                    changedItems.push(items[i]);
                }
            }
    
            //update array of all items currently on the board
            itemsLast = items;
    
            //draw health bars
            const roll = await OBR.player.getRole();
            for (const item of changedItems) {
                await drawHealthBar(item, roll);
            }
            //console.log("Detected " + changedItems.length + " changes");

            //bulk delete items
            OBR.scene.local.deleteItems(deleteItemsArray);

            //bulk add items 
            OBR.scene.local.addItems(addItemsArray);
    
            //clear add and delete arrays arrays
            addItemsArray.length = 0;
            deleteItemsArray.length = 0;
        });
    }
};

const drawHealthBar = async (item: Image, roll: String) => {

    const metadata: any = item.metadata[getPluginId("metadata")];

    //try to extract armor class metadata
    let armorClass: number;
    try {
        armorClass = parseFloat(metadata["armor class"]);
    } catch (error) {
        armorClass = 0;
    }
    if(isNaN(armorClass)) {
        armorClass = 0;
    }

    //try to extract temporary health metadata
    let tempHealth: number;
    try {
        tempHealth = parseFloat(metadata["temporary health"]);
    } catch (error) {
        tempHealth = 0;
    }
    if(isNaN(tempHealth)) {
        tempHealth = 0;
    }

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
    
    if (!((roll === "PLAYER") && !visible)) { //draw bar if it has max health and is visible

        //get physical token properties
        const barHeight = 26;
        const dpi = await OBR.scene.grid.getDpi();
        const bounds = getImageBounds(item, dpi);
        bounds.width = Math.abs(bounds.width);
        bounds.height = Math.abs(bounds.height);
        const position = {
            x: item.position.x - bounds.width / 2,
            y: item.position.y - bounds.height / 2 - barHeight,
        };

        //set color based on visibility
        var healthBackgroundColor = "darkgrey";
        let setVisibilityProperty = item.visible;
        let backgroundOpacity = 0.7;
        let healthOpacity = 0.5;
        let bubbleOpacity = 0.5;
        if (!visible) {
            healthBackgroundColor = "black";
            setVisibilityProperty = false;
            backgroundOpacity = 1;
            healthOpacity = 0.8;
            bubbleOpacity = 1;
        }

        //set stat circle properties
        const diameter = 30;

        let drewArmorClass = false;
        if (armorClass > 0) {
            drewArmorClass = true;
            
            let armorPosition;
            armorPosition = {
                x: item.position.x + bounds.width / 2 - diameter / 2 - 2,
                y: item.position.y + bounds.height / 2 - diameter / 2 - 2,
            }

            const color = "cornflowerblue" //"#5c8fdb"

            const backgroundShape = buildShape()
            .width(bounds.width)
            .height(diameter)
            .shapeType("CIRCLE")
            .fillColor(color)
            .fillOpacity(bubbleOpacity)
            .strokeColor(color)
            .strokeOpacity(0.5)
            .strokeWidth(0)
            .position({x: armorPosition.x, y: armorPosition.y})
            .attachedTo(item.id)
            .layer("ATTACHMENT")
            .locked(true)
            .id(item.id + "ac-background")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(["ROTATION", "VISIBLE"])
            .build();

            const armorText = buildText()
            .position({x: armorPosition.x - diameter / 2 - 0, y: armorPosition.y - diameter / 2 - 1.2})
            .plainText("" + armorClass)
            .textAlign("CENTER")
            .textAlignVertical("TOP")
            .fontSize(diameter - 6)
            .fontFamily("monospace, monospace")
            .textType("PLAIN")
            .height(diameter -10)
            .width(diameter)
            .fontWeight(400)
            //.strokeColor("black")
            //.strokeWidth(0)
            .attachedTo(item.id)
            .layer("TEXT")
            .locked(true)
            .id(item.id + "ac-label")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(["ROTATION", "VISIBLE"])
            .build();

            addItemsArray.push(backgroundShape, armorText);
        } else {
            addArmorItemAttachmentsToDeleteList(item.id);
        }

        let drewTempHealth = false
        if (tempHealth > 0) {
            drewTempHealth = true;

            const color = "olivedrab"

            let tempHealthPosition;
            if (drewArmorClass) {
                tempHealthPosition = {
                    x: item.position.x + bounds.width / 2 - diameter * 3 / 2 - 4,
                    y: item.position.y + bounds.height / 2 - diameter / 2 - 2,
                }
            } else {
                tempHealthPosition = {
                    x: item.position.x + bounds.width / 2 - diameter / 2 - 2,
                    y: item.position.y + bounds.height / 2 - diameter / 2 - 2,
                }
            }

            const tempHealthBackgroundShape = buildShape()
            .width(bounds.width)
            .height(diameter)
            .shapeType("CIRCLE")
            .fillColor(color)
            .fillOpacity(bubbleOpacity)
            .strokeColor(color)
            .strokeOpacity(0.5)
            .strokeWidth(0)
            .position({x: tempHealthPosition.x, y: tempHealthPosition.y})
            .attachedTo(item.id)
            .layer("ATTACHMENT")
            .locked(true)
            .id(item.id + "temp-hp-background")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(["ROTATION", "VISIBLE"])
            .build();

            const tempHealthText = buildText()
            .position({x: tempHealthPosition.x - diameter / 2 - 0, y: tempHealthPosition.y - diameter / 2 - 1.2})
            .plainText("" + tempHealth)
            .textAlign("CENTER")
            .textAlignVertical("TOP")
            .fontSize(diameter - 6)
            .fontFamily("monospace, monospace")
            .textType("PLAIN")
            .height(diameter -10)
            .width(diameter)
            .fontWeight(400)
            //.strokeColor("black")
            //.strokeWidth(0)
            .attachedTo(item.id)
            .layer("TEXT")
            .locked(true)
            .id(item.id + "temp-hp-label")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(["ROTATION", "VISIBLE"])
            .build();

            addItemsArray.push(tempHealthBackgroundShape, tempHealthText);
        } else {
            addTempHealthItemAttachmentsToDeleteList(item.id);
        }

        if (maxHealth > 0) {

            const backgroundShape = buildShape()
            .width(bounds.width)
            .height(barHeight)
            .shapeType("RECTANGLE")
            .fillColor(healthBackgroundColor)
            .fillOpacity(backgroundOpacity)
            .strokeColor(healthBackgroundColor)
            .strokeOpacity(0)
            .strokeWidth(0)
            .position({x: position.x, y: position.y})
            .attachedTo(item.id)
            .layer("ATTACHMENT")
            .locked(true)
            .id(item.id + "health-background")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(["ROTATION", "VISIBLE"])
            .build();
            
            var healthPercentage = 0;
            if (health <= 0) {
                healthPercentage = 0;
            } else if (health < maxHealth) {
                healthPercentage = health / maxHealth;
            } else if (health >= maxHealth){
                healthPercentage = 1;
            } else {
                healthPercentage = 0;
            }
        
            const healthShape = buildShape()
            .width(healthPercentage === 0 ? 0 : (bounds.width) * healthPercentage)
            .height(barHeight)
            .shapeType("RECTANGLE")
            .fillColor("red")
            .fillOpacity(healthOpacity)
            .strokeWidth(0)
            .strokeOpacity(0)
            .position({ x: position.x, y: position.y})
            .attachedTo(item.id)
            .layer("ATTACHMENT")
            .locked(true)
            .id(item.id + "health")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(["ROTATION", "VISIBLE"])
            .build();

            const healthText = buildText()
            .position({x: position.x, y: position.y + 2})
            .plainText("" + health + "/" + maxHealth)
            .textAlign("CENTER")
            .textAlignVertical("MIDDLE")
            .fontSize(barHeight + 0)
            .fontFamily("Lucidia Console, sans-serif")
            .textType("PLAIN")
            .height(barHeight + 0)
            .width(bounds.width)
            .fontWeight(400)
            //.strokeColor("black")
            //.strokeWidth(0)
            .attachedTo(item.id)
            .fillOpacity(1)
            .layer("TEXT")
            .locked(true)
            .id(item.id + "health-label")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(["ROTATION", "VISIBLE"])
            .build();

            //add health bar to add array
            addItemsArray.push(backgroundShape, healthShape, healthText);
        }
        else { // delete health bar

            await addHealthItemAttachmentsToDeleteList(item.id);

        }
        
        
    } else { // delete health bar

        await addAllItemAttachmentsToDeleteList(item.id);

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
            addAllItemAttachmentsToDeleteList(oldId);

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
    const roll = await OBR.player.getRole();
    for (const item of items) {
        await drawHealthBar(item, roll);
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

// OBR.player.onChange((player) => {
    
// })

async function addAllItemAttachmentsToDeleteList(itemId: String) {
    deleteItemsArray.push(
        itemId + "health-background", 
        itemId + "health", 
        itemId + "health-label",
        itemId + "ac-background",
        itemId + "ac-label",
        itemId + "temp-hp-background",
        itemId + "temp-hp-label"
    );
}

async function addHealthItemAttachmentsToDeleteList(itemId: String) {
    deleteItemsArray.push(
        itemId + "health-background", 
        itemId + "health", 
        itemId + "health-label",
    );
}

async function addArmorItemAttachmentsToDeleteList(itemId: String) {
    deleteItemsArray.push(
        itemId + "ac-background",
        itemId + "ac-label"
    );
}

async function addTempHealthItemAttachmentsToDeleteList(itemId: String) {
    deleteItemsArray.push(
        itemId + "temp-hp-background",
        itemId + "temp-hp-label"
    );
}