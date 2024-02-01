import OBR from "@owlbear-rodeo/sdk";
import { ThemeProvider } from "@mui/material";
import { getTheme } from "../OBRThemeProvider";
import parseSelectedTokens from "../parseSelectedTokens";
import { createRoot } from "react-dom/client";
import StatsMenuApp from "./component/StatsMenuApp";

OBR.onReady(async () => {

    const [initialTokens, role, themeObject] = await Promise.all([
        parseSelectedTokens(),
        OBR.player.getRole(),
        OBR.theme.getTheme()
    ]);

    const theme = getTheme(themeObject);

    if (initialTokens.length !== 1) {
        throw "Error: Invalid Tokens Selection";
    } else {

        // Render React component
        const root = createRoot(document.getElementById("mother-flex") as HTMLDivElement);
        root.render(
            <ThemeProvider theme={theme}>
                <StatsMenuApp initialToken={initialTokens[0]} role={role} />
            </ThemeProvider>
        );
    }
});