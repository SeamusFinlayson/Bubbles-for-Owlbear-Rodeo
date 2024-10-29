import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from "react-dom/client";
import BulkEditor from "./BulkEditor";

import "../index.css";
import { addThemeToBody } from "@/colorHelpers";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  BROADCAST_CHANNEL,
  TOGGLE_ACTION_OPEN,
  toggleActionOpen,
} from "./helpers";
import createToolActionShortcut from "./createToolActionShortcut";

OBR.onReady(async () => {
  const [theme] = await Promise.all([OBR.theme.getTheme()]);
  addThemeToBody(theme.mode);
  createToolActionShortcut();

  // Render React component
  const root = createRoot(document.getElementById("app") as HTMLDivElement);
  root.render(
    <TooltipProvider
      disableHoverableContent
      skipDelayDuration={0}
      delayDuration={400}
    >
      <BulkEditor />
    </TooltipProvider>,
  );

  OBR.broadcast.onMessage(BROADCAST_CHANNEL, async (event) => {
    if (event.data === TOGGLE_ACTION_OPEN) {
      toggleActionOpen(await OBR.action.isOpen());
    }
  });

  const toggleClosed = async (e: KeyboardEvent) => {
    if (e.code === "KeyS" && e.shiftKey) {
      e.stopPropagation();
      e.preventDefault();
      toggleActionOpen(await OBR.action.isOpen());
    }
  };
  document.addEventListener("keydown", toggleClosed);
});
