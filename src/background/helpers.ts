import OBR, { AttachmentBehavior, Image, Item, buildShape, buildText, isImage } from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import nameTagIcon from "../name-tags/nameTag.svg";
import { ActionMetadataId, actionInputs } from "../action/ActionInputClass";

var tokenIds: String[] = []; // for orphan health bar management
var itemsLast: Image[] = []; // for item change checks
var addItemsArray: Item[] = []; // for bulk addition or changing of items  
var deleteItemsArray: string[] = []; // for bulk deletion of scene items
var verticalOffset: any = 0;
var barAtTop: boolean = false;
var nameTags: boolean = false;
var showBars: boolean = false;
var segments: number = 0;
var sceneListenersSet = false;

async function startHealthBarUpdates() {

    // generate all health bars based on scene token metadata
    //refreshAllHealthBars();

    if (!sceneListenersSet) {

        // Don't run this again unless the listeners have been unsubscribed
        sceneListenersSet = true;

        // Handle role changes
        const unSubscribeFromPlayer = OBR.player.onChange(async () => {
            refreshAllHealthBars();
            // console.log("helper player change: ")
            // console.log(player)
        });

        // Handle metadata changes
        const unsubscribeFromSceneMetadata = OBR.scene.onMetadataChange(async (metadata) => {

            // Do a refresh if an item change is detected
            if (await getGlobalSettings(metadata)) {
                refreshAllHealthBars();
            }
        });

        // Handle item changes (Update health bars)
        const unsubscribeFromItems = OBR.scene.items.onChange(async (itemsFromCallback) => {

            // Filter items for only images from character, mount, and prop layers
            let images: Image[] = [];
            for (let item of itemsFromCallback) {
                if ((item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)) {
                    images.push(item);
                }
            }

            //get rid of health bars that no longer attach to anything
            await deleteOrphanHealthBars(images);
    
            //create list of modified items
            var changedItems: Image[] = [];
            for (let i = 0; i < images.length; i++) {
    
                if(i > itemsLast.length - 1) { //check for extra items at the end of the list 
                    changedItems.push(images[i]);
                } else if( //check for scaling changes
                    !((itemsLast[i].scale.x == images[i].scale.x) &&
                    (itemsLast[i].scale.y == images[i].scale.y) &&
                    ((itemsLast[i].name == images[i].name) || !nameTags))
                ) {
                    deleteItemsArray.push(images[i].id + "health-label");
                    deleteItemsArray.push(images[i].id + "name-tag-text");
                    changedItems.push(images[i]);
                } else if( //check position, visibility, and metadata changes
                    !((itemsLast[i].position.x == images[i].position.x) &&
                    (itemsLast[i].position.y == images[i].position.y) &&
                    (itemsLast[i].visible == images[i].visible) &&
                    (JSON.stringify(itemsLast[i].metadata[getPluginId("metadata")]) == JSON.stringify(images[i].metadata[getPluginId("metadata")])) &&
                    (JSON.stringify(itemsLast[i].metadata[getPluginId("name-tag")]) == JSON.stringify(images[i].metadata[getPluginId("name-tag")])))
                ) { //update items
                    changedItems.push(images[i]);
                }
            }

            //update array of all items currently on the board
            itemsLast = images;

            //draw health bars
            const role = await OBR.player.getRole();
            for (const item of changedItems) {
                await drawHealthBar(item, role);
            }

            //bulk delete items
            await OBR.scene.local.deleteItems(deleteItemsArray);

            //bulk add items 
            await OBR.scene.local.addItems(addItemsArray);
    
            //clear add and delete arrays arrays
            addItemsArray.length = 0;
            deleteItemsArray.length = 0;

        });

        // Unsubscribe listeners that rely on the scene if it stops being ready
        const unsubscribeFromScene = OBR.scene.onReadyChange((isReady) => {
            if (!isReady) {
                unSubscribeFromPlayer();
                unsubscribeFromSceneMetadata();
                unsubscribeFromItems();
                unsubscribeFromScene();
                sceneListenersSet = false;
            }
        });
    }
};

