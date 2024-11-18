import OBR, { Metadata } from "@owlbear-rodeo/sdk";
import {
  parseSettings,
  Settings,
} from "@/metadataHelpers/settingMetadataHelpers";
import {
  getPluginMetadata,
  readNumberFromObject,
} from "@/metadataHelpers/metadataHelpers";

export default async function getGlobalSettings(
  settings?: Settings,
  sceneMetadata?: Metadata,
  roomMetadata?: Metadata,
) {
  // load settings from scene metadata if not passed to function
  if (sceneMetadata === undefined)
    sceneMetadata = await OBR.scene.getMetadata();
  if (roomMetadata === undefined) roomMetadata = await OBR.room.getMetadata();

  const roomExtensionMetadata = getPluginMetadata(roomMetadata);
  const sceneExtensionMetadata = getPluginMetadata(sceneMetadata);

  const mergedSettings = {
    ...roomExtensionMetadata,
    ...sceneExtensionMetadata,
  };

  const newSettings = parseSettings(mergedSettings);

  // Ignore scene segments if the room settings is not being overridden
  const sceneSegmentsEnabled = sceneExtensionMetadata?.["show-bars"];
  if (sceneSegmentsEnabled === undefined) {
    newSettings.segments = readNumberFromObject(
      roomExtensionMetadata,
      "segments",
    );
  }

  if (settings === undefined)
    return { settings: newSettings, isChanged: false };

  let isChanged = false;
  for (const key of Object.keys(newSettings)) {
    if (newSettings[key] !== settings[key]) {
      isChanged = true;
      break;
    }
  }

  return { settings: newSettings, isChanged };
}
