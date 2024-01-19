import { Box, Paper, Radio, Tooltip, styled } from "@mui/material";
import { Token } from "../Token";
import HealthBar from "./HealthBar";
import { TemporaryHealthBubble } from "./TemporaryHealthBubble";
import { useState } from "react";

export default function TokenList({ tokensProp, addedHealth }: any): JSX.Element {

    // Token data with type awareness
    const tokens: Token[] = tokensProp;

    // Radio state
    const radioValues: number[] = []
    const setRadioValues: React.Dispatch<React.SetStateAction<number>>[] = []

    // Initialize radio state
    for (let i = 0; i < tokens.length; i++) {
        [radioValues[i], setRadioValues[i]] = useState(2);
    }

    // Callback for updating radio state
    function updateRadioValue(name: number, value: number) {
        // console.log("Name: " + name + " Value: " + value);
        setRadioValues[name](value);
    }

    // List elements
    const tokenElements: JSX.Element[] = [];
    tokenElements.push(<HeaderRow></HeaderRow>)

    for (let i = 0; i < tokens.length; i++) {

        let scaledAddedHealth: number;
        switch (radioValues[i]) {
            case 0: scaledAddedHealth = 0; break;
            case 1: scaledAddedHealth = addedHealth * 0.5; break;
            case 2: scaledAddedHealth = addedHealth; break;
            case 3: scaledAddedHealth = addedHealth * 2; break;
            default: throw ("Error: Invalid radio button value.")
        }

        tokenElements.push(
            <Box sx={{
                display: "grid",
                gridTemplateColumns: "3fr 2fr",
                gap: "8px"
            }}>
                <Paper elevation={2} sx={{
                    paddingX: "8px",
                    paddingY: "4px",
                    borderRadius: "8px",
                    display: "grid",
                    alignItems: "center",
                    justifyItems: "center",
                    gridTemplateColumns: "2fr 2fr 1fr",
                    gap: "8px"
                }}>
                    <Box sx={{ gridColumn: "span 1", alignSelf: "center", justifySelf: "start" }}>
                        {(tokens[i].item.name.length > 16) ? tokens[i].item.name.substring(0, 24) + "..." : tokens[i].item.name}
                    </Box>
                    <Box sx={{ justifySelf: "center", alignSelf: "stretch" }}>
                        <HealthBar
                            health={tokens[i].health}
                            maxHealth={tokens[i].maxHealth}
                            tempHealth={tokens[i].tempHealth}
                            addedHealth={scaledAddedHealth}
                        ></HealthBar>
                    </Box>
                    <TemporaryHealthBubble
                        tempHealth={tokens[i].tempHealth}
                        damage={(scaledAddedHealth < 0) ? -scaledAddedHealth : 0}
                    ></TemporaryHealthBubble>
                </Paper>
                <RadioRow radioValue={radioValues[i]} updateRadioValue={updateRadioValue} index={i}></RadioRow>
            </Box>
        );
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            m: 1,
            p: 1,
            borderRadius: 1,
            bgcolor: "background.default",
            height: "400px",
            overflowY: "auto",
            gap: "6px"
        }}>
            {tokenElements}
        </Box>
    );
}

function HeaderRow(): JSX.Element {

    const headers: JSX.Element[] = [
        <Tooltip title="None" placement="top"><Box style={{ paddingBottom: "2px" }}>&#x2573;</Box></Tooltip>,
        <Tooltip title="Half" placement="top"><Box style={{ fontSize: "x-large" }}>&#xBD;</Box></Tooltip>,
        <Tooltip title="Full" placement="top"><Box style={{ fontSize: "large" }}>&times;1</Box></Tooltip>,
        <Tooltip title="Double" placement="top"><Box style={{ fontSize: "large" }}>&times;2</Box></Tooltip>,
    ];

    return (

        <Box sx={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            fontWeight: "bold",
            gap: "8px"
        }}>
            <Box
                sx={{
                    paddingX: "8px",
                    borderRadius: "8px",
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1fr",
                    alignItems: "center",
                    gap: "8px"
                }}
            >
                <Box style={{ display: "flex", justifyContent: "start" }}>Name</Box>
                <Box style={{ minWidth: "100px", display: "flex", justifyContent: "center" }}>HP</Box>
                <Box style={{ minWidth: "44px", display: "flex", justifyContent: "center" }}>Temp</Box>
            </Box>

            <Box sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                justifyItems: "center",
                alignItems: "center"
            }}>
                {headers}
            </Box>

        </Box>
    );

}

function RadioRow({ radioValue, updateRadioValue, index }: any) {

    const columns = 4;
    const title: String[] = [
        "None",
        "Half",
        "Full",
        "Double"
    ]

    let radioRow: JSX.Element[] = [];

    for (let n = 0; n < columns; n++) {
        radioRow.push(
            <Tooltip title={title[n].toString()} placement="top" disableHoverListener
                slotProps={{
                    popper: {
                        modifiers: [
                            {
                                name: "offset",
                                options: {
                                    offset: [0, -18],
                                },
                            },
                        ],
                    },
                }}
            >
                <Radio
                    checked={radioValue === n}
                    onChange={evt => updateRadioValue(parseFloat(evt.target.name), parseFloat(evt.target.value))}
                    value={n.toString()}
                    name={index.toString()}
                    inputProps={{ 'aria-label': 'A' }}
                />
            </Tooltip>
        );
    }

    return (
        <Box sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            justifyItems: "center",
            alignItems: "center"
        }}>
            {radioRow}
        </Box>
    );
}