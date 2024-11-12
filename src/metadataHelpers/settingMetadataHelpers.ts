import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import {
  BAR_AT_TOP_METADATA_ID,
  NAME_TAGS_METADATA_ID,
  OFFSET_METADATA_ID,
  SEGMENTS_METADATA_ID,
  SettingMetadataId,
  SHOW_BARS_METADATA_ID,
} from "./settingMetadataIds";
import { readBooleanFromObject, readNumberFromObject } from "./metadataHelpers";

export type SaveLocation = "ROOM" | "SCENE";

export async function updateSettingMetadata(
  key: SettingMetadataId,
  value: number | boolean | undefined,
  saveLocation: SaveLocation,
) {
  // get saved metadata
  let retrievedMetadata;
  if (saveLocation === "SCENE")
    retrievedMetadata = await OBR.scene.getMetadata();
  else retrievedMetadata = await OBR.room.getMetadata();

  const retrievedExtensionMetadata = retrievedMetadata[
    getPluginId("metadata")
  ] as Object | undefined;

  // combine metadata
  let combinedMetadata: { [key: string]: unknown } = {
    ...retrievedExtensionMetadata,
    ...{ [key]: value },
  };

  // Remove keys that hold undefined values
  for (const key of Object.keys(combinedMetadata)) {
    if (combinedMetadata[key] === undefined) delete combinedMetadata[key];
  }

  const settingsObject = { [getPluginId("metadata")]: combinedMetadata };

  //write metadata to save location
  if (saveLocation === "SCENE") OBR.scene.setMetadata(settingsObject);
  else OBR.room.setMetadata(settingsObject);
}

export type Settings = {
  [index: string]: number | boolean | undefined;
  verticalOffset: number;
  barAtTop: boolean;
  nameTags: boolean;
  showBars: boolean;
  segments: number;
};

export function parseSettings(metadata: unknown): Settings {
  return {
    verticalOffset: readNumberFromObject(metadata, OFFSET_METADATA_ID),
    barAtTop: readBooleanFromObject(metadata, BAR_AT_TOP_METADATA_ID),
    nameTags: readBooleanFromObject(metadata, NAME_TAGS_METADATA_ID),
    showBars: readBooleanFromObject(metadata, SHOW_BARS_METADATA_ID),
    segments: readNumberFromObject(metadata, SEGMENTS_METADATA_ID),
  };
}
