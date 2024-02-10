import OBR, { AttachmentBehavior, Image, Item, Shape, Text, buildShape, buildText, isImage } from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import nameTagIcon from "../name-tags/nameTag.svg";
import { ActionMetadataId, actionInputs } from "../action/ActionInputClass";
import { createHealthBar, createNameTag, createStatBubble } from "./createCompoundItems";
import { send } from "vite";

let tokenIds: string[] = []; // for orphan health bar management
let itemsLast: Image[] = []; // for item change checks
const addItemsArray: Item[] = []; // for bulk addition or changing of items  
const deleteItemsArray: string[] = []; // for bulk deletion of scene items
let verticalOffset = 0;
let barAtTop = false;
let nameTags: boolean = false;
let showBars: boolean = false;
let segments: number = 0;
// let negativeArmorClass: boolean = false;
let sceneListenersSet = false;
let userRoleLast: "GM" | "PLAYER";


async function startHealthBarUpdates() {

    // generate all health bars based on scene token metadata
    //refreshAllHealthBars();

    if (!sceneListenersSet) {

        // Don't run this again unless the listeners have been unsubscribed
        sceneListenersSet = true;

        // Initialize previous user role
        userRoleLast = await OBR.player.getRole();

        // Handle role changes
        const unSubscribeFromPlayer = OBR.player.onChange(async () => {

            // Do a refresh if player role change is detected
            const userRole = await OBR.player.getRole();
            if (userRole !== userRoleLast) {
                refreshAllHealthBars();
                userRoleLast = userRole;
            }
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
            const imagesFromCallback: Image[] = [];
            for (const item of itemsFromCallback) {
                if ((item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)) {
                    imagesFromCallback.push(item);
                }
            }

            //get rid of health bars that no longer attach to anything
            await deleteOrphanHealthBars(imagesFromCallback);
    
            //create list of modified and new items, skipping deleted items
            const changedItems: Image[] = [];
            let s = 0; // # items skipped in itemsLast array, caused by deleted items
            //let newCount = 0;
            for (let i = 0; i < imagesFromCallback.length; i++) {
    
                if(i > itemsLast.length - s - 1) { //check for new items at the end of the list
                    changedItems.push(imagesFromCallback[i]);
                    //newCount++;
                } else if (itemsLast[i+s].id !== imagesFromCallback[i].id) {
                    s++; // Skip an index in itemsLast
                    i--; // Reuse the index item in imagesFromCallback
                } else if( //check for scaling changes
                    !((itemsLast[i+s].scale.x === imagesFromCallback[i].scale.x) &&
                    (itemsLast[i+s].scale.y === imagesFromCallback[i].scale.y) &&
                    ((itemsLast[i+s].name === imagesFromCallback[i].name) || !nameTags))
                ) {
                    // Attachments must be deleted to prevent ghost selection highlight bug
                    deleteItemsArray.push(imagesFromCallback[i].id + "health-label");
                    deleteItemsArray.push(imagesFromCallback[i].id + "name-tag-text");
                    changedItems.push(imagesFromCallback[i]);
                } else if( //check position, visibility, and metadata changes
                    !((itemsLast[i+s].position.x === imagesFromCallback[i].position.x) &&
                    (itemsLast[i+s].position.y === imagesFromCallback[i].position.y) &&
                    (itemsLast[i+s].visible === imagesFromCallback[i].visible) &&
                    (JSON.stringify(itemsLast[i+s].metadata[getPluginId("metadata")]) === JSON.stringify(imagesFromCallback[i].metadata[getPluginId("metadata")])) &&
                    (JSON.stringify(itemsLast[i+s].metadata[getPluginId("name-tag")]) === JSON.stringify(imagesFromCallback[i].metadata[getPluginId("name-tag")])))
                ) { //update items
                    changedItems.push(imagesFromCallback[i]);
                }
            }

            // console.log("Skipped " + s + " items");
            // console.log(newCount + " new items");

            //update array of all items currently on the board
            itemsLast = imagesFromCallback;

            //draw health bars
            const role = await OBR.player.getRole();
            for (const item of changedItems) {
                await createAttachments(item, role);
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

async function createAttachments(item: Image, role: "PLAYER" | "GM") {

    // console.log("draw")

    // Extract metadata from the token
    const [
        health,
        maxHealth,
        tempHealth,
        armorClass,
        visible,
        nameTagEnabled,
        nameTagVisible,
    ] = getTokenMetadata(item);

    // Explicitly delete all attachment and return early if none are assigned to this item
    const noAttachments = () => !(
        !(role === "PLAYER" && !visible) ||
        (nameTags &&
            nameTagEnabled &&
            !(role === "PLAYER" && !nameTagVisible)) ||
        (showBars && maxHealth > 0)
    );
    if (noAttachments()) {
        await addAllItemAttachmentsToDeleteList(item.id);
        return;
    }

    //get physical token properties
    const dpi = await OBR.scene.grid.getDpi();
    const bounds = getImageBounds(item, dpi);
    bounds.width = Math.abs(bounds.width);
    bounds.height = Math.abs(bounds.height);

    //attachment properties
    const diameter = 30;
    const barHeight = 20;

    let offsetBubbles = 0;
    if (maxHealth > 0) {
        offsetBubbles = 1;
    }

    let alignBottomMultiplier = 1;
    if (barAtTop) {
        alignBottomMultiplier = -1;
    }
    const origin = {
        x: item.position.x,
        y: item.position.y + alignBottomMultiplier * bounds.height / 2 - verticalOffset,
    }
    if (barAtTop) {
        origin.y += 1;
    }

    if (!((role === "PLAYER") && !visible)) { //draw bar if 
        let drewArmorClass = false;
        
        if (armorClass > 0) {
            drewArmorClass = true;
            
            const armorPosition = {
                x: origin.x + bounds.width / 2 - diameter / 2 - 2,
                y: origin.y - diameter / 2 - 4 - barHeight * offsetBubbles,
            }
            if (barAtTop) {
                armorPosition.y = origin.y + diameter / 2;
            }

            addItemsArray.push(
                ...createStatBubble(
                    item,
                    bounds,
                    armorClass,
                    "cornflowerblue", //"#5c8fdb"
                    armorPosition,
                    "ac",
                ),
            );
        } else {
            addArmorItemAttachmentsToDeleteList(item.id);
        }

        if (tempHealth > 0) {
            let tempHealthPosition: { x: number; y: number };
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
            if (barAtTop) {
                tempHealthPosition.y = origin.y + diameter / 2;
            }

            addItemsArray.push(
                ...createStatBubble(
                    item,
                    bounds,
                    tempHealth,
                    "olivedrab",
                    tempHealthPosition,
                    "temp-hp",
                ),
            );
        } else {
            addTempHealthItemAttachmentsToDeleteList(item.id);
        }

        if (maxHealth > 0) {
            const barPadding = 2;
            const position = {
                x: origin.x - bounds.width / 2 + barPadding,
                y: origin.y - barHeight - 2,
            };

            addItemsArray.push(
                ...createHealthBar(
                    item,
                    bounds,
                    health,
                    maxHealth,
                    visible,
                    position,
                ),
            );
        } else { // delete health bar
            await addHealthItemAttachmentsToDeleteList(item.id);
        }
    } else if (showBars && maxHealth > 0){
        const smallBarHeight = 12;
        const barPadding = 2;
        const position = {
            x: origin.x - bounds.width / 2 + barPadding,
            y: origin.y - smallBarHeight - 2,
        };

        addItemsArray.push(
            ...createHealthBar(
                item,
                bounds,
                health,
                maxHealth,
                visible,
                position,
                "short",
                segments,
            ),
        );

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
        const nameTagWidth = letterWidth * item.name.length + 4;
        const position = {
            x: origin.x - nameTagWidth / 2,
            y: origin.y,
        };

        addItemsArray.push(...createNameTag(item, position, nameTagVisible));
    } else {
        addNameTagItemAttachmentsToDeleteList(item.id);
    }
}

function getTokenMetadata(
	item: Item,
): [
	health: number,
	maxHealth: number,
	tempHealth: number,
	armorClass: number,
	statsVisible: boolean,
	nameTagEnabled: boolean,
	nameTagVisible: boolean,
] {

    const  metadata: any = item.metadata[getPluginId("metadata")];

	//try to extract armor class metadata
	let armorClass: number;
	try {
		armorClass = parseFloat(metadata["armor class"]);
	} catch (error) {
		armorClass = 0;
	}
	if (Number.isNaN(armorClass)) {
		armorClass = 0;
	}

	//try to extract temporary health metadata
	let tempHealth: number;
	try {
		tempHealth = parseFloat(metadata["temporary health"]);
	} catch (error) {
		tempHealth = 0;
	}
	if (Number.isNaN(tempHealth)) {
		tempHealth = 0;
	}

	//try to extract health from metadata
	let health: number;
	let maxHealth: number;
	try {
		health = parseFloat(metadata["health"]);
		maxHealth = parseFloat(metadata["max health"]);
	} catch (error) {
		health = 0;
		maxHealth = 0;
	}
	if (Number.isNaN(health)) {
		health = 0;
	}
	if (Number.isNaN(maxHealth)) {
		maxHealth = 0;
	}

	//try to extract visibility from metadata
	let statsVisible: boolean;
	try {
		statsVisible = !metadata["hide"];
	} catch (error) {
		// catch type error
		if (error instanceof TypeError) {
			statsVisible = true;
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

	return [
		health,
		maxHealth,
		tempHealth,
		armorClass,
		statsVisible,
		nameTagEnabled,
		nameTagVisible,
	];
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
    
    const newItemIds: string[] = [];
    for(const item of newItems) {
        newItemIds.push(item.id);
    }

    //check for orphaned health bars
    for(const oldId of tokenIds) {
        if(!newItemIds.includes(oldId)) {

            // delete orphaned health bar
            addAllItemAttachmentsToDeleteList(oldId);
        }
    }

    // update item list with current values
    tokenIds = newItemIds;
}

async function refreshAllHealthBars() {

    //console.log("refresh")

    //get shapes from scene
    const items: Image[] = await OBR.scene.items.getItems(
        (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
    );

    //store array of all items currently on the board for change monitoring
    itemsLast = items;

    //draw health bars
    const roll = await OBR.player.getRole();
    for (const item of items) {
        await createAttachments(item, roll);
    }
    OBR.scene.local.addItems(addItemsArray); //bulk add items 
    OBR.scene.local.deleteItems(deleteItemsArray); //bulk delete items
    //clear add and delete arrays arrays
    addItemsArray.length = 0;
    deleteItemsArray.length = 0;

    //update global item id list for orphaned health bar monitoring
    const itemIds: string[] = [];
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