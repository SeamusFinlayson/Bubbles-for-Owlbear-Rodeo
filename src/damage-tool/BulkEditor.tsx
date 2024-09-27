import Token from "../TokenClass";
import "../index.css";
import { useEffect, useReducer, useState } from "react";
import { BulkEditorState, Operation, StampedDiceRoll } from "./types";
import Footer from "./Footer";
import Header from "./Header";
import { DamageTable, SetValuesTable } from "./Tables";
import { getRollsFromScene, reducer, unsetStatOverwrites } from "./helpers";
import OBR from "@owlbear-rodeo/sdk";
import { parseSelectedTokens } from "@/itemHelpers";

export default function BulkEditor({
  initialTokens,
  initialRolls,
}: {
  initialTokens: Token[];
  initialRolls: StampedDiceRoll[];
}): JSX.Element {
  // App state
  const [appState, dispatch] = useReducer(reducer, {}, (): BulkEditorState => {
    return {
      operation: "none",
      rolls: initialRolls,
      value: null,
      animateRoll: false,
      statOverwrites: unsetStatOverwrites(),
      damageScaleOptions: new Map<string, number>(),
      includedItems: new Map<string, boolean>(),
    };
  });

  // Tokens
  const [tokens, setTokens] = useState(initialTokens);

  // Keep tokens up to date with scene
  useEffect(
    () =>
      OBR.scene.items.onChange(() => {
        const updateTokens = (newTokens: Token[]) => {
          setTokens(newTokens);
        };
        parseSelectedTokens(true).then(updateTokens);
      }),
    [],
  );

  useEffect(
    OBR.scene.onMetadataChange(async (sceneMetadata) => {
      dispatch({
        type: "set-rolls",
        rolls: await getRollsFromScene(sceneMetadata),
      });
    }),
    [],
  );

  useEffect(() => {
    const newValue = appState.rolls[0]?.total;
    if (newValue !== undefined)
      dispatch({ type: "set-value", value: newValue });
  }, [appState.rolls[0]?.total]);

  const getTable = (operation: Operation) => {
    switch (operation) {
      case "damage":
        return (
          <DamageTable
            tokens={tokens}
            appState={appState}
            dispatch={dispatch}
          ></DamageTable>
        );
      default:
        return (
          <SetValuesTable
            tokens={tokens}
            setTokens={setTokens}
            appState={appState}
            dispatch={dispatch}
          ></SetValuesTable>
        );
    }
  };

  return (
    <div className="h-[522px] overflow-clip">
      <div className="flex h-full flex-col justify-between bg-mirage-100 dark:bg-mirage-950 dark:text-mirage-200">
        <Header appState={appState} dispatch={dispatch}></Header>
        {getTable(appState.operation)}
        <Footer
          tokens={tokens}
          appState={appState}
          dispatch={dispatch}
        ></Footer>
      </div>
    </div>
  );
}
