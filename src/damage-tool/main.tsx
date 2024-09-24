import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from "react-dom/client";
import { parseSelectedTokens } from "../itemHelpers";
import BulkEditor from "./BulkEditor";

import "../index.css";
import { addThemeToBody } from "@/colorHelpers";

OBR.onReady(async () => {
  addThemeToBody();

  const initialTokens = await parseSelectedTokens(true);

  // Render React component
  const root = createRoot(document.getElementById("app") as HTMLDivElement);
  root.render(<BulkEditor initialTokens={initialTokens} />);
});
