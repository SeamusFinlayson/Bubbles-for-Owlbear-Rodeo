import { Operation, StampedDiceRoll, StatOverwriteData } from "./types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateScaledHealthDiff } from "./healthCalculations";
import { useState } from "react";
import { addNewRollToRolls } from "./helpers";
import DiceSVG from "./DiceSVG";
import StatStyledInput from "./StatStyledInput";

export default function Footer({
  operation,
  stampedRolls,
  setStampedRolls,
  value,
  setValue,
  action,
  animateRoll,
  setAnimateRoll,
  statOverwrites,
  setStatOverwrites,
}: {
  operation: Operation;
  stampedRolls: StampedDiceRoll[];
  setStampedRolls: React.Dispatch<React.SetStateAction<StampedDiceRoll[]>>;
  value: number | null;
  setValue: React.Dispatch<React.SetStateAction<number | null>>;
  action: JSX.Element;
  animateRoll: boolean;
  setAnimateRoll: React.Dispatch<React.SetStateAction<boolean>>;
  statOverwrites: StatOverwriteData;
  setStatOverwrites: React.Dispatch<React.SetStateAction<StatOverwriteData>>;
}): JSX.Element {
  const [diceMenuOpen, setDiceMenuOpen] = useState(false);

  const items: JSX.Element[] = stampedRolls.map((stampedRoll) => {
    const rollString = stampedRoll.roll;
    return (
      <div
        key={stampedRoll.timeStamp}
        className="flex w-full flex-col gap-2 rounded-lg border border-mirage-300 bg-mirage-100 p-2 shadow-sm dark:border-none dark:border-mirage-800 dark:bg-mirage-900"
      >
        <div className="">
          <div className="float-left mb-[2px] mr-2 flex items-center justify-center self-start rounded-md border border-mirage-300 bg-mirage-50 p-2 text-xl font-medium leading-none dark:border-mirage-800 dark:bg-mirage-950">
            {stampedRoll.total}
          </div>
          <div className="text-wrap break-all text-sm">
            {rollString.substring(0, rollString.indexOf(":"))}
          </div>
          <div className="text-wrap break-all text-sm">
            {rollString.substring(
              rollString.indexOf(":") + 1,
              rollString.indexOf(" ="),
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={"outline"}
            className="shrink grow"
            onClick={() => {
              const diceExpression = rollString.substring(
                0,
                rollString.indexOf(":"),
              );
              setStampedRolls((prevRolls) =>
                addNewRollToRolls(prevRolls, diceExpression, setAnimateRoll),
              );
              setDiceMenuOpen(false);
            }}
          >
            Roll Again
          </Button>
          <Button
            variant={"secondary"}
            className="shrink grow"
            onClick={() => {
              setValue(stampedRoll.total);
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
    switch (operation) {
      case "none":
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
    <>
      {(operation === "none" ||
        operation === "damage" ||
        operation === "healing") && (
        <div className="flex flex-wrap gap-4 bg-mirage-900 p-2 px-4">
          <Popover open={diceMenuOpen} onOpenChange={setDiceMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant={"outline"}>Roll Log</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <ScrollArea className="h-[420px] px-4">
                <div className="flex flex-col gap-4 py-4">
                  <h4 className="font-medium leading-none">Roll History</h4>
                  {stampedRolls.length > 0 ? (
                    <div className="flex flex-col justify-start gap-2">
                      {items}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Your last 20 dice rolls, made in this scene, will be
                      available here.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          <div className="flex h-9 self-start rounded-md border border-mirage-300 bg-mirage-100 text-sm font-medium leading-none dark:border-mirage-800 dark:bg-mirage-900">
            <div className="flex h-full w-10 min-w-12 items-center justify-center rounded-l-md border-r border-mirage-300 bg-mirage-50 p-2 px-4 text-lg dark:border-mirage-800 dark:bg-mirage-950">
              {animateRoll && (
                <div className={"absolute animate-inverse-bounce"}>
                  <DiceSVG />
                </div>
              )}
              {!animateRoll && (
                <div>{value ? calculateScaledHealthDiff(3, value) : ""}</div>
              )}
            </div>
            <div className="flex h-full items-center justify-center rounded-md p-2 px-4">
              {valueDisplayString}
            </div>
          </div>
          {action}
        </div>
      )}
      {operation === "overwrite" && (
        <>
          <div className="flex items-center gap-2 border-t border-mirage-300 bg-mirage-950 p-2 px-4 dark:border-mirage-800">
            <StatStyledInput
              name="health"
              inputProps={{
                value: statOverwrites.hitPoints,
                onChange: (e) =>
                  setStatOverwrites((prev) => {
                    return { ...prev, hitPoints: e.target.value };
                  }),
                onBlur: (e) =>
                  setStatOverwrites((prev) => {
                    return {
                      ...prev,
                      hitPoints: makeStringValid(e.target.value),
                    };
                  }),
                className: "w-24 h-[36px]",
                placeholder: "unchanged",
              }}
            />
            <StatStyledInput
              name="maxHealth"
              inputProps={{
                value: statOverwrites.maxHitPoints,
                onChange: (e) =>
                  setStatOverwrites((prev) => {
                    return { ...prev, maxHitPoints: e.target.value };
                  }),
                onBlur: (e) =>
                  setStatOverwrites((prev) => {
                    return {
                      ...prev,
                      maxHitPoints: makeStringValid(e.target.value),
                    };
                  }),
                className: "w-24 h-[36px]",
                placeholder: "unchanged",
              }}
            />
            <StatStyledInput
              name="tempHealth"
              inputProps={{
                value: statOverwrites.tempHitPoints,
                onChange: (e) =>
                  setStatOverwrites((prev) => {
                    return { ...prev, tempHitPoints: e.target.value };
                  }),
                onBlur: (e) =>
                  setStatOverwrites((prev) => {
                    return {
                      ...prev,
                      tempHitPoints: makeStringValid(e.target.value),
                    };
                  }),
                className: "w-24 h-[36px]",
                placeholder: "unchanged",
              }}
            />
            <StatStyledInput
              name="armorClass"
              inputProps={{
                value: statOverwrites.armorClass,
                onChange: (e) =>
                  setStatOverwrites((prev) => {
                    return { ...prev, armorClass: e.target.value };
                  }),
                onBlur: (e) =>
                  setStatOverwrites((prev) => {
                    return {
                      ...prev,
                      armorClass: makeStringValid(e.target.value),
                    };
                  }),
                className: "w-24 h-[36px]",
                placeholder: "unchanged",
              }}
            />
            {action}
          </div>
        </>
      )}
    </>
  );
}

const makeStringValid = (value: string): string => {
  const valueNum = Math.trunc(parseFloat(value));
  if (Number.isNaN(valueNum)) return "";
  return valueNum.toString();
};
