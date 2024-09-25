import Token from "../TokenClass";
import "../index.css";
import { useEffect, useState } from "react";
import { EditorMode, StampedDiceRoll } from "./types";
import Footer from "./Footer";
import Header from "./Header";
import { DamageTable, SetValuesTable } from "./Tables";
import { Button } from "@/components/ui/button";
import { applyHealthDiffToItems, getRollsFromScene } from "./helpers";
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
  const [editorMode, setEditorMode] = useState<EditorMode>("setValues");
  const [stampedRoll, setStampedRolls] =
    useState<StampedDiceRoll[]>(initialRolls);
  const [value, setValue] = useState<number | null>(null);
  const [animateRoll, setAnimateRoll] = useState(false);

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

  const getTable = (editorMode: EditorMode) => {
    switch (editorMode) {
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

  const getActionButton = (editorMode: EditorMode): JSX.Element => {
    switch (editorMode) {
      case "damage":
        return (
          <ActionButton
            label={"Apply Damage"}
            onClick={() => {
              applyHealthDiffToItems(
                value ? -1 * value : 0,
                includedItems,
                damageScaleOptions,
                tokens,
              );
              setEditorMode("setValues");
            }}
          ></ActionButton>
        );
      case "healing":
        return (
          <ActionButton
            label={"Apply Healing"}
            onClick={() => {
              applyHealthDiffToItems(
                value ? value : 0,
                includedItems,
                damageScaleOptions,
                tokens,
              );
              setEditorMode("setValues");
            }}
          ></ActionButton>
        );
      default:
        return <></>;
    }
  };

  return (
    <div className="h-[522px] overflow-clip">
      <div className="flex h-full flex-col justify-between gap-2 bg-mirage-100 py-4 dark:bg-mirage-900 dark:text-mirage-200">
        <Header
          editorMode={editorMode}
          setEditorMode={setEditorMode}
          setStampedRolls={setStampedRolls}
          setAnimateRoll={setAnimateRoll}
        ></Header>
        {getTable(editorMode)}
        <Footer
          editorMode={editorMode}
          stampedRolls={stampedRoll}
          setStampedRolls={setStampedRolls}
          value={value}
          setValue={setValue}
          action={getActionButton(editorMode)}
          animateRoll={animateRoll}
          setAnimateRoll={setAnimateRoll}
        ></Footer>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement> | undefined;
}): JSX.Element {
  return (
    <Button className="ml-auto" variant={"secondary"} onClick={onClick}>
      {label}
    </Button>
  );
}
