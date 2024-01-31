import OBR, { Item } from "@owlbear-rodeo/sdk";
import Token from "../../TokenClass";
import { useEffect, useState } from "react";
import { Box, Button, TextField, useTheme } from "@mui/material";
import LoadingButton from '@mui/lab/LoadingButton';
import TokenList from "./TokenList";
import { getPluginId } from "../../getPluginId";
import { StatMetadataID } from "../../edit-stats/StatInputClass";
import { scaleHealthDiff, calculateNewHealth } from "../healthCalculations";
import parseSelectedTokens from "../../parseSelectedTokens";

export default function DamageToolApp({
    initialTokens
}: {
    initialTokens: Token[];
}): JSX.Element {

    // Determine dark or light theme
    const themeIsDark = useTheme().palette.mode === "dark";

    // State for displaying narrow UI on narrow displays
    const checkNarrow = () => (window.innerWidth < 521) ? true : false;
    const [isNarrow, setIsNarrow] = useState(checkNarrow);

    // Keep is narrow state up to date with window width
    useEffect(
        () => {
            const updateIsNarrow = () => setIsNarrow(checkNarrow);
            window.addEventListener("resize", updateIsNarrow);
            return () => {
                window.removeEventListener("resize", updateIsNarrow);
            };
        },
        []
    );

    // State for whether the popover is updating scene then closing
    const [confirming, setConfirming] = useState(false);

    // State for selected tokens
    const [selectedTokens, setSelectedTokens] = useState(initialTokens);

    // Keep selectedTokens up to date with scene
    useEffect(
        () => OBR.scene.items.onChange(
            () => {
                if (!confirming) {
                    const updateSelectedTokens = ((tokens: Token[]) => {
                        setSelectedTokens(tokens);
                    });
                    parseSelectedTokens(true).then(updateSelectedTokens);
                }
            }
        ),
        [confirming]
    );

    // State for radio button scale settings
    const [damageScaleSettings, setDamageScaleSettings] = useState(() => {
        let initialSettings = new Map<string, number>();
        for (const token of selectedTokens) {
            initialSettings.set(token.item.id, 3);
        }
        return initialSettings;
    });

    // Callback for updating damage scaling options
    function updateDamageScaleSetting(key: string, value: number) {
        setDamageScaleSettings(new Map(damageScaleSettings.set(key, value)));
    }

    // State for change health input
    const [textContent, setTextContent] = useState("");

    // Determine if health change input content is valid
    const strictInputValid = validateContent(textContent);
    const lenientInputValid = validateContent(textContent, false);

    // Determine if a validation error should be displayed 
    const [strict, useStrict] = useState(false);
    const contentError = strict ? !strictInputValid : !lenientInputValid;

    // Determine processed value of health input
    const healthDiff = setHealthDiff(textContent, strictInputValid);

    // Determine confirm can be run, then update scene and close popover
    function handleConfirm() {
        useStrict(true);
        if (strictInputValid) {
            setConfirming(true);
            writeUpdatedValuesToTokens(Math.trunc(healthDiff), damageScaleSettings, selectedTokens);
            closePopover();
        }
    }

    // Keyboard button controls
    useEffect(
        () => {
            const handleKeydown = (event: any) => {
                if (event.key == "Escape") {
                    closePopover();
                }
                if (event.key == "Enter") {
                    handleConfirm();
                }
            };
            document.addEventListener('keydown', handleKeydown, false);
            return () => document.removeEventListener('keydown', handleKeydown);
        },
        [healthDiff]
    );

    // App content
    return (
        <>
            <Box sx={{ paddingX: 1 }}>
                <TextField
                    color={(themeIsDark ? "secondary" : "primary")}
                    error={contentError}
                    type="text"
                    InputProps={{ inputProps: { inputMode: "decimal" } }}
                    label={contentError ? "Enter an integer" : "Change health by..."}
                    value={textContent}
                    onChange={evt => {
                        setTextContent(evt.target.value);
                        useStrict(false);
                    }}
                    onBlur={_evt => useStrict(true)}
                autoFocus
                ></TextField>
        </Box >

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
                    onClick={closePopover}
                >
                    {isNarrow ? "Cancel" : "Cancel (escape)"}
                </Button>
                <LoadingButton
                    variant="contained"
                    sx={{ flexGrow: 1 }}
                    loading={confirming}
                    onClick={handleConfirm}
                >
                    <span>
                        {isNarrow ? "Confirm" : "Confirm (enter)"}
                    </span>
                </LoadingButton>
            </Box>
        </>
    );
}

function validateContent(content: string, strict: boolean = true): boolean {

    const isLookingLikeInt = new RegExp(/^([+|-]?[0-9]*)$/g);
    const isInt = new RegExp(/^([+|-]?[0-9]+)$/g);
    // const hasInvalidCharacters = new RegExp(/[^0-9+-]/);

    let result: boolean;
    if (strict) {
        result = isInt.test(content);
    } else {
        result = isLookingLikeInt.test(content);
    }
    // console.log("update", (strict) ? "strict" : "lenient", "input valid to", result);
    return result;
}

// Processed value of change health input
function setHealthDiff(text: string, valid: boolean): number {

    let value = parseFloat(text);

    if (isNaN(value) || !valid) {
        return (0)
    } else {
        return (value);
    }
}

function closePopover() {
    OBR.popover.close(getPluginId("damage-tool-popover"));
}

function writeUpdatedValuesToTokens(
    healthDiff: number, damageScaleSettings: Map<string, number>, tokens: Token[]
) {

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
            let scaledHealthDiff: number = scaleHealthDiff(damageScaleSettings, healthDiff, items[i].id);

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
}