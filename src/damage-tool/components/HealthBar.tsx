import { Box, LinearProgress, linearProgressClasses } from "@mui/material";
import { styled } from '@mui/material/styles';

export default function HealthBar({ health, maxHealth, tempHealth, addedHealth  }: any): JSX.Element {

    // TODO: difficult to distinguish between healing and damage visually
    // both look like damage

    const solidHealthColor = "rgb(147, 46, 48, 1)";
    const darkHealthColor = "rgb(95, 30, 31)"; // alt: "rgb(147, 46, 48, 0.5)"
    const outlineColor = "rgba(255, 255, 255, 0.6)";
    const elementWidth = 100;
    const elementWidthString = elementWidth.toString() + "px"
    const outlineThickness = 2;
    const outlinePercent = outlineThickness / elementWidth * 100;

    let baseFill;
    let topFill;

    if (addedHealth < 0) {
        const damage = Math.abs(addedHealth)
        if (tempHealth > damage) {
            addedHealth = 0;
        } else {
            addedHealth = tempHealth - damage; 
        }
    }

    if (addedHealth > 0) {

        if (health > maxHealth) {
            health = maxHealth;
        }
    
        if (health + addedHealth > maxHealth) {
            addedHealth = maxHealth - health;
        }

        const originalHealthFill = outlinePercent + (100 - 2 * outlinePercent) * health / maxHealth;
        const modifiedHealthFill = outlinePercent + (100 - 2 * outlinePercent) * (health + addedHealth) / maxHealth;

        baseFill = modifiedHealthFill;
        topFill = originalHealthFill;

    } else {

        const originalHealthFill = outlinePercent + (100 - 2 * outlinePercent) * health / maxHealth;
        const modifiedHealthFill = outlinePercent + (100 - 2 * outlinePercent) * (health + addedHealth) / maxHealth;

        baseFill = originalHealthFill;
        topFill = modifiedHealthFill;

    }

    // Black background and translucent old health 
    const HealthBarBase = styled(LinearProgress)(({ /*theme*/ }) => ({
        height: "44px",
        borderRadius: "12px",
        [`&.${linearProgressClasses.colorPrimary}`]: {
            backgroundColor: "rgba(0,0,0,0.35)",
        },
        [`& .${linearProgressClasses.bar}`]: {
            borderRadius: 0,
            backgroundColor: darkHealthColor,
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
        <Box sx={{ display: "grid", width:elementWidthString }}>
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
                outline: "2px",
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
                justifyContent: "center"
            }}>
                {(health + addedHealth).toString() + " / " + maxHealth.toString()}
            </Box>
        </Box>
    );
}