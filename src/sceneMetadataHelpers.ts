import OBR, { Metadata } from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";

export type SceneMetadataId =
  | "offset"
  | "bar-at-top"
  | "name-tags"
  | "show-bars"
  | "segments";

export const OFFSET_METADATA_ID = "offset";
export const BAR_AT_TOP_METADATA_ID = "bar-at-top";
export const NAME_TAGS_METADATA_ID = "name-tags";
export const SHOW_BARS_METADATA_ID = "show-bars";
export const SEGMENTS_METADATA_ID = "segments";

export function readBooleanFromMetadata(
  metadata: Metadata,
  key: SceneMetadataId,
  fallback: boolean = false,
): boolean {
  try {
    const value = (
      metadata[getPluginId("metadata")] as Record<string, boolean>
    )[key];
    if (typeof value !== "boolean") return fallback;
    return value;
  } catch (error) {
    return fallback;
  }
}

export function readNumberFromMetadata(
  metadata: Metadata,
  key: SceneMetadataId,
  fallback: number = 0,
): number {
  try {
    const value = (metadata[getPluginId("metadata")] as Record<string, number>)[
      key
    ];
    if (typeof value !== "number") return fallback;
    if (Number.isNaN(value)) return fallback;
    return value;
  } catch (error) {
    return fallback;
  }
}

export async function updateSceneMetadata(
  key: SceneMetadataId,
  value: number | boolean,
) {
  // get scene metadata
  const sceneMetadata = await OBR.scene.getMetadata();
  const retrievedMetadata = sceneMetadata[getPluginId("metadata")] as
    | Object
    | undefined;

  // combine metadata
  const combinedMetadata = {
    ...retrievedMetadata,
    ...{ [key]: value },
  };

  //write metadata into scene
  OBR.scene.setMetadata({ [getPluginId("metadata")]: combinedMetadata });
}
