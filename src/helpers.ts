import OBR, { Image, Item, buildShape, buildText, isImage } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

var tokenIds: String[] = []; // for orphan health bar management
var itemsLast: Image[] = []; // for item change checks
var addItemsArray: Item[] = []; // for bulk addition or changing of items  
var deleteItemsArray: string[] = []; // for bulk deletion of scene items
var initDone: boolean = false; // check if on change listener has been attached yet

class statBar {

    color: String;
    value: number;
    maxValue: number;
    position: number;

    constructor(
        color: String,
        value: number,
        maxValue: number,
        position: number
    ) {
        this.color = color
        this.value = value
        this.maxValue = maxValue
        this.position = position
    }
}

async function startHealthBarUpdates() {

    // generate all health bars based on scene token metadata
    //refreshAllHealthBars();

    //only execute this code once
    if (!initDone) {
        initDone = true;

        //update health bars on change
        OBR.scene.items.onChange(async (_) => {
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

                if (i > itemsLast.length - 1) { //check for extra items at the end of the list 
                    changedItems.push(items[i]);
                }
                else if ( //check for notable changes in item values
                    (itemsLast[i].position.x == items[i].position.x) &&
                    (itemsLast[i].position.y == items[i].position.y) &&
                    (itemsLast[i].scale.x == items[i].scale.x) &&
                    (itemsLast[i].scale.y == items[i].scale.y) &&
                    (itemsLast[i].rotation == items[i].rotation) &&
                    (itemsLast[i].visible == items[i].visible) &&
                    (JSON.stringify(itemsLast[i].metadata[getPluginId("metadata")]) == JSON.stringify(items[i].metadata[getPluginId("metadata")]))
                ) { } //do nothing
                else { //add changed items to change list
                    changedItems.push(items[i]);
                }
            }

            //update array of all items currently on the board
            itemsLast = items;

            //draw health bars
            const roll = await OBR.player.getRole();
            for (const item of changedItems) {
                await drawHealthBars(item, roll);
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
const drawHealthBars = async (item: Image, roll: "GM" | "PLAYER") => {

    //get item metadata
    const metadata: any = item.metadata[getPluginId("metadata")];

    //try to extract visibility from metadata
    var visible: boolean;
    try {
        visible = !metadata["hide"];
    } catch (error) {
        visible = true;
    }

    //const roll = await OBR.player.getRole(); //this could be done outside the function and passed in to improve efficiency
    if (!(roll === "PLAYER" && !visible)) { //draw stats if visible

        //extract bar values from token metadata
        let statBars: statBar[] = [];
        let barCount: number = 0;
        const colors: String[] = ["red", "lightgreen", "lightblue"]; 

        for (let i = 1; i < 4; i++) {   //for 1 to 3


            //check for max value
            let maxValue: number;
            try {
                maxValue = parseFloat(metadata["max-stat-" + i]);
            } catch (error) {
                maxValue = 0;
            }
            if (!(isNaN(maxValue) || maxValue <= 0)) { //if max value is valid

                //check for health value
                let value: number;
                try {
                    value = parseFloat(metadata["stat-" + i])
                } catch (error) {
                    value = 0;
                }
                if (isNaN(value)) {
                    value = 0;
                }

                //add bar to build list
                statBars.push(new statBar(colors[i - 1], value, maxValue, barCount++));


            } else {

                //add bar to delete list
                deleteItemsArray.push(item.id + colors[i - 1], item.id + colors[i - 1] + "-label");
            }
        }

        if (statBars.length > 0) {

            //console.log(statBars);

            //get physical token properties
            const barHeight = 16;
            const dpi = await OBR.scene.grid.getDpi();
            const bounds = getImageBounds(item, dpi);

            const barOrigin = {
                x: item.position.x - bounds.width / 2,
                y: item.position.y - bounds.height / 2 - barHeight,
            };

            //set color based on visibility
            var color = "darkgrey";
            if (!visible) {
                color = "black";
            }

            let backgroundOffset: number;
            switch (statBars.length) {
                case 1:
                    backgroundOffset = 0;
                    break;
                case 2:
                    backgroundOffset = statBars.length * barHeight / 2;
                    break;
                default:
                    backgroundOffset = statBars.length * barHeight / 1.5;
                    break;
            }

            const backgroundShape = buildShape()
                .width(bounds.width)
                .height(barHeight * statBars.length)
                .shapeType("RECTANGLE")
                .fillColor(color)
                .fillOpacity(0.7)
                .strokeColor(color)
                .strokeOpacity(0.5)
                .strokeWidth(0)
                .position({ x: barOrigin.x, y: barOrigin.y - backgroundOffset})
                .disableAttachmentBehavior(["ROTATION"])
                .attachedTo(item.id)
                .layer("ATTACHMENT")
                .locked(true)
                .id(item.id + "-background")
                .visible(item.visible)
                .build();

            for (const statBar of statBars) {

                //calculate fill percentage
                let percentage = 0;
                if (statBar.value <= 0) {
                    percentage = 0;
                } else if (statBar.value < statBar.maxValue) {
                    percentage = statBar.value / statBar.maxValue;
                } else if (statBar.value >= statBar.maxValue) {
                    percentage = 1;
                } else {
                    percentage = 0;
                }

                const fillShape = buildShape()
                    .width(percentage === 0 ? 0 : (bounds.width) * percentage)
                    .height(barHeight)
                    .shapeType("RECTANGLE")
                    .fillColor(statBar.color.valueOf())
                    .fillOpacity(0.5)
                    .strokeWidth(0)
                    .strokeOpacity(0)
                    .position({ x: barOrigin.x, y: barOrigin.y - statBar.position * barHeight})
                    .disableAttachmentBehavior(["ROTATION"])
                    .attachedTo(item.id)
                    .layer("ATTACHMENT")
                    .locked(true)
                    .id(item.id + statBar.color)
                    .visible(item.visible)
                    .build();

                const statLabel = buildText()
                    .position({ x: barOrigin.x, y: barOrigin.y + 1.5 - statBar.position * barHeight})
                    .disableAttachmentBehavior(["ROTATION"])
                    .plainText("" + statBar.value + "/" + statBar.maxValue)
                    .textAlign("CENTER")
                    .textAlignVertical("MIDDLE")
                    .fontSize(barHeight + 0)
                    .fontFamily("sans-serif")
                    .textType("PLAIN")
                    .height(barHeight + 0)
                    .width(bounds.width)
                    .fontWeight(400)
                    .visible(item.visible)
                    //.strokeColor("black")
                    //.strokeWidth(0)
                    .attachedTo(item.id)
                    .layer("TEXT")
                    .locked(true)
                    .id(item.id + statBar.color + "-label")
                    .build();

                addItemsArray.push(backgroundShape, fillShape, statLabel);
                
            }
        } else { // delete health bar

            deleteItemsArray.push(item.id + "-background");
        }
        
        
    } else {
        deleteItemsArray.push(item.id + "-background");
        const colors: String[] = ["red", "lightgreen", "lightblue"]; 
        for (const color of colors) {
            deleteItemsArray.push("" + item.id + color, "" + item.id + color + "-label");

        }
    }

    return [];
}

// async function buildHealthBar(value: number, maxValue: number, statNumber: number, verticalOffset: number,) {
//     addItemsArray.push(stat, maxStat, text);
// }

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
    for (const item of newItems) {
        newItemIds.push(item.id);
    }

    var orphanFound = false;

    //check for orphaned health bars
    for (const oldId of tokenIds) {
        if (!newItemIds.includes(oldId)) {

            // delete orphaned health bar
            deleteItemsArray.push(oldId + "-background")
            const colors: String[] = ["red", "lightgreen", "lightblue"]; 
            for (const color of colors) {
                deleteItemsArray.push("" + oldId + color, "" + oldId + color + "-label");

            }

            orphanFound = true;
        }
    }

    OBR.scene.local.deleteItems(deleteItemsArray);
    deleteItemsArray.length = 0;

    // update item list with current values
    tokenIds = newItemIds;

    // update current items list
    if (orphanFound) {
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
        await drawHealthBars(item, roll);
    }
    OBR.scene.local.addItems(addItemsArray); //bulk add items 
    OBR.scene.local.deleteItems(deleteItemsArray); //bulk delete items
    //clear add and delete arrays arrays
    addItemsArray.length = 0;
    deleteItemsArray.length = 0;

    //update global item id list for orphaned health bar monitoring
    var itemIds: String[] = [];
    for (const item of items) {
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