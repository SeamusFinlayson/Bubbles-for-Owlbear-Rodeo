import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { EditorMode, StampedDiceRoll } from "./types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateScaledHealthDiff } from "./healthCalculations";
import { useState } from "react";

export default function Footer({
  editorMode,
  stampedRolls,
  setStampedRolls,
  value,
  setValue,
  action,
}: {
  editorMode: EditorMode;
  stampedRolls: StampedDiceRoll[];
  setStampedRolls: React.Dispatch<React.SetStateAction<StampedDiceRoll[]>>;
  value: number | null;
  setValue: React.Dispatch<React.SetStateAction<number | null>>;
  action: JSX.Element;
}): JSX.Element {
  const [diceMenuOpen, setDiceMenuOpen] = useState(false);

  const items: JSX.Element[] = stampedRolls.map((stampedRoll) => {
    const rollString = stampedRoll.diceRoll.toString();
    return (
      <div
        key={stampedRoll.timeStamp}
        className="flex flex-col gap-2 rounded-lg border border-mirage-300 bg-mirage-100 p-2 shadow-sm dark:border-none dark:border-mirage-800 dark:bg-mirage-900"
      >
        <div className="">
          <div className="float-left mb-[2px] mr-2 flex items-center justify-center self-start rounded-md border border-mirage-300 bg-mirage-50 p-2 text-xl font-medium leading-none dark:border-mirage-800 dark:bg-mirage-950">
            {stampedRoll.diceRoll.total}
          </div>
          <div className="text-wrap break-all text-sm">
            {rollString.substring(0, rollString.indexOf(":") + 1)}
          </div>
          <div className="text-wrap break-all text-sm">
            {rollString.substring(
              rollString.indexOf(":") + 1,
              rollString.indexOf(" ="),
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={"outline"}
            className="grow"
            onClick={() => {
              const roll = new DiceRoll(
                rollString.substring(0, rollString.indexOf(":")),
              );
              setStampedRolls((rolls) => [
                { timeStamp: Date.now(), diceRoll: roll } as StampedDiceRoll,
                ...rolls,
              ]);
            }}
          >
            Roll Again
          </Button>
          <Button
            variant={"secondary"}
            className="grow"
            onClick={() => {
              setValue(stampedRoll.diceRoll.total);
              setDiceMenuOpen(false);
            }}
          >
            Use Result
          </Button>
        </div>
      </div>
    );
  });

  let valueDisplayString = "Make a roll";
  if (value !== null)
    switch (editorMode) {
      case "setValues":
        valueDisplayString = `Selected Roll Result`;
        break;
      case "damage":
        valueDisplayString = `Damage Result`;
        break;
      case "healing":
        valueDisplayString = `Healing Result`;
        break;
    }

  return (
    <div className="flex gap-4 px-4">
      <Popover open={diceMenuOpen} onOpenChange={setDiceMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant={"outline"}>Roll Log</Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <ScrollArea className="h-[420px] px-4">
            <div className="grid gap-4 py-4">
              <h4 className="font-medium leading-none">Roll History</h4>
              {stampedRolls.length > 0 ? (
                <div className="flex flex-col justify-start gap-2">{items}</div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Your past dice rolls will be available here.
                </p>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      <div className="flex h-9 self-start rounded-md border border-mirage-300 bg-mirage-100 text-sm font-medium leading-none dark:border-mirage-800 dark:bg-mirage-900">
        <div className="flex h-full min-w-12 items-center justify-center rounded-l-md border-r border-mirage-300 bg-mirage-50 p-2 px-4 text-lg dark:border-mirage-800 dark:bg-mirage-950">
          {value ? calculateScaledHealthDiff(3, value) : ""}
        </div>
        <div className="flex h-full items-center justify-center rounded-md p-2 px-4">
          {valueDisplayString}
        </div>
      </div>
      {action}
    </div>
  );
}
