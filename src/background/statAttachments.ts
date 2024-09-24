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
  createNameTagText,
  createNameTagBackground,
  createStatBubble,
  TEXT_BG_PADDING,
  TEXT_VERTICAL_OFFSET,
  addNameTagTestAttachmentsToArray,
  APPROXIMATE_LETTER_WIDTH,
  getNameTagTextTestId,
} from "./compoundItemHelpers";
import { getOriginAndBounds } from "./mathHelpers";
import { NAME_METADATA_ID, getName, getTokenStats } from "../itemHelpers";
import { Settings, getGlobalSettings } from "./getGlobalSettings";
import createContextMenuItems from "./contextMenuItems";

let tokenIds: string[] = []; // for orphan health bar management
let itemsLast: Image[] = []; // for item change checks
const addItemsArray: Item[] = []; // for bulk addition or changing of items
const deleteItemsArray: string[] = []; // for bulk deletion of scene items
const settings: Settings = {
  verticalOffset: 0,
  barAtTop: false,
  showBars: false,
  segments: 0,
  nameTags: false,
};
let callbacksStarted = false;
let userRoleLast: "GM" | "PLAYER";
let themeMode: "DARK" | "LIGHT";

export default async function startBackground() {
  const start = async () => {
    await getGlobalSettings(settings);
    themeMode = (await OBR.theme.getTheme()).mode;
    createContextMenuItems(settings, themeMode);
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
  const sceneDpi = await OBR.scene.grid.getDpi();
  for (const item of items) {
    createAttachments(item, roll, sceneDpi);
  }

  await sendItemsToScene(addItemsArray, deleteItemsArray);

  //update global item id list for orphaned health bar monitoring
  const itemIds: string[] = [];
  for (const item of items) {
    itemIds.push(item.id);
  }
  tokenIds = itemIds;

  // Create name tag backgrounds
  // console.log(globalItemsWithNameTags.length);
  if (settings.nameTags) await createNameTags(items, sceneDpi);
}

async function startCallbacks() {
  if (!callbacksStarted) {
    // Don't run this again unless the listeners have been unsubscribed
    callbacksStarted = true;

    // Handle theme changes
    const unSubscribeFromTheme = OBR.theme.onChange((theme) => {
      themeMode = theme.mode;
      createContextMenuItems(settings, themeMode);
    });

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
        if (await getGlobalSettings(settings, metadata)) {
          createContextMenuItems(settings, themeMode);
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
        const sceneDpi = await OBR.scene.grid.getDpi();
        for (const item of changedItems) {
          createAttachments(item, role, sceneDpi);
        }

        await sendItemsToScene(addItemsArray, deleteItemsArray);

        // Create name tag backgrounds
        if (settings.nameTags) await createNameTags(changedItems, sceneDpi);
      },
    );

    // Unsubscribe listeners that rely on the scene if it stops being ready
    const unsubscribeFromScene = OBR.scene.onReadyChange((isReady) => {
      if (!isReady) {
        unSubscribeFromTheme();
        unSubscribeFromPlayer();
        unsubscribeFromSceneMetadata();
        unsubscribeFromItems();
        unsubscribeFromScene();
        callbacksStarted = false;
      }
    });
  }
}

