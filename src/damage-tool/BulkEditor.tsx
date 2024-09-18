import Token from "../TokenClass";
import "../index.css";
import { useEffect, useState } from "react";
import { EditorMode, StampedDiceRoll } from "./types";
import Footer from "./Footer";
import Header from "./Header";
import { DamageTable, SetValuesTable } from "./Tables";
import { Button } from "@/components/ui/button";
import { writeUpdatedValuesToTokens } from "./helpers";

export default function BulkEditor({
  initialTokens,
}: {
  initialTokens: Token[];
}): JSX.Element {
  let darkMode = true;
  useEffect(() => {
    if (darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [darkMode]);

  const [editorMode, setEditorMode] = useState<EditorMode>("setValues");
  const [stampedRoll, setStampedRolls] = useState<StampedDiceRoll[]>([]);
  const [value, setValue] = useState<number | null>(null);

  const [damageScaleOptions, setDamageScaleOptions] = useState<
    Map<string, number>
  >(() => {
    return new Map<string, number>(
      initialTokens.map((token) => [token.item.id, 3]),
    );
  });
  const [includedItems, setIncludedItems] = useState<Map<string, boolean>>(
    () => {
      return new Map<string, boolean>(
        initialTokens.map((token) => [token.item.id, true]),
      );
    },
  );

  useEffect(() => {
    const newValue = stampedRoll[0]?.diceRoll.total;
    if (newValue !== undefined) setValue(newValue);
  }, [stampedRoll[0]?.diceRoll.total]);

  const getTable = (editorMode: EditorMode) => {
    switch (editorMode) {
      case "damage":
        return (
          <DamageTable
            tokens={initialTokens}
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
            tokens={initialTokens}
            includedItems={includedItems}
            setIncludedItems={setIncludedItems}
          ></SetValuesTable>
        );
    }
  };

  const getButtonText = (editorMode: EditorMode): string => {
    switch (editorMode) {
      case "damage":
        return "Apply Damage";
      case "healing":
        return "Apply Healing";
      default:
        return "Invalid";
    }
  };

  return (
    <div className="h-[522px] overflow-clip">
      <div className="flex h-full flex-col justify-between gap-2 bg-mirage-100 py-4 dark:bg-mirage-900 dark:text-mirage-200">
        <Header
          editorMode={editorMode}
          setEditorMode={setEditorMode}
          setStampedRolls={setStampedRolls}
        ></Header>
        {getTable(editorMode)}
        <Footer
          editorMode={editorMode}
          stampedRolls={stampedRoll}
          setStampedRolls={setStampedRolls}
          value={value}
          setValue={setValue}
          action={
            editorMode !== "setValues" ? (
              <Button
                className="ml-auto"
                variant={"secondary"}
                onClick={() => {
                  switch (editorMode) {
                    case "damage":
                      writeUpdatedValuesToTokens(
                        value ? -1 * value : 0,
                        includedItems,
                        damageScaleOptions,
                        initialTokens,
                      );
                  }
                  setEditorMode("setValues");
                }}
              >
                {getButtonText(editorMode)}
              </Button>
            ) : (
              <></>
            )
          }
        ></Footer>
      </div>
    </div>
  );
}
