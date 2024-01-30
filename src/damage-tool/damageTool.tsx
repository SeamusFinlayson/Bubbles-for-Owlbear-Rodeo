import OBR from "@owlbear-rodeo/sdk";
import { createRoot } from 'react-dom/client';
import { getTheme } from "../OBRThemeProvider";
import { ThemeProvider } from "@mui/material";
import DamageToolApp from "./components/DamageToolApp";
import parseSelectedTokens from "../parseSelectedTokens";

OBR.onReady(async () => {

    const initialTokens = await parseSelectedTokens(true);

    const themeObject = await OBR.theme.getTheme()
    const theme = getTheme(themeObject)

    // Render React component
    const root = createRoot(document.getElementById('app') as HTMLDivElement);
    root.render(
        <ThemeProvider theme={theme}>
            <DamageToolApp initialTokens={initialTokens} />
        </ThemeProvider>
    );
});