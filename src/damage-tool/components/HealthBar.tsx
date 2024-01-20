import { Box, LinearProgress, linearProgressClasses, useTheme } from "@mui/material";
import { styled } from '@mui/material/styles';

export default function HealthBar({ health, newHealth, maxHealth  }: any): JSX.Element {

    // TODO: difficult to distinguish between healing and damage visually
    // both look like damage

    let solidHealthColor = "rgb(147, 46, 48, 1)";
    let faintHealthColor = "rgb(95, 30, 31)"; // alt: "rgb(147, 46, 48, 0.5)"
    const backgroundColor = useTheme().palette.background.default; // alt: "rgba(0,0,0,0.35)";
    let outlineColor = "rgba(255, 255, 255, 0.6)";
    const elementWidth = 100;
    const elementWidthString = elementWidth.toString() + "px"
    let outlineThickness = 2;
    
    if (useTheme().palette.mode === "light") {
        solidHealthColor = "hsl(0, 59%, 75%)";
        faintHealthColor = "rgb(218, 113, 113, 0.3)";
        outlineColor = "rgba(0, 0, 0, 0.4)";
        outlineThickness = 2;
    }

    let baseFill;
    let topFill;

    const outlinePercent = outlineThickness / elementWidth * 100;
    const originalHealthFill = outlinePercent + (100 - 2 * outlinePercent) * health / maxHealth;
    const modifiedHealthFill = outlinePercent + (100 - 2 * outlinePercent) * (newHealth) / maxHealth;

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
            backgroundColor: backgroundColor,
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
                width:elementWidthString,
                height:44,

                // justifySelf: "center", 
                // alignSelf: "center"
                justifyItems: "stretch",
                alignItems: "stretch",
            }}
        >
            {/* <Box sx={{ //white layer below everything
                zIndex: 0,
                gridArea: "1/1/1/1",
                borderRadius: "12px",
                bgcolor: "rgba(255,255,255,0)",
                display: "flex",
            }}></Box> */}
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
                zIndex: 3,
                gridArea: "1/1/1/1",
                outlineWidth: outlineThickness,
                outlineColor: outlineColor,
                outlineStyle: "solid",
                outlineOffset: "-2px",
                borderRadius: "12px",
            }}></Box>
            <Box sx={{
                zIndex: 4,
                gridArea: "1/1/1/1",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: useTheme().palette.text.primary
            }}>
                {(newHealth).toString() + " / " + maxHealth.toString()}
            </Box>
        </Box>
    );
}