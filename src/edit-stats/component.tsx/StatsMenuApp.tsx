import Token from "../../Token";
import { useEffect, useState } from "react";
import { writeInputValueToTokenMetadata } from "../writeInputValueToTokenMetadata";
import { StatMetadataID } from "../StatInputClass";
import { useTheme } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import parseSelectedTokens from "../../parseSelectedTokens";

// const healthPreviousDiv: React.CSSProperties = {
//     width: 100,
//     gridColumn: 1, 
//     gridRow: 2, 
//     zIndex: 1, 
//     margin: "2px 0",
//     justifySelf: "center",
//     display:"grid", 
//     gridTemplateColumns: "44px 44px",
//     columnGap: "11px",
//     alignItems: "start",
//     justifyItems: "center",
//     fontSize: "small"
// } 

export default function StatsMenuApp({
    initialToken, role
}: {
    initialToken: Token, role: "GM" | "PLAYER"
}): JSX.Element {

    const mode = useTheme().palette.mode;
    const textColor = useTheme().palette.text.primary;

    const handleFocus = (event: React.FocusEvent<HTMLInputElement, Element>) => { event.target.select(); };

    const [hide, setHide] = useState(initialToken.hideStats);
    function updateHide(value: boolean) {
        setHide(value);
        writeInputValueToTokenMetadata("hide", value);
    }

    const [health, setHealth] = useState(initialToken.health.toString());
    const [maxHealth, setMaxHealth] = useState(initialToken.maxHealth.toString());
    const [tempHealth, setTempHealth] = useState(initialToken.tempHealth.toString());
    const [armorClass, setArmorClass] = useState(initialToken.armorClass.toString());

    useEffect(
        () => OBR.scene.items.onChange(
            () => {
                const updateStats = ((tokens: Token[]) => {
                    let currentToken = tokens[0];
                    setHealth(currentToken.health.toString());
                    setMaxHealth(currentToken.maxHealth.toString());
                    setTempHealth(currentToken.tempHealth.toString());
                    setArmorClass(currentToken.armorClass.toString());
                    setHide(currentToken.hideStats);
                });
                parseSelectedTokens().then(updateStats);
            }
        ),
        [health, maxHealth, tempHealth, armorClass, hide]
    );

    function calculateValue(value: string, id: StatMetadataID) {
        // console.log(value)
        writeInputValueToTokenMetadata(id, value).then((newValue) => {
            switch (id) {
                case "health": setHealth(newValue.toString()); break;
                case "max health": setMaxHealth(newValue.toString()); break;
                case "temporary health": setTempHealth(newValue.toString()); break;
                case "armor class": setArmorClass(newValue.toString()); break;
                default:
            }
        });
    }

    const handleKeyDown = (event: any, id: StatMetadataID) => {
        if (event.key === 'Enter') {
            calculateValue(event.target.value, id);
        }
    }

    function setValue(value: string, id: StatMetadataID) {
        switch (id) {
            case "health": setHealth(value.toString()); break;
            case "max health": setMaxHealth(value.toString()); break;
            case "temporary health": setTempHealth(value.toString()); break;
            case "armor class": setArmorClass(value.toString()); break;
            default:
        }
    }

    const statsMenu: JSX.Element = (
        <div className={"stat-grid " + mode} style={{ color: textColor }}>
            <div className="grid-item">
                <label className="label">HP</label>
            </div>
            <div className="grid-item">
                <label className="label">Temp</label>
            </div>
            <div className="grid-item">
                <label className="label">AC</label>
            </div>
            <div
                className={"health-flex stat-background health-background " + mode}
                style={{ zIndex: 2 }}
            >
                <input
                    className={"number-bubble grid-item " + mode}
                    type="text"
                    id="health"
                    name="health"
                    value={health}
                    onFocus={handleFocus}
                    onChange={(event) => { setValue(event.target.value, "health") }}
                    onBlur={(event) => { calculateValue(event.target.value, "health") }}
                    onKeyDown={(event) => handleKeyDown(event, "health")}
                />
                <input
                    className={"number-bubble grid-item " + mode}
                    type="text"
                    id="max health"
                    name="max health"
                    value={maxHealth}
                    onFocus={handleFocus}
                    onChange={(event) => { setValue(event.target.value, "max health") }}
                    onBlur={(event) => { calculateValue(event.target.value, "max health") }}
                    onKeyDown={(event) => handleKeyDown(event, "max health")}
                />
            </div>
            <div className="health-flex" style={{ zIndex: 3, justifySelf: "center" }}>
                <label id="divisor" style={{ fontFamily: "Lucida Console, monospace" }}>
                    &#x2215;
                </label>
            </div>
            <div className={"grid-item stat-background temp-background " + mode}>
                <input
                    className={"number-bubble " + mode}
                    type="text"
                    id="temporary health"
                    name="temporary health"
                    value={tempHealth}
                    onFocus={handleFocus}
                    onChange={(event) => { setValue(event.target.value, "temporary health") }}
                    onBlur={(event) => { calculateValue(event.target.value, "temporary health") }}
                    onKeyDown={(event) => handleKeyDown(event, "temporary health")}
                />
            </div>
            <div className={"grid-item stat-background ac-background " + mode}>
                <input
                    className={"number-bubble " + mode}
                    type="text"
                    id="armor class"
                    name="armor class"
                    value={armorClass}
                    onFocus={handleFocus}
                    onChange={(event) => { setValue(event.target.value, "armor class") }}
                    onBlur={(event) => { calculateValue(event.target.value, "armor class") }}
                    onKeyDown={(event) => handleKeyDown(event, "armor class")}
                />
            </div>
        </div>
    );

    const hideRow: JSX.Element = (
        <div className={"hide-switch-row " + mode} style={{ color: textColor }}>
            <label htmlFor="hide" className="label" style={{ margin: 0 }}>
                Hide stats from players
            </label>
            <label className="switch">
                <input
                    type="checkbox"
                    id="hide"
                    checked={hide.valueOf()}
                    onChange={(event) => { updateHide(event.target.checked) }}
                />
                <span className="slider round" id="slider span" />
            </label>
        </div>
    );

    if (role === "GM") {
        return (
            <>
                {statsMenu}
                {hideRow}
            </>
        );
    } else {
        return (
            <>
                {statsMenu}
            </>
        );
    }
}