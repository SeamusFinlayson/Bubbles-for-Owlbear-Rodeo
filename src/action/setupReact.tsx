import { createRoot } from "react-dom/client";
import OBR from "@owlbear-rodeo/sdk";
import { getTheme } from "../OBRThemeProvider";
import { ThemeProvider } from "@mui/material";
import HeaderButton from "./components/HeaderButton";

export default async function setupReact() {

    const themeObject = await OBR.theme.getTheme()
    const theme = getTheme(themeObject)

    // Render React component
    const patreonButton = createRoot(document.getElementById("patreon-button") as HTMLDivElement);
    patreonButton.render(
        <ThemeProvider theme={theme}>
            <HeaderButton variant="patreon"></HeaderButton>
        </ThemeProvider>
    );

    // Render React component
    const changeLogButton = createRoot(document.getElementById("change-log-button") as HTMLDivElement);
    changeLogButton.render(
        <ThemeProvider theme={theme}>
            <HeaderButton variant="changeLog"></HeaderButton>
        </ThemeProvider>
    );

    // Render React component
    const instructionsButton = createRoot(document.getElementById("help-button") as HTMLDivElement);
    instructionsButton.render(
        <ThemeProvider theme={theme}>
            <HeaderButton variant="help"></HeaderButton>
        </ThemeProvider>
    );
}