async function drawHealthBar(item: Image, role: "PLAYER" | "GM") {
    
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
        if (error instanceof TypeError) {
            visible = true;
        } else {
            throw error;
        }
    }

    const nameTagMetadata: any = item.metadata[getPluginId("name-tag")];

    //try to extract armor class metadata
    let nameTagEnabled: boolean;
    try {
        nameTagEnabled = nameTagMetadata["enable-name-tag"];
    } catch (error) {
        nameTagEnabled = false;
    }

    let nameTagVisible: boolean;
    try {
        nameTagVisible = !nameTagMetadata["hide-name-tag"];
    } catch (error) {
        nameTagVisible = false;
    }

    if (!((role === "PLAYER") && !visible) || 
        (nameTags && nameTagEnabled && !((role === "PLAYER") && !nameTagVisible)) ||
        (showBars && maxHealth > 0)) {

        //get physical token properties
        const dpi = await OBR.scene.grid.getDpi();
        const bounds = getImageBounds(item, dpi);
        bounds.width = Math.abs(bounds.width);
        bounds.height = Math.abs(bounds.height);

        //set color based on visibility
        let healthBackgroundColor = "darkgrey";
        const setVisibilityProperty = item.visible;
        const backgroundOpacity = 0.6;
        const healthOpacity = 0.5;
        const bubbleOpacity = 0.6;
        if (!visible) {
            healthBackgroundColor = "black";
        }

        //attachment properties
        const diameter = 30;
        const font = "Lucida Console, monospace"
        const circleFontSize = diameter - 8;
        const circleTextHeight = diameter + 0;
        const textVerticalOffset = 1.5;
        const barHeight = 20;
        const disableAttachmentBehavior: AttachmentBehavior[] = ["ROTATION", "VISIBLE", "COPY", "SCALE"];
        const disableHit = true;

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
    
        if (!((role === "PLAYER") && !visible)) { //draw bar if it has max health and is visible

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
                .disableHit(disableHit)
                .build();

                const armorText = buildText()
                .position({x: armorPosition.x - diameter / 2 - 0.5, y: armorPosition.y - diameter / 2 + textVerticalOffset})
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
                .disableHit(disableHit)
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
                .disableHit(disableHit)
                .build();

                const tempHealthText = buildText()
                .position({x: tempHealthPosition.x - diameter / 2 - 0.5, y: tempHealthPosition.y - diameter / 2 + textVerticalOffset})
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
                .disableHit(disableHit)
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
                .disableHit(disableHit)
                .build();
                
                var healthPercentage = 0;
                if (segments !== 0) {}
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
                .disableHit(disableHit)
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
                .disableHit(disableHit)
                .build();

                //add health bar to add array
                addItemsArray.push(backgroundShape, healthShape, healthText);
            } else { // delete health bar
                await addHealthItemAttachmentsToDeleteList(item.id);
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
            
        } else if (showBars && maxHealth > 0){

            const smallBarHeight = 12;
            const barPadding = 2;
            const position = {
                x: origin.x - bounds.width / 2 + barPadding,
                y: origin.y - smallBarHeight - 2,
            };
            const barWidth = bounds.width - barPadding * 2;

            const backgroundShape = buildShape()
            .width(barWidth)
            .height(smallBarHeight)
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
            .disableHit(disableHit)
            .build();
            
            let healthPercentage = 0;
            if (health <= 0) {
                healthPercentage = 0;
            } else if (health < maxHealth) {
                if (segments === 0) {
                    healthPercentage = health / maxHealth;
                } else {
                    healthPercentage = Math.ceil((health / maxHealth)*segments)/segments;
                }
            } else if (health >= maxHealth){
                healthPercentage = 1;
            } else {
                healthPercentage = 0;
            }

        
            const healthShape = buildShape()
            .width(healthPercentage === 0 ? 0 : (barWidth) * healthPercentage)
            .height(smallBarHeight)
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
            .disableHit(disableHit)
            .build();

            //add health bar to add array
            addItemsArray.push(backgroundShape, healthShape);

            //clear other attachments
            deleteItemsArray.push(item.id + "health-label");
            addArmorItemAttachmentsToDeleteList(item.id);
            addTempHealthItemAttachmentsToDeleteList(item.id);

        } else { // delete health bar
            await addHealthItemAttachmentsToDeleteList(item.id);
            await addTempHealthItemAttachmentsToDeleteList(item.id);
            await addArmorItemAttachmentsToDeleteList(item.id);
        }

        if (nameTags && nameTagEnabled && !((role === "PLAYER") && !nameTagVisible)) {

            const letterWidth = 14;
            const nameTagHeight = 26
            let nameTagWidth = letterWidth * item.name.length + 4;

            var nameTagBackgroundColor = "darkgrey";
            if (!nameTagVisible) {
                nameTagBackgroundColor = "black";
            }

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
            .fillColor(nameTagBackgroundColor)
            .fillOpacity(backgroundOpacity)
            .strokeWidth(0)
            .position({x: position.x, y: position.y})
            .attachedTo(item.id)
            .layer("ATTACHMENT")
            .locked(true)
            .id(item.id + "name-tag-background")
            .visible(setVisibilityProperty)
            .disableAttachmentBehavior(disableAttachmentBehavior)
            .disableHit(disableHit)
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
            .disableHit(disableHit)
            .build();

            addItemsArray.push(nameTagBackground, nameTagText);

        } else {
            addNameTagItemAttachmentsToDeleteList(item.id);
        }
    } else {
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

    // load settings from scene metadata if not passed to function
    if (typeof sceneMetadata === 'undefined') {
        sceneMetadata = await OBR.scene.getMetadata();
    }

    // Variable indicating if health bar refresh is needed
    let doRefresh = false;

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

        if (typeof value === "undefined") {
            retrievedValue = false;
        }
    
        // If a value was retrieved try to update global variable value
        if (retrievedValue) {
    
            // Use validation appropriate to the input type
            if (actionInput.type === "CHECKBOX") {
    
                // Check if the new value is different from the previous and valid
                if (checkForSettingsValueChange(actionInput.id, value) && typeof value === "boolean" && value !== null) {

                    // Update global variable
                    updateSettingsValue(actionInput.id, value);

                    // Refresh needed due to settings change
                    doRefresh = true;
                }
    
            } else if (actionInput.type === "NUMBER") {
                
                // Check if the new value is different from the previous and valid
                if (checkForSettingsValueChange(actionInput.id, value) && typeof value === "number" && value !== null && !isNaN(value)) {

                    // Update global variable
                    updateSettingsValue(actionInput.id, value);

                    // Refresh needed due to settings change
                    doRefresh = true;
                }
    
            } else {
                throw "Error: bad input type."
            }

        } else {

            // Set to default values if setting could not be retrieved
            if (actionInput.type === "CHECKBOX") {
                updateSettingsValue(actionInput.id, false);
            } else if (actionInput.type === "NUMBER") {
                updateSettingsValue(actionInput.id, 0);
            }

            //console.log("Could not get " + actionInput.id) // Debug only
        }
    }

    return doRefresh;
}

