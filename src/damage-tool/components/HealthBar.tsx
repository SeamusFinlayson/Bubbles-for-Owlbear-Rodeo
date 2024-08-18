import { Box, LinearProgress, linearProgressClasses, useTheme } from "@mui/material";
import { styled } from '@mui/material/styles';

export default function HealthBar({
    health, newHealth, maxHealth
}: {
    health: number, newHealth: number, maxHealth: number
}): JSX.Element {

    // TODO: difficult to distinguish between healing and damage visually
    // both look like damage

    // TODO: Look into horizontal scaling

    let solidHealthColor = "rgb(147, 46, 48, 1)";
    let faintHealthColor = "rgb(95, 30, 31)"; // alt: "rgb(147, 46, 48, 0.5)"
    const backgroundDefaultColor = useTheme().palette.background.default; // alt: "rgba(0,0,0,0.35)";
    let outlineColor = "rgba(255, 255, 255, 0.6)";
    const elementWidth = 100;
    const elementWidthString = elementWidth.toString() + "px"
    let outlineThickness = 2;

    const isLight = useTheme().palette.mode === "light"

    if (isLight) {
        solidHealthColor = "hsl(0, 59%, 75%)";
        faintHealthColor = "rgb(218, 113, 113, 0.3)";
        outlineColor = "rgba(0, 0, 0, 0.4)";
        outlineThickness = 2;
    }

    let baseFill: number;
    let topFill: number;

    const outlinePercent = outlineThickness / elementWidth * 100;

    let originalHealthFill: number;
    if (health <= 0) {
        originalHealthFill = 0;
    } else if (health >= maxHealth) {
        originalHealthFill = 100;
    } else {
        originalHealthFill = outlinePercent + (100 - 2 * outlinePercent) * health / maxHealth;
    }

    let modifiedHealthFill: number;
    if (newHealth <= 0) {
        modifiedHealthFill = 0;
    } else if (newHealth >= maxHealth) {
        modifiedHealthFill = 100;
    } else {
        modifiedHealthFill = outlinePercent + (100 - 2 * outlinePercent) * (newHealth) / maxHealth;
    }

    // Pick if original or new health is on top
    if (newHealth > health) {
        baseFill = modifiedHealthFill;
        topFill = originalHealthFill;
    } else {
        baseFill = originalHealthFill;
        topFill = modifiedHealthFill;
    }

    // Black background and translucent old health 
    const HealthBarBase = styled(LinearProgress)(({ /*theme*/ }) => ({
        height: "44px",
        borderRadius: "12px",
        [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: backgroundDefaultColor,
        },
        [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 0,
            backgroundColor: faintHealthColor,
        },
    }));

    // New health
    const HealthBarTop = styled(LinearProgress)(({ /*theme*/ }) => ({
        height: "44px",
        borderRadius: "12px",
        [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: "rgba(0,0,0,0)",
        },
        [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 0,
            backgroundColor: solidHealthColor,
        },
    }));

    return (
        <Box sx={{
            display: "grid",
            width: elementWidthString,
            height: 44,

            // justifySelf: "center", 
            // alignSelf: "center"
            justifyItems: "stretch",
            alignItems: "stretch",
        }}
        >
            <HealthBarBase
                sx={{ zIndex: 1, gridArea: "1/1/1/1" }}
                variant="determinate"
                value={baseFill}
            ></HealthBarBase >
            <HealthBarTop
                sx={{ zIndex: 2, gridArea: "1/1/1/1" }}
                variant="determinate"
                value={topFill}
            ></HealthBarTop >
            <Box sx={{
                zIndex: 4,
                gridArea: "1/1/1/1",
                outlineWidth: outlineThickness,
                outlineColor: outlineColor,
                outlineStyle: "solid",
                outlineOffset: "-2px",
                borderRadius: "12px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: useTheme().palette.text.primary
            }}>
                <Box sx={{ paddingTop: "2px", paddingBottom: "1px" }}>
                    {(newHealth).toString() + " / " + maxHealth.toString()}
                </Box>
            </Box>
        </Box>
    );
}
