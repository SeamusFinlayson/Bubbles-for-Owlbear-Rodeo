import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import { createRoot } from 'react-dom/client';
import { Token } from "./Token";
import { createContext, useContext, useState } from "react";
import { getTheme } from "./OBRThemeProvider";
import { Box, Paper, Radio, TextField, ThemeProvider, Tooltip } from "@mui/material";
import TokenList from "./components/TokenList";

const validTokens: Token[] = [];

const AddedHealthContext = createContext(0);

let tokensFrameStyle = {
    bgcolor: "background.default",
    color: "text.secondary",
    fontWeight: "bold"
}

let tokenElementStyle = {
    bgcolor: "background.paper",
    color: "text.primary",
    fontWeight: "normal"
    // eleva
}

function App(): JSX.Element {

    const [addedHealth, setAddedHealth] = useState(0);

    function updateHealth(add_health: number) {
        setAddedHealth((isNaN(add_health) ? 0 : add_health));
        console.log("added health" + addedHealth)
    }

    return (
        <>
            <Box sx={{
                paddingX: 1,
            }}>
                <TextField type="number" label="Change health by..."
                    onChange={evt => updateHealth(parseFloat(evt.target.value))} autoFocus
                ></TextField>
            </Box>

            {/* <div className="mother-grid">
                <CurrentTokensFrame></CurrentTokensFrame>
                <h1 className="divider-arrow">&#8594;</h1>
                <AddedHealthContext.Provider value={addedHealth}>
                    <NewTokensFrame></NewTokensFrame>
                </AddedHealthContext.Provider>
            </div> */}

            <AddedHealthContext.Provider value={addedHealth}>
                <TokenList tokensProp={validTokens} addedHealth={addedHealth}></TokenList>
            </AddedHealthContext.Provider>

            <div className="bottom-row">
                <button className="cancel-button">Cancel (escape)</button>
                <button className="confirm-button">Confirm (enter)</button>
            </div>
        </>
    );
}

// Current tokens

function CurrentTokensFrame() {
    return (
        <Box className="tokens-frame" style={{ justifySelf: "start" }} sx={tokensFrameStyle}>
            <div className="token-list">
                <CurrentTokenListHeader></CurrentTokenListHeader>
                <CurrentTokenList></CurrentTokenList>
                {/* <p>Count: {validTokens.length}</p> */}
            </div>
        </Box>
    );
}

function CurrentTokenListHeader() {
    return (
        <div className="current-token-list-header">
            <p className="token-name">Name</p>
            <p>HP</p>
            <p>max</p>
            <p>Temp</p>
        </div>
    );
}

function CurrentTokenList() {
    let elements = [];
    for (let i = 0; i < validTokens.length; i++) {
        elements.push(<CurrentTokenElement token={validTokens[i]}></CurrentTokenElement>)
    }

    return (elements);
}

function CurrentTokenElement({ token }: any) {

    let displayName = token.item.name;
    if (displayName.length > 20) {
        displayName = displayName.substring(0, 20).trim() + "...";
    }

    let healthColorStyle = { color: "lightgreen" };
    if (token.health < token.maxHealth / 4) {
        healthColorStyle = { color: "#ff4040" };
    } else if (token.health < token.maxHealth / 2) {
        healthColorStyle = { color: "yellow" };
    }

    let tempHealthColorStyle = { color: "text" };
    if (token.tempHealth > 0) {
        tempHealthColorStyle = { color: "lightgreen" };
    }

    return (
        <Paper className="current-token-element" sx={tokenElementStyle}>
            <p className="token-name" style={{ fontWeight: "normal" }}>{displayName}</p>
            <p style={healthColorStyle}>{token.health}</p>
            <p>{token.maxHealth}</p>
            <p style={tempHealthColorStyle}>{token.tempHealth}</p>
        </Paper>
    )
}

// New tokens

function NewTokensFrame() {

    const radioValues: number[] = []
    const setRadioValues: React.Dispatch<React.SetStateAction<number>>[] = []

    for (let i = 0; i < validTokens.length; i++) {
        [radioValues[i], setRadioValues[i]] = useState(2);
    }

    function updateRadioValue(name: number, value: number) {
        // console.log("Name: " + name + " Value: " + value);
        setRadioValues[name](value);
    }

    return (
        <Box className="tokens-frame" style={{ justifySelf: "end" }} sx={tokensFrameStyle}>
            <div className="token-list">
                <NewTokenListHeader></NewTokenListHeader>
                <NewTokenList radioValues={radioValues}></NewTokenList>
                {/* <p>Count: {validTokens.length}</p> */}
            </div>
            <RadioColumns radioValues={radioValues} updateRadioValue={updateRadioValue}></RadioColumns>
        </Box>
    );
}

