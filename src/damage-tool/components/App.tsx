import OBR, { Item } from "@owlbear-rodeo/sdk";
import Token from "../Token";
import { useEffect, useState } from "react";
import { Box, Button, TextField, useTheme } from "@mui/material";
import TokenList from "./TokenList";
import { getPluginId } from "../../getPluginId";
import { StatMetadataID } from "../../edit-stats/StatInputClass";
import { scaleHealthDiff, calculateNewHealth } from "../healthCalculations";
import parseSelectedTokens from "../parseSelectedTokens";

export default function App({
    initialTokens
}: {
    initialTokens: Token[];
}): JSX.Element {

    // Selected tokens state
    const [selectedTokens, setSelectedTokens] = useState(initialTokens);

    // State to not update UI with modified values when confirm is pressed
    const [stopUpdates, setStopUpdates] = useState(false);

    // Re parse selection on scene item changes
    useEffect(
        () => OBR.scene.items.onChange(
            () => {
                // TODO: Prevent updates after confirm is pressed
                if (!stopUpdates) {
                    const updateSelectedTokens = ((tokens: Token[]) => {
                        setSelectedTokens(tokens);
                    });
                    parseSelectedTokens().then(updateSelectedTokens);
                }
            }
        ),
        [selectedTokens, stopUpdates]
    );

    // Health diff state
    const [healthDiff, setHealthDiff] = useState(0);

    function updateHealthDiff(value: number) {

        if (isNaN(value)) {
            setHealthDiff(0);
        } else {
            setHealthDiff(value);
        }
    }

    // Damage scaling state
    const damageScaleSettings: number[] = [];
    const setDamageScaleSettings: React.Dispatch<React.SetStateAction<number>>[] = [];

    // Initialize damage scaling options
    for (let i = 0; i < selectedTokens.length; i++) {
        [damageScaleSettings[i], setDamageScaleSettings[i]] = useState(3);
    }

    // Callback for updating damage scaling options
    function updateDamageScaleSetting(name: number, value: number) {
        // console.log("Name: " + name + " Value: " + value);
        setDamageScaleSettings[name](value);
    }

    // State for displaying narrow UI on narrow displays
    const checkNarrow = () => (window.innerWidth < 481) ? true : false;
    const [isNarrow, setIsNarrow] = useState(checkNarrow);

    useEffect(() => {
        const updateIsNarrow = () => setIsNarrow(checkNarrow);
        window.addEventListener("resize", updateIsNarrow);
        return () => {
            window.removeEventListener("resize", updateIsNarrow);
        };
    }, [isNarrow]);

    // Keyboard button controls
    useEffect(
        () => {

            const handleKeydown = (event: any) => {
                if (event.key == "Escape") {
                    handleCancelButton();
                }
                if (event.key == "Enter") {
                    setStopUpdates(true)
                    handleConfirmButton(Math.trunc(healthDiff), damageScaleSettings, selectedTokens);
                }
            };
            document.addEventListener('keydown', handleKeydown, false);

            return () => { document.removeEventListener('keydown', handleKeydown); };

        },
        [healthDiff]
    );

    const themeIsDark = useTheme().palette.mode === "dark";

    // App content
    return (
        <>
            <Box sx={{ paddingX: 1 }}>
                <TextField
                    color={themeIsDark ? "secondary" : "primary"}
                    type="number"
                    InputProps={{ inputProps: { inputMode: "decimal" } }}
                    label="Change health by..."
                    onChange={evt => updateHealthDiff(parseFloat(evt.target.value))}
                    autoFocus
                ></TextField>
            </Box>

            <TokenList
                tokens={selectedTokens}
                healthDiff={Math.trunc(healthDiff)}
                damageScaleOptions={damageScaleSettings}
                updateDamageScaleSetting={updateDamageScaleSetting}
                isNarrow={isNarrow}
            ></TokenList>

            <Box sx={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "nowrap",
                padding: "8px",
                gap: "8px",
                position: "fixed",
                bottom: "0",
                left: "0",
                right: "0",
            }}>
                <Button
                    variant="outlined" sx={{ flexGrow: 1 }}
                    onClick={handleCancelButton}
                >
                    {isNarrow ? "Cancel" : "Cancel (escape)"}
                </Button>
                <Button
                    variant="contained"
                    sx={{ flexGrow: 1 }}
                    onClick={() => { 
                        setStopUpdates(true);
                        handleConfirmButton(Math.trunc(healthDiff), damageScaleSettings, selectedTokens); 
                    }}
                >
                    {isNarrow ? "Confirm" : "Confirm (enter)"}
                </Button>
            </Box>
        </>
    );
}

function handleCancelButton() {

    // Close popover
    OBR.popover.close(getPluginId("damage-tool-popover"));
}

function handleConfirmButton(
    healthDiff: number, damageScaleSettings: number[], tokens: Token[]
) {

    // console.log("Confirm")
    // console.log(healthDiff)

    const validItems: Item[] = [];
    tokens.forEach((token) => {
        validItems.push(token.item);
    });

    const healthId: StatMetadataID = "health";
    const tempHealthId: StatMetadataID = "temporary health";

    OBR.scene.items.updateItems(validItems, (items) => {
        for (let i = 0; i < items.length; i++) {

            if (items[i].id !== tokens[i].item.id) {
                throw ("Error: Item mismatch in Stat Bubbles Damage Tool, could not update token.")
            }

            // Scale health diff
            let scaledHealthDiff: number = scaleHealthDiff(damageScaleSettings, healthDiff, i);

            // Set new health and temp health values
            let [newHealth, newTempHealth] = calculateNewHealth(
                tokens[i].health.valueOf(),
                tokens[i].maxHealth.valueOf(),
                tokens[i].tempHealth.valueOf(),
                scaledHealthDiff
            );

            const newMetadata = { [healthId]: newHealth, [tempHealthId]: newTempHealth };

            let retrievedMetadata: any;
            if (items[i].metadata[getPluginId("metadata")]) {
                retrievedMetadata = JSON.parse(JSON.stringify(items[i].metadata[getPluginId("metadata")]));
            }

            const combinedMetadata = { ...retrievedMetadata, ...newMetadata }; //overwrite only the modified value

            items[i].metadata[getPluginId("metadata")] = combinedMetadata;

        }
    });

    // Close popover
    OBR.popover.close(getPluginId("damage-tool-popover"));
}