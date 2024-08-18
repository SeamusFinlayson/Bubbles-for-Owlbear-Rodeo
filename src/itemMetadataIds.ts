export type StatMetadataID =
  | "health"
  | "max health"
  | "temporary health"
  | "armor class"
  | "hide"
  | "raw";

export const HEALTH_METADATA_ID: StatMetadataID = "health";
export const MAX_HEALTH_METADATA_ID: StatMetadataID = "max health";
export const TEMP_HEALTH_METADATA_ID: StatMetadataID = "temporary health";
export const ARMOR_CLASS_METADATA_ID: StatMetadataID = "armor class";
export const HIDE_METADATA_ID: StatMetadataID = "hide";
export const SHOW_RAW_METADATA_ID: StatMetadataID = "raw";