function RadioColumns({ radioValues, updateRadioValue }: any) {

    const headers: JSX.Element[] = [
        <Tooltip title="Immune" placement="top"><p style={{ paddingBottom: "3px" }}>&#x2573;</p></Tooltip>,
        <Tooltip title="Resistant" placement="top"><p>&#xBD;</p></Tooltip>,
        <Tooltip title="Normal" placement="top"><p>&times;1</p></Tooltip>,
        <Tooltip title="Vulnerable" placement="top"><p>&times;2</p></Tooltip>,

    ];

    const headerRow: JSX.Element = <div className="setting-token-list-header">
        {headers}
    </div>;

    let radioColumn: JSX.Element[] = [];
    radioColumn.push(headerRow);

    let radioRow: JSX.Element[];


    for (let i = 0; i < validTokens.length; i++) {
        radioRow = [];
        for (let n = 0; n < headers.length; n++) {
            radioRow.push(
                <Radio
                    checked={radioValues[i] === n}
                    onChange={evt => updateRadioValue(parseFloat(evt.target.name), parseFloat(evt.target.value))}
                    value={n.toString()}
                    name={i.toString()}
                    inputProps={{ 'aria-label': 'A' }}
                />
            );
        }
        radioColumn.push(<div className="radio-row">
            {radioRow}
        </div>);
    }

    return (<div className="token-list setting">
        {radioColumn}
    </div>);
}

function NewTokenListHeader() {
    return (
        <div className="new-token-list-header">
            <p>HP</p>
            <p>max</p>
            <p>Temp</p>
        </div >
    );
}

function NewTokenList({ radioValues }: any) {
    let elements = [];
    for (let i = 0; i < validTokens.length; i++) {
        elements.push(
            <NewTokenElement token={validTokens[i]} radioValue={radioValues[i]}></NewTokenElement>
        );
    }

    return (elements);
}

function NewTokenElement({ token, radioValue }: any) {

    const addedHealth = useContext(AddedHealthContext);
    // console.log("Radio state: " + radioValue)

    let scaledAddedHealth;

    switch (radioValue) {
        case 0:
            scaledAddedHealth = 0;
            break;
        case 1:
            scaledAddedHealth = Math.trunc(addedHealth / 2);

            break;
        case 2:
            scaledAddedHealth = addedHealth;

            break;
        case 3:
            scaledAddedHealth = addedHealth * 2;
            break;
        default:
            throw ("Error: Invalid radio button value.")
            break;
    }

    let newHealth = token.health;
    let newTempHealth = token.tempHealth;
    if (scaledAddedHealth > 0) {
        newHealth = token.health + scaledAddedHealth;
        newHealth = (newHealth > token.maxHealth) ? token.maxHealth : newHealth;
    } else {
        if (token.tempHealth > 0) {
            newTempHealth = token.tempHealth + scaledAddedHealth;
            if (newTempHealth < 0) {
                newHealth = token.health + newTempHealth;
                newTempHealth = 0;
            }
        } else {
            newHealth = token.health + scaledAddedHealth;
        }
    }

    let healthColorStyle = { color: "lightgreen" };
    if (newHealth < token.maxHealth / 4) {
        healthColorStyle = { color: "#ff4040" };
    } else if (newHealth < token.maxHealth / 2) {
        healthColorStyle = { color: "yellow" };
    }

    let tempHealthColorStyle = { color: "text" };
    if (newTempHealth > 0) {
        tempHealthColorStyle = { color: "lightgreen" };
    }

    return (
        <Paper className="new-token-element" style={{ gridTemplateColumns: "repeat(3,50px)" }} sx={tokenElementStyle}>
            <p style={healthColorStyle}>{newHealth}</p>
            <p>{token.maxHealth}</p>
            <p style={tempHealthColorStyle}>{newTempHealth}</p>
        </Paper>
    )
}

OBR.onReady(async () => {

    await parseSelection();

    // Render React component
    const root = createRoot(document.getElementById('app') as HTMLDivElement);

    const themeObject = await OBR.theme.getTheme()

    // if (themeObject.mode === "DARK") {
    //     tokensFrameStyle = {
    //         bgcolor: "rgb(34, 38, 57)",
    //         color: "text.secondary",
    //         fontWeight: "bold"
    //     }

    //     tokenElementStyle = {
    //         bgcolor: "rgb(61, 64, 81)",
    //         color: "text.primary",
    //         fontWeight: "bold"
    //     }
    // }

    const theme = getTheme(themeObject)
    console.log("done")

    root.render(
        <ThemeProvider theme={theme}>
            <App />
        </ThemeProvider>
    );
});

async function parseSelection() {

    // Get selected Items
    const selection = await OBR.player.getSelection();
    const items = await OBR.scene.items.getItems(selection);

    if (items.length === 0) {
        // OBR.popover.close()
        throw "Error: No item selected";
    }

    for (const item of items) {

        // Get token metadata
        const metadata: any = item.metadata[getPluginId("metadata")];

        // Extract health metadata
        let health: number = NaN;
        let hasHealth: boolean;
        try {
            health = parseFloat(metadata["health"]);
            hasHealth = true;
        } catch (error) {
            hasHealth = false;
        }
        if (isNaN(health)) {
            hasHealth = false;
        }

        // Extract max health metadata
        let maxHealth: number = NaN;
        let hasMaxHealth: boolean;
        try {
            maxHealth = parseFloat(metadata["max health"]);
            hasMaxHealth = true;
        } catch (error) {
            hasMaxHealth = false;
        }
        if (isNaN(maxHealth)) {
            hasMaxHealth = false;
        }

        // Extract temp health metadata
        let tempHealth: number = NaN;
        try {
            tempHealth = parseFloat(metadata["temporary health"]);
        } catch (error) {
            tempHealth = 0
        }
        if (isNaN(tempHealth)) {
            tempHealth = 0;
        }

        // If the token has health and max health add it to the list of valid tokens
        if (hasHealth || hasMaxHealth) {
            validTokens.push(new Token(item, health, maxHealth, tempHealth));
        }
    }


}

async function setupDocument() {

}

