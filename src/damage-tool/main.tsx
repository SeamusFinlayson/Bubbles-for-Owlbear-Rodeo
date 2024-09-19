import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from "react-dom/client";
import { parseSelectedTokens } from "../itemHelpers";
import BulkEditor from "./BulkEditor";

import "../index.css";

OBR.onReady(async () => {
  const darkMode = new URLSearchParams(document.location.search).get(
    "darkMode",
  );
  if (darkMode === "DARK") document.body.classList.add("dark");

  const initialTokens = await parseSelectedTokens(true);

  // Render React component
  const root = createRoot(document.getElementById("app") as HTMLDivElement);
  root.render(<BulkEditor initialTokens={initialTokens} />);
});
