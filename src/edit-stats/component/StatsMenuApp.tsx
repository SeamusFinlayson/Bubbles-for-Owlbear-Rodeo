import Token, { StatsObject } from "../../TokenClass";
import { useEffect, useState } from "react";
import { isInputName, writeInputValueToTokenMetadata } from "../writeInputValueToTokenMetadata";
import { useTheme } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import parseSelectedTokens from "../../parseSelectedTokens";

export default function StatsMenuApp({
    initialToken, role
}: {
    initialToken: Token, role: "GM" | "PLAYER"
}): JSX.Element {

    const mode = useTheme().palette.mode;
    const textColor = useTheme().palette.text.primary;

    const [token, setToken] = useState<StatsObject>(initialToken.returnStatsAsObject());

    useEffect(
        () => OBR.scene.items.onChange(
            () => {
                const updateStats = ((tokens: Token[]) => {
                    let currentToken = tokens[0];
                    setToken(currentToken.returnStatsAsObject());
                });
                parseSelectedTokens().then((tokens) => updateStats(tokens));
            }
        ),
        []
    );

    const handleFocus = (event: React.FocusEvent<HTMLInputElement, Element>) => { event.target.select(); };

    function calculateValue(e: React.ChangeEvent<HTMLInputElement>) {

        const name = e.target.name;
        if (!isInputName(name)) { throw "Error: invalid input name." }

        let value: string | boolean;

        switch (e.target.type) {
            case "text": value = e.target.value; break;
            case "checkbox": value = e.target.checked; break;
            default: throw "Error unhandled input type.";
        }

        writeInputValueToTokenMetadata(name, value).then((newValue) => {
            setToken((prev): StatsObject => {
                return ({ ...prev, [name]: newValue });
            });
        });
    }

    const handleKeyDown = (event: any) => {

        if (event.key === 'Enter') {
            calculateValue(event);
        }
    }

    function updateTokenString(e: React.ChangeEvent<HTMLInputElement>) {

        const name = e.target.name;
        if (!isInputName(name)) { throw "Error: invalid input name." }

        let value: string = e.target.value;

        setToken((prev): StatsObject => {
            return { ...prev, [name]: value };
        });
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
                    className={"number-bubble " + mode}
                    type="text"
                    // id="health"
                    name="health"
                    value={token.health.toString()}
                    onFocus={handleFocus}
                    onChange={updateTokenString}
                    onBlur={calculateValue}
                    onKeyDown={handleKeyDown}
                />
                <div style={{placeSelf:"center", height:"44px"}}>
                    &#x2215;
                </div>
                <input
                    className={"number-bubble " + mode}
                    type="text"
                    // id="max health"
                    name="maxHealth"
                    value={token.maxHealth.toString()}
                    onFocus={handleFocus}
                    onChange={updateTokenString}
                    onBlur={calculateValue}
                    onKeyDown={handleKeyDown}
                />
            </div>
            {/* <div style={{ zIndex: 3, justifySelf: "center", alignSelf:"center", gridColumn:1, gridRow:2 }}>
                <label id="divisor" style={{ fontFamily: "Lucida Console, monospace" }}>
                </label>
            </div> */}
            <div className={"grid-item stat-background temp-background " + mode}>
                <input
                    className={"number-bubble " + mode}
                    type="text"
                    // id="temporary health"
                    name="tempHealth"
                    value={token.tempHealth.toString()}
                    onFocus={handleFocus}
                    onChange={updateTokenString}
                    onBlur={calculateValue}
                    onKeyDown={handleKeyDown}
                />
            </div>
            <div className={"grid-item stat-background ac-background " + mode}>
                <input
                    className={"number-bubble " + mode}
                    type="text"
                    // id="armor class"
                    name="armorClass"
                    value={token.armorClass.toString()}
                    onFocus={handleFocus}
                    onChange={updateTokenString}
                    onBlur={calculateValue}
                    onKeyDown={handleKeyDown}
                />
            </div>
        </div >
    );

    const hideRow: JSX.Element = (
        <div className={"hide-switch-row " + mode} style={{ color: textColor }}>
            <label htmlFor="hide" className="label" style={{ margin: 0 }}>
                Hide stats from players
            </label>
            <label className="switch">
                <input
                    type="checkbox"
                    name="hideStats"
                    checked={token.hideStats.valueOf()}
                    onChange={calculateValue}
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