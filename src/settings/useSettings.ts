import {
  getPluginMetadata,
  readNumberFromObject,
  safeObjectRead,
} from "@/metadataHelpers/metadataHelpers";
import { SaveLocation } from "@/metadataHelpers/settingMetadataHelpers";
import {
  OFFSET_METADATA_ID,
  BAR_AT_TOP_METADATA_ID,
  SHOW_BARS_METADATA_ID,
  SEGMENTS_METADATA_ID,
  NAME_TAGS_METADATA_ID,
} from "@/metadataHelpers/settingMetadataIds";
import OBR, { Metadata } from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

export default function useSettings(saveLocation: SaveLocation) {
  const [initializationDone, setInitializationDone] = useState<boolean>();
  const [offset, setOffset] = useState<string>();
  const [justification, setJustification] = useState<"TOP" | "BOTTOM">();
  const [healthBarsVisible, setHealthBarsVisible] = useState<boolean>();
  const [segments, setSegments] = useState<string>();
  const [nameTags, setNameTags] = useState<boolean>();

  useEffect(() => {
    const handleSettingsMetadataChange = (metadata: Metadata) => {
      const settings = getPluginMetadata(metadata);
      // Offset
      const offset = safeObjectRead(settings, OFFSET_METADATA_ID);
      if (saveLocation === "SCENE" && offset === undefined)
        setOffset(undefined);
      else if (typeof offset === "number" && !Number.isNaN(offset))
        setOffset(offset.toString());
      else setOffset("0");

      // Justification
      const justification = safeObjectRead(settings, BAR_AT_TOP_METADATA_ID);
      if (saveLocation === "SCENE" && justification === undefined)
        setJustification(undefined);
      else if (typeof justification === "boolean")
        setJustification(justification ? "TOP" : "BOTTOM");
      else setJustification("BOTTOM");

      // Health bars visible
      const healthBarsVisible = safeObjectRead(settings, SHOW_BARS_METADATA_ID);
      if (saveLocation === "SCENE" && healthBarsVisible === undefined)
        setHealthBarsVisible(undefined);
      else if (typeof healthBarsVisible === "boolean")
        setHealthBarsVisible(healthBarsVisible);
      else setHealthBarsVisible(false);

      // Segments - visibility is tied to healthBarsVisible, don't need undefined information
      setSegments(
        readNumberFromObject(settings, SEGMENTS_METADATA_ID).toString(),
      );

      // Name Tags
      const nameTags = safeObjectRead(settings, NAME_TAGS_METADATA_ID);
      if (saveLocation === "SCENE" && nameTags === undefined)
        setNameTags(undefined);
      else if (typeof nameTags === "boolean") setNameTags(nameTags);
      else setNameTags(false);

      setInitializationDone(true);
    };
    if (saveLocation === "SCENE") {
      OBR.scene.getMetadata().then(handleSettingsMetadataChange);
      return OBR.scene.onMetadataChange(handleSettingsMetadataChange);
    }
    OBR.room.getMetadata().then(handleSettingsMetadataChange);
    return OBR.room.onMetadataChange(handleSettingsMetadataChange);
  }, []);

  return {
    initializationDone,
    offset,
    setOffset,
    justification,
    setJustification,
    healthBarsVisible,
    setHealthBarsVisible,
    segments,
    setSegments,
    nameTags,
    setNameTags,
  };
}
