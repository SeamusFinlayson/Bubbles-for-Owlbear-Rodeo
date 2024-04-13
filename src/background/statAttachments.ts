import OBR, { Image, Item, isImage } from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import {
  DIAMETER,
  FULL_BAR_HEIGHT,
  NAME_TAG_HEIGHT,
  addAllExtensionAttachmentsToArray,
  addArmorAttachmentsToArray,
  addHealthAttachmentsToArray,
  addNameTagAttachmentsToArray,
  addTempHealthAttachmentsToArray,
  createHealthBar,
  createNameTag,
  createNameTagBackground,
  createStatBubble,
  getNameTagTextId,
} from "./compoundItemHelpers";
import { getOriginAndBounds } from "./mathHelpers";
import { NAME_METADATA_ID, getName, getTokenMetadata } from "../itemHelpers";
import { Settings, getGlobalSettings } from "./getGlobalSettings";
import createContextMenuItems from "./contextMenuItems";

let tokenIds: string[] = []; // for orphan health bar management
let itemsLast: Image[] = []; // for item change checks
const addItemsArray: Item[] = []; // for bulk addition or changing of items
const deleteItemsArray: string[] = []; // for bulk deletion of scene items
const globalItemsWithNameTags: Item[] = [];
const settings: Settings = {
  verticalOffset: 0,
  barAtTop: false,
  nameTags: false,
  showBars: false,
  segments: 0,
};
let callbacksStarted = false;
let userRoleLast: "GM" | "PLAYER";

export default async function startBackground() {
  const start = async () => {
    await getGlobalSettings(settings);
    createContextMenuItems(settings);
    await refreshAllHealthBars();
    await startCallbacks();
  };

  // Handle when the scene is either changed or made ready after extension load
  OBR.scene.onReadyChange(async (isReady) => {
    if (isReady) start();
  });

  // Check if the scene is already ready once the extension loads
  const isReady = await OBR.scene.isReady();
  if (isReady) start();
}

async function refreshAllHealthBars() {
  //get shapes from scene
  const items: Image[] = await OBR.scene.items.getItems(
    (item) =>
      (item.layer === "CHARACTER" ||
        item.layer === "MOUNT" ||
        item.layer === "PROP") &&
      isImage(item),
  );

  //store array of all items currently on the board for change monitoring
  itemsLast = items;

  //draw health bars
  const roll = await OBR.player.getRole();
  const dpi = await OBR.scene.grid.getDpi();
  for (const item of items) {
    await createAttachments(item, roll, dpi);
  }
  await OBR.scene.local.addItems(addItemsArray); //bulk add items
  await OBR.scene.local.deleteItems(deleteItemsArray); //bulk delete items
  //clear add and delete arrays arrays
  addItemsArray.length = 0;
  deleteItemsArray.length = 0;

  //update global item id list for orphaned health bar monitoring
  const itemIds: string[] = [];
  for (const item of items) {
    itemIds.push(item.id);
  }
  tokenIds = itemIds;

  await createNameTagBackgrounds(globalItemsWithNameTags);
  globalItemsWithNameTags.length = 0;
}

async function startCallbacks() {
  if (!callbacksStarted) {
    // Don't run this again unless the listeners have been unsubscribed
    callbacksStarted = true;

    // Handle role changes
    userRoleLast = await OBR.player.getRole();
    const unSubscribeFromPlayer = OBR.player.onChange(async () => {
      // Do a refresh if player role change is detected
      const userRole = await OBR.player.getRole();
      if (userRole !== userRoleLast) {
        refreshAllHealthBars();
        userRoleLast = userRole;
      }
    });

    // Handle metadata changes
    const unsubscribeFromSceneMetadata = OBR.scene.onMetadataChange(
      async (metadata) => {
        // Do a refresh if an item change is detected
        if (await getGlobalSettings(settings, metadata)) {
          createContextMenuItems(settings);
          refreshAllHealthBars();
        }
      },
    );

    // Handle item changes (Update health bars)
    const unsubscribeFromItems = OBR.scene.items.onChange(
      async (itemsFromCallback) => {
        // Filter items for only images from character, mount, and prop layers
        const imagesFromCallback: Image[] = [];
        for (const item of itemsFromCallback) {
          if (
            (item.layer === "CHARACTER" ||
              item.layer === "MOUNT" ||
              item.layer === "PROP") &&
            isImage(item)
          ) {
            imagesFromCallback.push(item);
          }
        }

        //get rid of health bars that no longer attach to anything
        await deleteOrphanHealthBars(imagesFromCallback);

        //create list of modified and new items, skipping deleted items
        const changedItems: Image[] = getChangedItems(imagesFromCallback);

        //update array of all items currently on the board
        itemsLast = imagesFromCallback;

        //draw health bars
        const role = await OBR.player.getRole();
        const dpi = await OBR.scene.grid.getDpi();
        for (const item of changedItems) {
          await createAttachments(item, role, dpi);
        }

        //bulk delete and add items
        await OBR.scene.local.deleteItems(deleteItemsArray);
        await OBR.scene.local.addItems(addItemsArray);

        //clear add and delete arrays arrays
        addItemsArray.length = 0;
        deleteItemsArray.length = 0;

        // Create name tag backgrounds
        if (settings.nameTags) await createNameTagBackgrounds(changedItems);
      },
    );

    // Unsubscribe listeners that rely on the scene if it stops being ready
    const unsubscribeFromScene = OBR.scene.onReadyChange((isReady) => {
      if (!isReady) {
        unSubscribeFromPlayer();
        unsubscribeFromSceneMetadata();
        unsubscribeFromItems();
        unsubscribeFromScene();
        callbacksStarted = false;
      }
    });
  }
}

