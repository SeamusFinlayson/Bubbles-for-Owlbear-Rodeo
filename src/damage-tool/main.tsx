import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from "react-dom/client";
import { parseSelectedTokens } from "../itemHelpers";
import BulkEditor from "./BulkEditor";

import "../index.css";
import { addThemeToBody } from "@/colorHelpers";
import { getRollsFromScene } from "./helpers";

OBR.onReady(async () => {
  const [initialTokens, initialRolls, theme] = await Promise.all([
    parseSelectedTokens(true),
    getRollsFromScene(),
    OBR.theme.getTheme(),
  ]);
  addThemeToBody(theme.mode);

  // Render React component
  const root = createRoot(document.getElementById("app") as HTMLDivElement);
  root.render(
    <BulkEditor initialTokens={initialTokens} initialRolls={initialRolls} />,
  );
});
