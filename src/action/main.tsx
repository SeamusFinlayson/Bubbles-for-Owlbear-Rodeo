import { addThemeToBody } from "@/colorHelpers";
import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from "react-dom/client";
import Settings from "./Settings";

OBR.onReady(async () => {
  const [role, sceneMetadata] = await Promise.all([
    OBR.player.getRole(),
    OBR.scene.getMetadata(),
  ]);

  addThemeToBody();

  const root = createRoot(document.getElementById("app") as HTMLDivElement);
  root.render(<Settings />);
});
