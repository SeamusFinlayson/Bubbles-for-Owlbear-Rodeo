import OBR from "@owlbear-rodeo/sdk";
import { ThemeProvider } from "@mui/material";
import { getTheme } from "../OBRThemeProvider";
import { createRoot } from "react-dom/client";
import StatsMenuApp from "./StatsMenuApp";
import { getName, getSelectedItems, parseSelectedTokens } from "../itemHelpers";

OBR.onReady(async () => {
  const [selectedItems, role, themeObject] = await Promise.all([
    getSelectedItems(),
    OBR.player.getRole(),
    OBR.theme.getTheme(),
  ]);

  const theme = getTheme(themeObject);
  const initialTokens = await parseSelectedTokens(false, selectedItems);
  const initialName = getName(selectedItems[0]);

  if (selectedItems.length !== 1) {
    throw "Error: Invalid Tokens Selection";
  } else {
    // Render React component
    const root = createRoot(
      document.getElementById("mother-flex") as HTMLDivElement,
    );
    root.render(
      <ThemeProvider theme={theme}>
        <StatsMenuApp
          initialToken={initialTokens[0]}
          initialTokenName={initialName}
          role={role}
        />
      </ThemeProvider>,
    );
  }
});
