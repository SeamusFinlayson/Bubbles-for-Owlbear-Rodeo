import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from "react-dom/client";
import BulkEditor from "./BulkEditor";

import "../index.css";
import { addThemeToBody } from "@/colorHelpers";

OBR.onReady(async () => {
  const [theme] = await Promise.all([OBR.theme.getTheme()]);
  addThemeToBody(theme.mode);

  // Render React component
  const root = createRoot(document.getElementById("app") as HTMLDivElement);
  root.render(<BulkEditor />);
});
