import OBR, { Image, buildShape, isImage } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";



export async function updateHealthBars() {

    //get shapes from scene
    const items: Image[] = await OBR.scene.items.getItems(
        (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
    );

    //draw health bars
    for (const item of items) {
        await drawHealthBar(item);
    }

    //delete health bars that don't get deleted when their parent token is deleted
    var itemIds: String[] = [];
    for(const item of items) {
        itemIds.push(item.id);
    }
    deleteOrphanHealthBars(itemIds);

    //update health bars on change
    OBR.scene.items.onChange( async () => {
        console.log("Item change detected")

        //get shapes from scene
        const items: Image[] = await OBR.scene.items.getItems(
            (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
        );

        //draw health bars
        for (const item of items) {
            drawHealthBar(item);
        }
    });

    //changes in meta data - I have never seen this execute
    OBR.scene.onMetadataChange( async () => {
        console.log("Metadata change detected")
    });
};

export const drawHealthBar = async (item: Image) => {

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

        const roll = await OBR.player.getRole();

        //hide old shape from player
        if ((roll === "PLAYER" && !visible)) {
            await OBR.scene.local.deleteItems([item.id + "health-background", item.id + "health"]);
        }

        //only show player visible shapes
        if (roll === "PLAYER" && visible) {
            await OBR.scene.local.addItems([backgroundShape, hpShape]);
        } else if (roll === "GM" ) { //show gm all shapes
            await OBR.scene.local.addItems([backgroundShape, hpShape]);
        }
    
    } else { // delete items

        await OBR.scene.items.deleteItems([item.id + "health-background", item.id + "health"]);
        await OBR.scene.local.deleteItems([item.id + "health-background", item.id + "health"]);
    
    }

    return[];
}

const getImageBounds = (item: Image, dpi: number) => {
    const dpiScale = dpi / item.grid.dpi;
    const width = item.image.width * dpiScale * item.scale.x;
    const height = item.image.height * dpiScale * item.scale.y;
    return { width, height };
};

export async function initializeHealthBars(flag: boolean) {
    if(flag === false) {
        console.log("Not ready")
       window.setTimeout(initializeHealthBars, 100); /* this checks the flag every 100 milliseconds*/
    } else {
        console.log("Ready")
        try {
            await OBR.scene.items.getItems(
                (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
              );
            updateHealthBars()
        } catch (error) {
            console.log("It lied")
            console.log(error)
            window.setTimeout(initializeHealthBars, 100);
        }
    }
}

export async function deleteOrphanHealthBars(oldItemIds: String[]) {

    //initialize item list -- should be done at call time
    console.log("clearing old ids")

    //get new items
    const newItems: Image[] = await OBR.scene.items.getItems(
        (item) => (item.layer === "CHARACTER" || item.layer === "MOUNT" || item.layer === "PROP") && isImage(item)
    );
    var newItemIds: String[] = [];
    for(const item of newItems) {
        newItemIds.push(item.id);
    }

    //check for old health bars
    for(const oldId of oldItemIds) {
        if(!newItemIds.includes(oldId)) {

            // delete  old health bar
            await OBR.scene.local.deleteItems([oldId + "health-background", oldId + "health"]);


        }
    }

    //remove deleted ids from list
    //console.log(newItemIds);

    //use timeout to repeat call with updated item list
    setTimeout(function() {deleteOrphanHealthBars(newItemIds);}, 500);
}

