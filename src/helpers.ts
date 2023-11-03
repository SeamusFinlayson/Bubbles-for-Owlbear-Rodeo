import OBR, { AttachmentBehavior, Image, Item, buildShape, buildText, isImage } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import { offsetMetadataId, barAtTopMetadataId, nameTagsMetadataId } from "./sceneMetadataObjects";

var tokenIds: String[] = []; // for orphan health bar management
var itemsLast: Image[] = []; // for item change checks
var addItemsArray: Item[] = []; // for bulk addition or changing of items  
var deleteItemsArray: string[] = []; // for bulk deletion of scene items
var initDone: boolean = false; // check if on change listener has been attached yet
var verticalOffset: any = 0;
var barAtTop: boolean = false;
var nameTags: boolean = false;

async function startHealthBarUpdates() {

    // generate all health bars based on scene token metadata
    //refreshAllHealthBars();

    //only execute this code once
    if (!initDone) {
        initDone = true;
        //console.log("Starting health bars")

        // Handle role changes
        // OBR.player.onChange(async (player) => {
        //     //await refreshAllHealthBars();
        //     // console.log("helper player change: ")
        //     // console.log(player)
        // });

        //update health bars on change
        OBR.scene.items.onChange( async (itemsFromCallback) => {
            //console.log("Item change detected")
    
            //get rid of health bars that no longer attach to anything
            let imagesFromCallback: Image[] = [];
            for (let item of itemsFromCallback) {
                if ((item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)) {
                    imagesFromCallback.push(item);
                }
            }
            await deleteOrphanHealthBars(imagesFromCallback);
    
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
                    (itemsLast[i].scale.y == items[i].scale.y) &&
                    ((itemsLast[i].name == items[i].name) || !nameTags))
                ) {
                    deleteItemsArray.push(items[i].id + "health-label");
                    deleteItemsArray.push(items[i].id + "name-tag-text");
                    changedItems.push(items[i]);
                } else if( //check position and visibility changes
                    !((itemsLast[i].position.x == items[i].position.x) &&
                    (itemsLast[i].position.y == items[i].position.y) &&
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

        OBR.scene.onMetadataChange(async (metadata) => {

            if (await getGlobalSettings(metadata)) {
                refreshAllHealthBars();
            }
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
    } catch (error) { // catch type error
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
        const dpi = await OBR.scene.grid.getDpi();
        const bounds = getImageBounds(item, dpi);
        bounds.width = Math.abs(bounds.width);
        bounds.height = Math.abs(bounds.height);
        let disableAttachmentBehavior: AttachmentBehavior[] = ["ROTATION", "VISIBLE", "COPY", "SCALE"];

        //set color based on visibility
        var healthBackgroundColor = "darkgrey";
        let setVisibilityProperty = item.visible;
        let backgroundOpacity = 0.6;
        let healthOpacity = 0.5;
        let bubbleOpacity = 0.6;
        if (!visible) {
            healthBackgroundColor = "black";
            // setVisibilityProperty = true;
            // backgroundOpacity = 0.7;
            // healthOpacity = 0.5;
        }

        //attachment properties
        const diameter = 30;
        const font = "Lucida Console, monospace"
        const circleFontSize = diameter - 8;
        const circleTextHeight = diameter + 0;
        const textVerticalOffset = 1.5;
        const barHeight = 20;

        let offsetBubbles = 0;
        if (maxHealth > 0) {
            offsetBubbles = 1;
        }

        let bottomMultiplier: number = 1;
        if (barAtTop) {
            bottomMultiplier = -1;
        }
        let origin = {
            x: item.position.x,
            y: item.position.y + bottomMultiplier * bounds.height / 2 - verticalOffset,
        }

        let drewArmorClass = false;
        if (armorClass > 0) {
            drewArmorClass = true;
            
            let armorPosition;
            armorPosition = {
                x: origin.x + bounds.width / 2 - diameter / 2 - 2,
                y: origin.y - diameter / 2 - 4 - barHeight * offsetBubbles,
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
            .disableAttachmentBehavior(disableAttachmentBehavior)
            .build();

            const armorText = buildText()
            .position({x: armorPosition.x - diameter / 2 - 0, y: armorPosition.y - diameter / 2 + textVerticalOffset})
            .plainText("" + armorClass)
            .textAlign("CENTER")
            .textAlignVertical("MIDDLE")
            .fontSize(circleFontSize)
            .fontFamily(font)
            .textType("PLAIN")
            .height(circleTextHeight)
            .width(diameter)
            .fontWeight(400)
            //.strokeColor("black")
            //.strokeWidth(0)
            .attachedTo(item.id)
            .layer("TEXT")
            .locked(true)
            .id(item.id + "ac-label")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(disableAttachmentBehavior)
            .build();

            addItemsArray.push(backgroundShape, armorText);
        } else {
            addArmorItemAttachmentsToDeleteList(item.id);
        }

        //let drewTempHealth = false
        if (tempHealth > 0) {
            //drewTempHealth = true;

            const color = "olivedrab"

            let tempHealthPosition;
            if (drewArmorClass) {
                tempHealthPosition = {
                    x: origin.x + bounds.width / 2 - diameter * 3 / 2 - 4,
                    y: origin.y - diameter / 2 - 4 - barHeight * offsetBubbles,
                }
            } else {
                tempHealthPosition = {
                    x: origin.x + bounds.width / 2 - diameter / 2 - 2,
                    y: origin.y  - diameter / 2 - 4 - barHeight * offsetBubbles,
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
            .disableAttachmentBehavior(disableAttachmentBehavior)
            .build();

            const tempHealthText = buildText()
            .position({x: tempHealthPosition.x - diameter / 2 - 0, y: tempHealthPosition.y - diameter / 2 + textVerticalOffset})
            .plainText("" + tempHealth)
            .textAlign("CENTER")
            .textAlignVertical("MIDDLE")
            .fontSize(circleFontSize)
            .fontFamily(font)
            .textType("PLAIN")
            .height(circleTextHeight)
            .width(diameter)
            .fontWeight(400)
            //.strokeColor("black")
            //.strokeWidth(0)
            .attachedTo(item.id)
            .layer("TEXT")
            .locked(true)
            .id(item.id + "temp-hp-label")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(disableAttachmentBehavior)
            .build();

            addItemsArray.push(tempHealthBackgroundShape, tempHealthText);
        } else {
            addTempHealthItemAttachmentsToDeleteList(item.id);
        }

        if (maxHealth > 0) {

            const barPadding = 2;
            // if (drewArmorClass && drewTempHealth) {
            //     spaceForCircles = 4 + diameter * 2;
            // } else if (drewArmorClass || drewTempHealth) {
            //     spaceForCircles = 2 + diameter;
            // }
            const position = {
                x: origin.x - bounds.width / 2 + barPadding,
                y: origin.y - barHeight - 2,
            };
            const barWidth = bounds.width - barPadding * 2;

            const barFontSize = circleFontSize;
            const barTextHeight = barHeight + 0;

            const backgroundShape = buildShape()
            .width(barWidth)
            .height(barHeight)
            .shapeType("RECTANGLE")
            .fillColor(healthBackgroundColor)
            .fillOpacity(backgroundOpacity)
            .strokeWidth(0)
            .position({x: position.x, y: position.y})
            .attachedTo(item.id)
            .layer("ATTACHMENT")
            .locked(true)
            .id(item.id + "health-background")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(disableAttachmentBehavior)
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
            .width(healthPercentage === 0 ? 0 : (barWidth) * healthPercentage)
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
            .disableAttachmentBehavior(disableAttachmentBehavior)
            .build();

            const healthText = buildText()
            .position({x: position.x, y: position.y + textVerticalOffset})
            .plainText("" + health + String.fromCharCode(0x2215) + maxHealth)
            .textAlign("CENTER")
            .textAlignVertical("MIDDLE")
            .fontSize(barFontSize)
            .fontFamily(font)
            .textType("PLAIN")
            .height(barTextHeight)
            .width(barWidth)
            .fontWeight(400)
            //.strokeColor("black")
            //.strokeWidth(0)
            .attachedTo(item.id)
            .fillOpacity(1)
            .layer("TEXT")
            .locked(true)
            .id(item.id + "health-label")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(disableAttachmentBehavior)
            .build();

            //add health bar to add array
            addItemsArray.push(backgroundShape, healthShape, healthText);
        } else { // delete health bar
            await addHealthItemAttachmentsToDeleteList(item.id);
        }

        if (nameTags) {

            const letterWidth = 16;
            const nameTagHeight = diameter
            let nameTagWidth = letterWidth * item.name.length;
            // if (nameTagWidth > bounds.width - (diameter * 2 + 6)) {
            //     nameTagWidth = bounds.width - (diameter * 2 + 6);
            // }

            const position = {
                x: origin.x - nameTagWidth / 2,
                y: origin.y,
            };

            const nameTagFontSize = circleFontSize;
            const nameTagTextHeight = nameTagHeight + 0;

            const nameTagBackground = buildShape()
            .width(nameTagWidth)
            .height(nameTagHeight)
            .shapeType("RECTANGLE")
            .fillColor(healthBackgroundColor)
            .fillOpacity(backgroundOpacity)
            .strokeWidth(0)
            .position({x: position.x, y: position.y})
            .attachedTo(item.id)
            .layer("ATTACHMENT")
            .locked(true)
            .id(item.id + "name-tag-background")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(disableAttachmentBehavior)
            .build();

            const nameTagText = buildText()
            .position({x: position.x, y: position.y + textVerticalOffset})
            .plainText(item.name)
            .textAlign("CENTER")
            .textAlignVertical("MIDDLE")
            .fontSize(nameTagFontSize)
            .fontFamily(font)
            .textType("PLAIN")
            .height(nameTagTextHeight)
            .width(nameTagWidth)
            .fontWeight(400)
            //.strokeColor("black")
            //.strokeWidth(0)
            .attachedTo(item.id)
            .fillOpacity(1)
            .layer("TEXT")
            .locked(true)
            .id(item.id + "name-tag-text")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(disableAttachmentBehavior)
            .build();

            addItemsArray.push(nameTagBackground, nameTagText);

        } else {
            addNameTagItemAttachmentsToDeleteList(item.id);
        }

        // const position = {
        //     x: item.position.x,
        //     y: item.position.y + bounds.height / 2 + barHeight - 2,
        // };

        // const label = buildLabel()
        // .plainText("test")
        // .attachedTo(item.id)
        // .position(position)
        // .build();

        //addItemsArray.push(label);
        
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

async function deleteOrphanHealthBars(newItems?: Image[]) {

    //get ids of all items on map that could have health bars
    if (typeof newItems === "undefined") {
        newItems = await OBR.scene.items.getItems(
            (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
        );
    }
    
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
    OBR.scene.onReadyChange(async (isReady) => {
        if (isReady) {
            await getGlobalSettings();
            await refreshAllHealthBars();
            await startHealthBarUpdates();
        }
    });
  
    // Check if the scene is already ready once the extension loads
    const isReady = await OBR.scene.isReady();
    if (isReady) {
        await getGlobalSettings();
        await refreshAllHealthBars();
        await startHealthBarUpdates();
    }
}

//refresh all health bars on player roll change
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
        itemId + "temp-hp-label",
        itemId + "name-tag-background",
        itemId + "name-tag-text"
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

async function addNameTagItemAttachmentsToDeleteList(itemId: String) {
    deleteItemsArray.push(
        itemId + "name-tag-background",
        itemId + "name-tag-text"
    );
}

async function getGlobalSettings(sceneMetadata?: any) {

    // Variable indicating if health bar refresh is needed
    let doRefresh = false;

    // Variables to hold new global settings
    let newVerticalOffset: number;
    let newBarAtTop: boolean;
    let newNameTags: boolean;

    // load settings from scene metadata if not passed to function
    if (typeof sceneMetadata === 'undefined') {
        sceneMetadata = await OBR.scene.getMetadata();
    }

    // Try to extract vertical offset value from scene metadata
    try {
        newVerticalOffset = sceneMetadata[getPluginId("metadata")][offsetMetadataId];
    } catch (error) {
        if (error instanceof TypeError) {
            newVerticalOffset = 0;
        } else {
            throw error;
        }
    }
    
    // Check if the new value is different from the previous and valid
    if ((newVerticalOffset !== verticalOffset) && typeof newVerticalOffset === "number" && newVerticalOffset !== null && !isNaN(newVerticalOffset)) {

        // Update global variable
        verticalOffset = newVerticalOffset;

        // Refresh needed due to settings change
        doRefresh = true;
    }

    // Try to extract bar at top value from scene metadata 
    try {
        newBarAtTop = sceneMetadata[getPluginId("metadata")][barAtTopMetadataId];
    } catch (error) {
        if (error instanceof TypeError) {
            newBarAtTop = false;
        } else {
            throw error;
        }
    }

    // Check if the new value is different from the previous and valid
    if ((newBarAtTop !== barAtTop) && typeof newBarAtTop === "boolean" && newBarAtTop !== null) {

        // Update global variable
        barAtTop = newBarAtTop;

        // Refresh needed due to settings change
        doRefresh = true;
    }

    // Try to extract name tags value from scene metadata
    try {
        newNameTags = sceneMetadata[getPluginId("metadata")][nameTagsMetadataId];        
    } catch (error) {
        if (error instanceof TypeError) {
            newNameTags = false;
        } else {
            throw error;
        }
    }

    // Check if the new value is different from the previous and valid
    if ((newNameTags !== nameTags) && typeof newNameTags === "boolean" && newNameTags !== null) {

        // Update global variable
        nameTags = newNameTags;

        // Refresh needed due to settings change
        doRefresh = true;
    }

    // Debug only
    // if (doRefresh) {
    //     console.log("Refresh flag set...")
    // } else {
    //     console.log("No refresh needed.")
    // }

    return doRefresh;
}