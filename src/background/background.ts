import OBR from "@owlbear-rodeo/sdk";
import startBackground from "./statAttachments";

/**
 * This file represents the background script run when the plugin loads.
 * It creates the context menu items.
 */

OBR.onReady(async () => {
  printVersionToConsole();
  startBackground();
});

function printVersionToConsole() {
  fetch("/manifest.json")
    .then((response) => response.json())
    .then((json) =>
      console.log(json["name"] + " - version: " + json["version"]),
    );
}