async function deleteOrphanHealthBars(newItems?: Image[]) {
  //get ids of all items on map that could have health bars
  if (typeof newItems === "undefined") {
    newItems = await OBR.scene.items.getItems(
      (item) =>
        (item.layer === "CHARACTER" ||
          item.layer === "MOUNT" ||
          item.layer === "PROP") &&
        isImage(item),
    );
  }

  const newItemIds: string[] = [];
  for (const item of newItems) {
    newItemIds.push(item.id);
  }

  //check for orphaned health bars
  for (const oldId of tokenIds) {
    if (!newItemIds.includes(oldId)) {
      // delete orphaned health bar
      addAllExtensionAttachmentsToArray(deleteItemsArray, oldId);
    }
  }

  // update item list with current values
  tokenIds = newItemIds;
}

function getChangedItems(imagesFromCallback: Image[]) {
  const changedItems: Image[] = [];

  let s = 0; // # items skipped in itemsLast array, caused by deleted items
  for (let i = 0; i < imagesFromCallback.length; i++) {
    if (i > itemsLast.length - s - 1) {
      //check for new items at the end of the list
      changedItems.push(imagesFromCallback[i]);
    } else if (itemsLast[i + s].id !== imagesFromCallback[i].id) {
      s++; // Skip an index in itemsLast
      i--; // Reuse the index item in imagesFromCallback
    } else if (
      //check for scaling changes
      !(
        itemsLast[i + s].scale.x === imagesFromCallback[i].scale.x &&
        itemsLast[i + s].scale.y === imagesFromCallback[i].scale.y &&
        (itemsLast[i + s].name === imagesFromCallback[i].name ||
          !settings.nameTags)
      )
    ) {
      // Attachments must be deleted to prevent ghost selection highlight bug
      deleteItemsArray.push(`${imagesFromCallback[i].id}health-label`);
      deleteItemsArray.push(`${imagesFromCallback[i].id}name-tag-text`);
      changedItems.push(imagesFromCallback[i]);
    } else if (
      //check position, visibility, and metadata changes
      !(
        itemsLast[i + s].position.x === imagesFromCallback[i].position.x &&
        itemsLast[i + s].position.y === imagesFromCallback[i].position.y &&
        itemsLast[i + s].visible === imagesFromCallback[i].visible &&
        JSON.stringify(itemsLast[i + s].metadata[getPluginId("metadata")]) ===
          JSON.stringify(
            imagesFromCallback[i].metadata[getPluginId("metadata")],
          ) &&
        JSON.stringify(
          itemsLast[i + s].metadata[getPluginId(NAME_METADATA_ID)],
        ) ===
          JSON.stringify(
            imagesFromCallback[i].metadata[getPluginId(NAME_METADATA_ID)],
          )
      )
    ) {
      //update items
      changedItems.push(imagesFromCallback[i]);
    }
  }
  return changedItems;
}

async function createNameTagBackgrounds(items: Item[]) {
  if (!(await OBR.scene.isReady())) throw "Error: Scene not available";

  const nameTags: Item[] = [];
  const nameTagBackgrounds: Item[] = [];

  for (let i = 0; i < items.length; i++) {
    if (getName(items[i]) !== "") {
      nameTags.push(items[i]);
      try {
        const bounds = await OBR.scene.local.getItemBounds([
          getNameTagTextId(items[i].id),
        ]);
        nameTagBackgrounds.push(...createNameTagBackground(items[i], bounds));
      } catch (error) {
        addNameTagAttachmentsToArray(deleteItemsArray, items[i].id);
      }
    }
  }

  OBR.scene.local.deleteItems(deleteItemsArray);
  deleteItemsArray.length = 0;

  //TODO: fix text positioning
  // OBR.scene.local.updateItems(nameTags, () => {})
  if (nameTagBackgrounds.length > 0)
    await OBR.scene.local.addItems(nameTagBackgrounds);
  globalItemsWithNameTags.length = 0;
}

