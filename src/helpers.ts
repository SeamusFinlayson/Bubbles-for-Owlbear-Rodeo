import OBR, { Image, buildShape, buildText, isImage } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

var tokenIds: String[] = [];
var itemsLast: Image[] = [];

async function updateHealthBars() {

    //get shapes from scene
    const items: Image[] = await OBR.scene.items.getItems(
        (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
    );

    itemsLast = items;


    //draw health bars
    for (const item of items) {
        await drawHealthBar(item);
    }

    //update global item id list for orphaned health bar monitoring
    var itemIds: String[] = [];
    for(const item of items) {
        itemIds.push(item.id);
    }
    tokenIds = itemIds;

    //update health bars on change
    OBR.scene.items.onChange( async () => {
        //console.log("Item change detected")

        //get rid of health bars that no longer attach to anything
        deleteOrphanHealthBars();

        //get shapes from scene
        const items: Image[] = await OBR.scene.items.getItems(
            (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
        );

        //console.log("Changed items length: " + items.length)


        //create list of modified items
        var changedItems: Image[] = [];
        for (let i = 0; (i < itemsLast.length) && (i < items.length); i++) {

            if(
                (itemsLast[i].position.x == items[i].position.x) &&
                (itemsLast[i].position.y == items[i].position.y) &&
                (itemsLast[i].scale.x == items[i].scale.x) &&
                (itemsLast[i].scale.y == items[i].scale.y) &&
                (itemsLast[i].rotation == items[i].rotation) &&
                (JSON.stringify(itemsLast[i].metadata[getPluginId("metadata")]) == JSON.stringify(items[i].metadata[getPluginId("metadata")]))) {
                // changedItems.splice(i);
                //console.log("same " + items[i].name);
            }
            else {
                //console.log("Changed: " + items[i].name);
                changedItems.push(items[i]);
            }
        }

        //console.log("Changed items length: " + changedItems.length)

        // for (const item of changedItems) {
        //     console.log(item);
        // }
        itemsLast = items;


        //maybe only find different objects then render those, im seeing some lag

        //draw health bars
        for (const item of changedItems) {
            drawHealthBar(item);
        }
    });
};

const drawHealthBar = async (item: Image) => {

    const height = 20;
    // const bounds = await OBR.scene.items.getItemBounds([item.id]);
    const dpi = await OBR.scene.grid.getDpi();
    const bounds = getImageBounds(item, dpi);
    // const offsetFactor = bounds.height / 150;
    // let offset = 130 * offsetFactor;
    const position = {
        x: item.position.x - bounds.width / 2,
        y: item.position.y - bounds.height / 2 - height,
    };

    const metadata: any = item.metadata[getPluginId("metadata")];

    //try to extract visibility from metadata
    var visible: boolean;
    try {
        visible = !metadata["hide"];
    } catch (error) {
        visible = true;
    }

    var color = "darkgray";
    if (!visible) {
        color = "black";
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
    
    if (maxHealth > 0) { //draw bar if it has max health

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
        //.visible(visible)
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
        //.visible(visible)
        .build();

        const healthLabel = buildText()
        .position({x: position.x, y: position.y + 2})
        //.plainText("" + health + "/" + maxHealth)
        .text({
            type: "PLAIN",
            plainText: "" + health + "/" + maxHealth,
            height: height,
            width: bounds.width,
            style: {
                fillColor: "#ffffff",
                fillOpacity: 1,
                strokeColor: "#000000",
                strokeOpacity: 0,
                strokeWidth: 0,
                textAlign: "CENTER",
                textAlignVertical: "MIDDLE",
                fontFamily: "Ariel, sans-serif",
                fontSize: height,
                fontWeight: 20,
                lineHeight: 1.2,
                padding: 0,
            },
            richText: [],
        })
        .attachedTo(item.id)
        .layer("TEXT")
        .locked(true)
        .id(item.id + "health-label")
        .build();

        const roll = await OBR.player.getRole();

        //hide old shape from player
        if ((roll === "PLAYER" && !visible)) {
            await OBR.scene.local.deleteItems([item.id + "health-background", item.id + "health", item.id + "health-label"]);
        }

        //only show player visible shapes
        if (roll === "PLAYER" && visible) {
            await OBR.scene.local.addItems([backgroundShape, hpShape, healthLabel]);
        } else if (roll === "GM" ) { //show gm all shapes
            await OBR.scene.local.addItems([backgroundShape, hpShape, healthLabel]);
        }
    
    } else { // delete health bar

        await OBR.scene.local.deleteItems([item.id + "health-background", item.id + "health", item.id + "health-label"]);
        //await OBR.scene.items.deleteItems([item.id + "health-background", item.id + "health", item.id + "health-label"]); //this line can probably go
    }

    return[];
}

const getImageBounds = (item: Image, dpi: number) => {
    const dpiScale = dpi / item.grid.dpi;
    const width = item.image.width * dpiScale * item.scale.x;
    const height = item.image.height * dpiScale * item.scale.y;
    return { width, height };
};

export async function startHealthBars(flag: boolean) {

    //detect when scene API is ready
    if(flag === false) {
        console.log("Not ready")
        window.setTimeout(startHealthBars, 100); /* this checks the flag every 100 milliseconds*/
    } else {
        console.log("Ready")
        try {
            await OBR.scene.items.getItems(
                (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
            );

            //start health bar management
            updateHealthBars()
        } catch (error) {
            console.log("It lied")
            console.log(error)
            window.setTimeout(startHealthBars, 100);
        }
    }
}

async function deleteOrphanHealthBars() {

    //get ids of all items on map that could have health bars
    const newItems: Image[] = await OBR.scene.items.getItems(
        (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
    );
    var newItemIds: String[] = [];
    for(const item of newItems) {
        newItemIds.push(item.id);
    }

    //check for orphaned health bars
    for(const oldId of tokenIds) {
        if(!newItemIds.includes(oldId)) {

            // delete orphaned health bar
            await OBR.scene.local.deleteItems([oldId + "health-background", oldId + "health", oldId + "health-label"]);
        }
    }

    // update item list with current values
    tokenIds = newItemIds;
}