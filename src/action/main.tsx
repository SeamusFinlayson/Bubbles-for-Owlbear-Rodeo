import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from "react-dom/client";

import "../index.css";
import { addThemeToBody } from "@/colorHelpers";
import {
  BROADCAST_CHANNEL,
  TOGGLE_ACTION_OPEN,
  toggleActionOpen,
} from "./helpers";
import createToolActionShortcut from "./createToolActionShortcut";
import { lazy, Suspense } from "react";

OBR.onReady(async () => {
  const [theme] = await Promise.all([OBR.theme.getTheme()]);
  addThemeToBody(theme.mode);
  createToolActionShortcut();

  // Render React component
  let initDone = false;
  const init = async (args: { isOpen?: boolean; role?: "PLAYER" | "GM" }) => {
    if ((args.isOpen === true || args.role === "GM") && !initDone) {
      initDone = true;
      const App = lazy(() => import("./App"));
      const root = createRoot(document.getElementById("app") as HTMLDivElement);
      root.render(
        <Suspense>
          <App />
        </Suspense>,
      );
    }
  };

  const passOpen = (isOpen: boolean) => init({ isOpen });
  OBR.action.isOpen().then(passOpen);
  OBR.action.onOpenChange(passOpen);

  OBR.player.getRole().then((role) => init({ role }));
  OBR.player.onChange((player) => init({ role: player.role }));

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
