import Token from "../TokenClass";
import "../index.css";
import { useEffect, useState } from "react";
import { Operation, StampedDiceRoll, StatOverwriteData } from "./types";
import Footer from "./Footer";
import Header from "./Header";
import { DamageTable, SetValuesTable } from "./Tables";
import {
  applyHealthDiffToItems,
  getRollsFromScene,
  overwriteStats,
} from "./helpers";
import OBR from "@owlbear-rodeo/sdk";
import { parseSelectedTokens } from "@/itemHelpers";
import ActionButton from "./ActionButton";

const getInitialStatOverwrites = () => {
  return {
    hitPoints: "",
    maxHitPoints: "",
    tempHitPoints: "",
    armorClass: "",
  };
};

export default function BulkEditor({
  initialTokens,
  initialRolls,
}: {
  initialTokens: Token[];
  initialRolls: StampedDiceRoll[];
}): JSX.Element {
  // App state
  const [operation, setOperation] = useState<Operation>("none");
  const [stampedRoll, setStampedRolls] =
    useState<StampedDiceRoll[]>(initialRolls);
  const [value, setValue] = useState<number | null>(null);
  const [animateRoll, setAnimateRoll] = useState(false);
  const [statOverwrites, setStatOverwrites] = useState<StatOverwriteData>(
    getInitialStatOverwrites,
  );

  // Tokens
  const [tokens, setTokens] = useState(initialTokens);

  // Per token configurations
  const [damageScaleOptions, setDamageScaleOptions] = useState<
    Map<string, number>
  >(new Map<string, number>());
  const [includedItems, setIncludedItems] = useState<Map<string, boolean>>(
    new Map<string, boolean>(),
  );

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
      setStampedRolls(await getRollsFromScene(sceneMetadata));
    }),
    [],
  );

  useEffect(() => {
    const newValue = stampedRoll[0]?.total;
    if (newValue !== undefined) setValue(newValue);
  }, [stampedRoll[0]?.total]);

  const getTable = (operation: Operation) => {
    switch (operation) {
      case "damage":
        return (
          <DamageTable
            tokens={tokens}
            value={value ? value : 0}
            damageScaleOptions={damageScaleOptions}
            setDamageScaleOptions={setDamageScaleOptions}
            includedItems={includedItems}
            setIncludedItems={setIncludedItems}
          ></DamageTable>
        );
      default:
        return (
          <SetValuesTable
            tokens={tokens}
            setTokens={setTokens}
            includedItems={includedItems}
            setIncludedItems={setIncludedItems}
          ></SetValuesTable>
        );
    }
  };

  const getCommandButton = (operation: Operation): JSX.Element => {
    switch (operation) {
      case "damage":
        return (
          <ActionButton
            label={"Apply Damage"}
            buttonProps={{
              onClick: () => {
                applyHealthDiffToItems(
                  value ? -1 * value : 0,
                  includedItems,
                  damageScaleOptions,
                  tokens,
                );
                setOperation("none");
              },
            }}
          ></ActionButton>
        );
      case "healing":
        return (
          <ActionButton
            label={"Apply Healing"}
            buttonProps={{
              onClick: () => {
                applyHealthDiffToItems(
                  value ? value : 0,
                  includedItems,
                  damageScaleOptions,
                  tokens,
                );
                setOperation("none");
              },
            }}
          ></ActionButton>
        );
      case "overwrite":
        return (
          <ActionButton
            label={"Overwrite"}
            buttonProps={{
              onClick: () => {
                overwriteStats(statOverwrites, includedItems, tokens);
                setStatOverwrites(getInitialStatOverwrites);
                setOperation("none");
              },
            }}
          ></ActionButton>
        );
      default:
        return <></>;
    }
  };

  return (
    <div className="h-[522px] overflow-clip">
      <div className="flex h-full flex-col justify-between bg-mirage-100 dark:bg-mirage-950 dark:text-mirage-200">
        <Header
          operation={operation}
          setOperation={setOperation}
          setStampedRolls={setStampedRolls}
          setAnimateRoll={setAnimateRoll}
        ></Header>
        {getTable(operation)}
        <Footer
          operation={operation}
          stampedRolls={stampedRoll}
          setStampedRolls={setStampedRolls}
          value={value}
          setValue={setValue}
          action={getCommandButton(operation)}
          animateRoll={animateRoll}
          setAnimateRoll={setAnimateRoll}
          statOverwrites={statOverwrites}
          setStatOverwrites={setStatOverwrites}
        ></Footer>
      </div>
    </div>
  );
}
