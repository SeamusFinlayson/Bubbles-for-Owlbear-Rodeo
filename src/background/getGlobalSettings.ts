import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import { ActionMetadataId, actionInputs } from "../settings/ActionInputClass";

export interface Settings {
  verticalOffset: number;
  barAtTop: boolean;
  nameTags: boolean;
  showBars: boolean;
  segments: number;
}

export async function getGlobalSettings(
  settings: Settings,
  sceneMetadata?: any,
) {
  // load settings from scene metadata if not passed to function
  if (typeof sceneMetadata === "undefined") {
    sceneMetadata = await OBR.scene.getMetadata();
  }

  // Variable indicating if health bar refresh is needed
  let doRefresh = false;

  for (const actionInput of actionInputs) {
    // Get input's previous value from the scene metadata
    let value: number | boolean;
    let retrievedValue: boolean;

    try {
      value = sceneMetadata[getPluginId("metadata")][actionInput.id];
      retrievedValue = true;
    } catch (error) {
      if (error instanceof TypeError) {
        value = 0;
      } else {
        throw error;
      }
      retrievedValue = false;
    }

    if (typeof value === "undefined") {
      retrievedValue = false;
    }

    // If a value was retrieved try to update global variable value
    if (retrievedValue) {
      // Use validation appropriate to the input type
      if (actionInput.type === "CHECKBOX") {
        // Check if the new value is different from the previous and valid
        if (
          checkForSettingsValueChange(settings, actionInput.id, value) &&
          typeof value === "boolean" &&
          value !== null
        ) {
          // Update global variable
          updateSettingsValue(settings, actionInput.id, value);

          // Refresh needed due to settings change
          doRefresh = true;
        }
      } else if (actionInput.type === "NUMBER") {
        // Check if the new value is different from the previous and valid
        if (
          checkForSettingsValueChange(settings, actionInput.id, value) &&
          typeof value === "number" &&
          value !== null &&
          !isNaN(value)
        ) {
          // Update global variable
          updateSettingsValue(settings, actionInput.id, value);

          // Refresh needed due to settings change
          doRefresh = true;
        }
      } else {
        throw "Error: bad input type.";
      }
    } else {
      // Set to default values if setting could not be retrieved
      if (actionInput.type === "CHECKBOX") {
        updateSettingsValue(settings, actionInput.id, false);
      } else if (actionInput.type === "NUMBER") {
        updateSettingsValue(settings, actionInput.id, 0);
      }

      //console.log("Could not get " + actionInput.id) // Debug only
    }
  }

  return doRefresh;
}

function updateSettingsValue(
  settings: Settings,
  id: ActionMetadataId,
  value: number | boolean,
) {
  if (id === "offset" && typeof value === "number") {
    settings.verticalOffset = value;
  } else if (id === "bar-at-top" && typeof value === "boolean") {
    settings.barAtTop = value;
  } else if (id === "show-bars" && typeof value === "boolean") {
    settings.showBars = value;
  } else if (id === "segments" && typeof value === "number") {
    settings.segments = value;
  } else if (id === "name-tags" && typeof value === "boolean") {
    settings.nameTags = value;
  } else {
    throw `Invalid update to ${id} with value of type ${typeof value}`;
  }
}

function checkForSettingsValueChange(
  settings: Settings,
  id: ActionMetadataId,
  value: number | boolean,
): boolean {
  if (id === "offset" && typeof value === "number") {
    return settings.verticalOffset !== value;
  }
  if (id === "bar-at-top" && typeof value === "boolean") {
    return settings.barAtTop !== value;
  }
  if (id === "show-bars" && typeof value === "boolean") {
    return settings.showBars !== value;
  }
  if (id === "segments" && typeof value === "number") {
    return settings.segments !== value;
  }
  if (id === "name-tags" && typeof value === "boolean") {
    return settings.nameTags !== value;
  }
  throw `Invalid check for ${id} against value of type ${typeof value}`;
}