async function deleteOrphanHealthBars(currentItems: Image[]) {
  const currentItemIds: string[] = [];
  for (const item of currentItems) {
    currentItemIds.push(item.id);
  }

  //check for orphaned health bars
  for (const oldId of tokenIds) {
    if (!currentItemIds.includes(oldId)) {
      // delete orphaned health bar
      addAllExtensionAttachmentsToArray(deleteItemsArray, oldId);
    }
  }

  // update item list with current values
  tokenIds = currentItemIds;
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

async function createNameTags(items: Image[], sceneDpi: number) {
  if (!(await OBR.scene.isReady())) throw "Error: Scene not available";

  interface NameTag {
    parent: Image;
    dimensions: { width: number; height: number };
  }

  // Get bounds of name tags and test name tag items
  const nameTags: NameTag[] = [];
  for (let i = 0; i < items.length; i++) {
    const name = getName(items[i]);
    // Check if token should have name tag
    if (name === "") {
      // Remove all name tag attachments
      addNameTagAttachmentsToArray(deleteItemsArray, items[i].id);
    } else {
      // Determine bounds of test name tag
      const testTextId = getNameTagTextTestId(items[i].id);

      const pushWithFallbackDimensions = () => {
        console.log("Using fallback approximate width");
        nameTags.push({
          parent: items[i],
          dimensions: {
            width: name.length * APPROXIMATE_LETTER_WIDTH,
            height: (26 / 150) * sceneDpi,
          },
        });
      };
      try {
        let testTextBounds = await OBR.scene.local.getItemBounds([testTextId]);

        // Check if test name tag was retrieved
        if (testTextBounds === undefined) {
          // Use fallback value
          pushWithFallbackDimensions();
        } else {
          nameTags.push({
            parent: items[i],
            dimensions: {
              width: testTextBounds.width,
              height: testTextBounds.height,
            },
          });
        }
      } catch (error) {
        pushWithFallbackDimensions();

        // console.log(name, `${i} of ${items.length}`, testTextId);
        console.log(error);
      }
    }
  }

  //create new name tags and remove invisible test name tags
  nameTags.forEach((nameTag) => {
    const { origin } = getOriginAndBounds(settings, nameTag.parent, sceneDpi);
    const position = {
      x: nameTag.parent.position.x - nameTag.dimensions.width * 0.5,
      y: getNameTagPosition(origin, getName(nameTag.parent)).y,
    };

    addItemsArray.push(
      ...createNameTagText(nameTag.parent, getName(nameTag.parent), position),
    );
    addItemsArray.push(
      createNameTagBackground(
        nameTag.parent,
        {
          x: position.x - TEXT_BG_PADDING,
          y: position.y - TEXT_BG_PADDING - TEXT_VERTICAL_OFFSET,
        },
        {
          height: nameTag.dimensions.height,
          width: nameTag.dimensions.width,
        },
      ),
    );

    // delete invisible test name tags
    addNameTagTestAttachmentsToArray(deleteItemsArray, nameTag.parent.id);
  });

  // Actually remove and create name items
  await sendItemsToScene(addItemsArray, deleteItemsArray);
}

function createAttachments(item: Image, role: "PLAYER" | "GM", dpi: number) {
  const { origin, bounds } = getOriginAndBounds(settings, item, dpi);

  // Create stats
  const [health, maxHealth, tempHealth, armorClass, statsVisible] =
    getTokenStats(item);
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

  // Create invisible test name tag text items to measure name tag width
  const plainText = getName(item);
  if (settings.nameTags && plainText !== "") {
    addItemsArray.push(
      ...createNameTagText(
        item,
        plainText,
        getNameTagPosition(origin, plainText),
        true,
      ),
    );
    // globalItemsWithNameTags.push(item);
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

function getNameTagPosition(
  origin: { x: number; y: number },
  plainText: string,
) {
  const approximateNameTagWidth = APPROXIMATE_LETTER_WIDTH * plainText.length;
  let position = settings.barAtTop
    ? {
        x: origin.x,
        y: origin.y - NAME_TAG_HEIGHT - FULL_BAR_HEIGHT - 12.4,
      }
    : origin;
  position = {
    x: position.x - approximateNameTagWidth * 0.5,
    y: position.y + 4 + 2,
  };
  return position;
}

async function sendItemsToScene(
  addItemsArray: Item[],
  deleteItemsArray: string[],
) {
  await OBR.scene.local.deleteItems(deleteItemsArray);
  await OBR.scene.local.addItems(addItemsArray);
  deleteItemsArray.length = 0;
  addItemsArray.length = 0;
}