async function createAttachments(
  item: Image,
  role: "PLAYER" | "GM",
  dpi: number,
) {
  const { origin, bounds } = getOriginAndBounds(settings, item, dpi);

  // Create stats
  const [health, maxHealth, tempHealth, armorClass, statsVisible] =
    getTokenMetadata(item);
  if (role === "PLAYER" && !statsVisible && !settings.showBars) {
    // Display nothing, explicitly remove all attachments
    addHealthAttachmentsToArray(deleteItemsArray, item.id);
    addArmorAttachmentsToArray(deleteItemsArray, item.id);
    addTempHealthAttachmentsToArray(deleteItemsArray, item.id);
  } else if (role === "PLAYER" && !statsVisible && settings.showBars) {
    // Display limited stats depending on GM configuration
    createLimitedHealthBar();
  } else {
    // Display full stats
    const hasHealthBar = createFullHealthBar();
    const hasArmorClassBubble = createArmorClass(hasHealthBar);
    createTempHealth(hasHealthBar, hasArmorClassBubble);
  }

  // Create name tags
  const name = getName(item);
  if (settings.nameTags && name !== "") {
    addItemsArray.push(
      ...createNameTag(
        item,
        settings.barAtTop
          ? {
              x: origin.x,
              y: origin.y - NAME_TAG_HEIGHT - FULL_BAR_HEIGHT - 12.4,
            }
          : origin,
        name,
      ),
    );
    globalItemsWithNameTags.push(item);
  } else {
    addNameTagAttachmentsToArray(deleteItemsArray, item.id);
  }

  function createLimitedHealthBar() {
    // Clear other attachments
    addArmorAttachmentsToArray(deleteItemsArray, item.id);
    addTempHealthAttachmentsToArray(deleteItemsArray, item.id);

    // return early if health bar shouldn't be created
    if (maxHealth <= 0) {
      addHealthAttachmentsToArray(deleteItemsArray, item.id);
      return;
    }

    deleteItemsArray.push(`${item.id}health-label`);
    addItemsArray.push(
      ...createHealthBar(
        item,
        bounds,
        health,
        maxHealth,
        statsVisible,
        origin,
        "short",
        settings.segments,
      ),
    );
  }

  /**
   * Create a health bar.
   * @returns True if a health bar was created.
   */
  function createFullHealthBar() {
    // return early if health bar shouldn't be created
    if (maxHealth <= 0) {
      addHealthAttachmentsToArray(deleteItemsArray, item.id);
      return false;
    }

    addItemsArray.push(
      ...createHealthBar(item, bounds, health, maxHealth, statsVisible, origin),
    );
    return true;
  }

  /**
   * Create the armor class bubble.
   * @returns True if armor class bubble was created.
   */
  function createArmorClass(hasHealthBar: boolean) {
    // return early if armor class bubble shouldn't be created
    if (armorClass <= 0) {
      addArmorAttachmentsToArray(deleteItemsArray, item.id);
      return false;
    }

    const armorPosition = {
      x: origin.x + bounds.width / 2 - DIAMETER / 2 - 2,
      y: origin.y - DIAMETER / 2 - 4 - (hasHealthBar ? FULL_BAR_HEIGHT : 0),
    };
    if (settings.barAtTop) {
      armorPosition.y = origin.y + DIAMETER / 2;
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

    return true;
  }

  function createTempHealth(
    hasHealthBar: boolean,
    hasArmorClassBubble: boolean,
  ) {
    // return early if temp health bubble shouldn't be created
    if (tempHealth <= 0) {
      addTempHealthAttachmentsToArray(deleteItemsArray, item.id);
      return;
    }

    const tempHealthPosition = {
      x:
        origin.x +
        bounds.width / 2 -
        DIAMETER * (hasArmorClassBubble ? 1.5 : 0.5) -
        4,
      y: origin.y - DIAMETER / 2 - 4 - (hasHealthBar ? FULL_BAR_HEIGHT : 0),
    };
    if (settings.barAtTop) {
      tempHealthPosition.y = origin.y + DIAMETER / 2;
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
  }
}
