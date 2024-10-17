import { addThemeToBody } from "@/colorHelpers";
import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from "react-dom/client";
import Settings from "./Settings";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";

OBR.onReady(async () => {
  addThemeToBody();

  const root = createRoot(document.getElementById("app") as HTMLDivElement);
  root.render(
    <React.StrictMode>
      <TooltipProvider delayDuration={150} disableHoverableContent>
        <Settings />
      </TooltipProvider>
    </React.StrictMode>,
  );
});