function updateSettingsValue (id: ActionMetadataId, value: number | boolean) {
    if (id === "offset" && typeof value === "number") {
        verticalOffset = value;
    } else if (id === "bar-at-top" && typeof value === "boolean") {
        barAtTop = value;
    } else if (id === "show-bars" && typeof value === "boolean") {
        showBars = value;
    } else if (id === "segments" && typeof value === "number") {
        segments = value;
    } else if (id === "name-tags" && typeof value === "boolean") {
        nameTags = value;
        updateNameTagContextMenuIcon();
    } else {
        throw "Invalid update to " + id + " with value of type " + typeof value;
    }
}

function checkForSettingsValueChange (id: ActionMetadataId, value: number | boolean): boolean {
    if (id === "offset" && typeof value === "number") {
        return(verticalOffset !== value);
    } else if (id === "bar-at-top" && typeof value === "boolean") {
        return(barAtTop !== value);
    } else if (id === "show-bars" && typeof value === "boolean") {
        return(showBars !== value);
    } else if (id === "segments" && typeof value === "number") {
        return(segments !== value);
    } else if (id === "name-tags" && typeof value === "boolean") {
        return(nameTags !== value);
    } else {
        throw "Invalid check for " + id + " against value of type " + typeof value;
    }
}

async function updateNameTagContextMenuIcon() {
    
    if (nameTags) {

        //create name tag context menu icon
        OBR.contextMenu.create({
            id: getPluginId("gm-name-tag-menu"),
            icons: [
            {
                icon: nameTagIcon,
                label: "Manage Name Tag",
                filter: {
                every: [
                    { key: "type", value: "IMAGE" },
                    { key: "layer", value: "CHARACTER", coordinator: "||" },
                    { key: "layer", value: "MOUNT", coordinator: "||" },
                    { key: "layer", value: "PROP" },
                ],
                roles: ["GM"],
                //max: 1,
                },
            },
            ],

            onClick(_context, elementId) {
            OBR.popover.open({
                id: getPluginId("bubbles-name-tag"),
                url: "/src/name-tags/nameTagPopover.html",
                height: 100,
                width: 226,
                anchorElementId: elementId,
            });
            },
            //shortcut: "Shift + W"
        });

        OBR.contextMenu.create({
            id: getPluginId("player-name-tag-menu"),
            icons: [
            {
                icon: nameTagIcon,
                label: "Manage Name Tag",
                filter: {
                  every: [
                    { key: "type", value: "IMAGE" },
                    { key: "layer", value: "CHARACTER", coordinator: "||" },
                    { key: "layer", value: "MOUNT", coordinator: "||" },
                    { key: "layer", value: "PROP" },
                    { key: ["metadata", "com.owlbear-rodeo-bubbles-extension/name-tag", "hide-name-tag"], value: true, operator: "!="},
                  ],
                  permissions: ["UPDATE"],
                  roles: ["PLAYER"],
                  max: 1,
                },
              },
            ],

            onClick(_context, elementId) {
            OBR.popover.open({
                id: getPluginId("bubbles-name-tag"),
                url: "/src/name-tags/playerNameTagPopover.html",
                height: 50,
                width: 226,
                anchorElementId: elementId,
            });
            },
            //shortcut: "Shift + W"
        });
    } else {

        OBR.contextMenu.remove(getPluginId("gm-name-tag-menu"));
        OBR.contextMenu.remove(getPluginId("player-name-tag-menu"));
    }
}