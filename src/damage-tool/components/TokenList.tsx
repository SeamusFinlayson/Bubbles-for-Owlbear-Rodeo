import { Box, Paper, Radio, Tooltip, useTheme } from "@mui/material";
import { Token } from "../Token";
import HealthBar from "./HealthBar";
import { TemporaryHealthBubble } from "./TemporaryHealthBubble";
import { calculateNewHealth, scaleHealthDiff } from "../healthCalculations";

export default function TokenList({ tokensProp, healthDiff, damageScaleOptions, updateDamageScaleSetting }: any): JSX.Element {

    // Token data with type awareness
    const tokens: Token[] = tokensProp;

    // Array of list elements
    const tokenElements = tokens.map((_token, i) => {

        // Scale health diff
        let scaledHealthDiff: number = scaleHealthDiff(damageScaleOptions, healthDiff, i);

        // Set new health and temp health values
        let [newHealth, newTempHealth] = calculateNewHealth(
            tokens[i].health.valueOf(),
            tokens[i].maxHealth.valueOf(),
            tokens[i].tempHealth.valueOf(),
            scaledHealthDiff
        );

        const wordWrapStyle = { 
            overflowWrap:"break-word",
            wordWrap:"break-word",
            wordBreak:"break-word"
        }

        return (
            <Box key={tokens[i].item.id} sx={{
                display: "grid",
                gridTemplateColumns: "3fr 2fr",
                gap: "8px"
            }}>

                <Paper elevation={2} sx={{
                    paddingX: "8px",
                    paddingY: "4px",
                    borderRadius: "8px",
                    minWidth: 233,
                    display: "grid",
                    alignItems: "center",
                    justifyItems: "center",
                    gridTemplateColumns: "2fr 2fr 1fr",
                    gap: "8px"
                }}>
                    <Box sx={{ gridColumn: "span 1", justifySelf: "stretch", alignSelf: "center",  ...wordWrapStyle }}>
                        {(tokens[i].item.name.length > 20) ? tokens[i].item.name.substring(0, 20).trim() + String.fromCharCode(0x2026) : tokens[i].item.name}
                    </Box>
                    <HealthBar
                        health={tokens[i].health}
                        newHealth={newHealth}
                        maxHealth={tokens[i].maxHealth}
                    ></HealthBar>
                    <TemporaryHealthBubble
                        tempHealth={tokens[i].tempHealth}
                        newTempHealth={newTempHealth}
                    ></TemporaryHealthBubble>
                </Paper>

                <DamageScaleSettingRow
                    damageScaleOption={damageScaleOptions[i]}
                    updateDamageScaleOption={updateDamageScaleSetting}
                    index={i}
                ></DamageScaleSettingRow>

            </Box>
        );
    });

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            m: 1,
            p: 1,
            borderRadius: 1,
            bgcolor: "background.default",
            height: "390px",
            overflowY: "auto",
            gap: "6px"
        }}>
            <HeaderRow></HeaderRow>
            {tokenElements}
        </Box>
    );
}

function HeaderRow(): JSX.Element {

    const sharedStyle = { display: "flex", justifyContent: "center", minWidth: 42 }

    const headers: JSX.Element[] = [
        <Tooltip key={0} placement="top" title="None"><Box style={{ ...sharedStyle, paddingBottom: "2px" }}>&#x2573;</Box></Tooltip>,
        <Tooltip key={1} placement="top" title="Half"><Box style={{ ...sharedStyle, fontSize: "x-large" }}>&#xBD;</Box></Tooltip>,
        <Tooltip key={2} placement="top" title="Full"><Box style={{ ...sharedStyle, fontSize: "large" }}>&times;1</Box></Tooltip>,
        <Tooltip key={3} placement="top" title="Double"><Box style={{ ...sharedStyle, fontSize: "large" }}>&times;2</Box></Tooltip>,
    ];

    return (

        <Box color={"text.secondary"} sx={{
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            fontWeight: "bold",
            gap: "8px"
        }}>
            <Box
                sx={{
                    minWidth: 233,
                    paddingX: "8px",
                    borderRadius: "8px",
                    display: "grid",
                    gridTemplateColumns: "2fr 2fr 1fr",
                    alignItems: "center",
                    gap: "8px"
                }}
            >
                
                <Tooltip placement="top-start" title="It's a name..."><Box style={{ display: "flex", justifyContent: "start" }}>Name</Box></Tooltip>
                <Tooltip placement="top" title="Hit Points"><Box style={{ minWidth: "100px", display: "flex", justifyContent: "center" }}>HP</Box></Tooltip>
                <Tooltip placement="top" title="Temporary Hit Points"><Box style={{ minWidth: "44px", display: "flex", justifyContent: "center" }}>Temp</Box></Tooltip>
                
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

function DamageScaleSettingRow({ damageScaleOption, updateDamageScaleOption, index }: any): JSX.Element {

    const columns = 4;
    const title: String[] = [
        "None",
        "Half",
        "Full",
        "Double"
    ]

    const themeIsDark = useTheme().palette.mode === "dark";

    let radioRow: JSX.Element[] = [];

    for (let n = 0; n < columns; n++) {
        radioRow.push(
            <Tooltip key={n} title={title[n].toString()} placement="top" disableHoverListener
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
                    color={themeIsDark?"secondary":"primary"}
                    checked={damageScaleOption === n}
                    onChange={evt => updateDamageScaleOption(parseFloat(evt.target.name), parseFloat(evt.target.value))}
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