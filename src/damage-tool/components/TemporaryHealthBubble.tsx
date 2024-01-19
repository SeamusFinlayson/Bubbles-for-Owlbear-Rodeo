import { Box, LinearProgress, linearProgressClasses, styled } from "@mui/material";

export function TemporaryHealthBubble({ tempHealth, damage }: any): JSX.Element {
    // TODO: difficult to distinguish between healing and damage visually
    // both look like damage

    let fillColor = "rgb(40, 48, 30)";
    let backgroundColor = "rgb(83, 100, 63)";
    const borderRadius = "50%";
    const outlineColor = "rgba(255, 255, 255, 0.6)";
    const elementHeight = 44;
    const elementHeightString = elementHeight.toString() + "px";
    const outlineThickness = 2;
    const outlinePercent = outlineThickness / elementHeight * 100;

    if (tempHealth <= 0) {
        backgroundColor = "rgba(0,0,0,0.35)";
        fillColor = "rgba(0,0,0,0.35)";
    }

    let fill;

    if (damage > 0 || tempHealth === 0) {

        // Set fill percent
        if (Math.abs(damage) < tempHealth) {
            fill = outlinePercent + (100 - 2 * outlinePercent) * (tempHealth - damage) / tempHealth;
        } else {
            fill = 0;
        }

    } else {
        fill = 100;
    }

    let newTempHealth = tempHealth - damage;

    if (newTempHealth < 0) {
        newTempHealth = 0;
    } else if (newTempHealth > tempHealth) {
        // newTempHealth = tempHealth;
    }

    // New health
    const TempHealthBar = styled(LinearProgress)(({ }) => ({
        height: "44px",
        borderRadius: borderRadius,
        [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: fillColor,
        },
        [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 0,
            backgroundColor: backgroundColor,
        },
    }));

    return (
        <Box sx={{ display: "grid", width: elementHeightString, height: elementHeightString }}>
            {/* <Box sx={{ //white layer below everything
                zIndex: 0,
                gridArea: "1/1/1/1",
                borderRadius: borderRadius,
                bgcolor: "rgba(255,255,255,0)",
                display: "flex",
            }}></Box> */}
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
                {newTempHealth.toString()}
            </Box>
        </Box>
    );
}
