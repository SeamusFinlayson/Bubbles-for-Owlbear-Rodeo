import { Box, LinearProgress, linearProgressClasses, styled, useTheme } from "@mui/material";

export default function TemporaryHealthBubble({ 
    tempHealth, newTempHealth 
}: {
    tempHealth: number, newTempHealth: number
}): JSX.Element {

    let fillColor = "rgb(83, 100, 63)";
    let faintColor = "rgb(40, 48, 30)";
    const borderRadius = "50%";
    let outlineColor = "rgba(255, 255, 255, 0.6)";
    const elementHeight = 44;
    const elementHeightString = elementHeight.toString() + "px";
    const outlineThickness = 2;
    const outlinePercent = outlineThickness / elementHeight * 100;
    const backgroundDefaultColor = useTheme().palette.background.default;

    const isLight = useTheme().palette.mode === "light";

    if (isLight) {
        fillColor = "hsl(81, 25%, 65%)";
        faintColor = "rgb(152, 168, 123, 0.4)";
        outlineColor = "rgba(0, 0, 0, 0.4)";
        // outlineThickness = 2;
    }

    let backgroundColor = faintColor;

    let fill: number;

    if (tempHealth <= 0) {
        backgroundColor = backgroundDefaultColor;
        fill = 0;
    } else {
        if (newTempHealth >= tempHealth) {
            fill = 100;
        } else if (newTempHealth <= 0) {
            fill = 0;
        } else {
            fill = outlinePercent + (100 - 2 * outlinePercent) * (newTempHealth) / tempHealth;
        }
    }

    // New health
    const TempHealthBar = styled(LinearProgress)(({ }) => ({
        height: "44px",
        borderRadius: borderRadius,
        [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: backgroundColor,
        },
        [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 0,
            backgroundColor: fillColor,
        },
    }));

    return (
        <Box sx={{ display: "grid", width: elementHeightString, height: elementHeightString }}>
            <TempHealthBar
                sx={{ zIndex: 2, gridArea: "1/1/1/1" }}
                variant="determinate"
                value={fill}
            ></TempHealthBar>
            <Box sx={{
                zIndex: 3,
                gridArea: "1/1/1/1",
                outline: "2px",
                outlineColor: outlineColor,
                outlineStyle: "solid",
                outlineOffset: "-2px",
                borderRadius: borderRadius,
            }}></Box>
            <Box sx={{
                zIndex: 4,
                gridArea: "1/1/1/1",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <Box sx={{ paddingTop: "2px", paddingBottom: "1px" }}>
                    {newTempHealth.toString()}
                </Box>
            </Box>
        </Box>
    );
}
