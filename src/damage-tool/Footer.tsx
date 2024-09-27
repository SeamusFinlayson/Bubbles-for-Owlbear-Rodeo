import { Action, BulkEditorState, Operation } from "./types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateScaledHealthDiff } from "./healthCalculations";
import { useState } from "react";
import DiceSVG from "./DiceSVG";
import StatStyledInput from "./StatStyledInput";
import ActionButton from "./ActionButton";
import { applyHealthDiffToItems, overwriteStats } from "./helpers";
import Token from "@/TokenClass";

export default function Footer({
  appState,
  dispatch,
  tokens,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
}): JSX.Element {
  const [diceMenuOpen, setDiceMenuOpen] = useState(false);

  const getOperationButton = (operation: Operation): JSX.Element => {
    switch (operation) {
      case "damage":
        return (
          <ActionButton
            label={"Apply Damage"}
            buttonProps={{
              onClick: () => {
                applyHealthDiffToItems(
                  appState.value ? -1 * appState.value : 0,
                  appState.includedItems,
                  appState.damageScaleOptions,
                  tokens,
                );
                dispatch({ type: "set-operation", operation: "none" });
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
                  appState.value ? appState.value : 0,
                  appState.includedItems,
                  appState.damageScaleOptions,
                  tokens,
                );
                dispatch({ type: "set-operation", operation: "none" });
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
                overwriteStats(
                  appState.statOverwrites,
                  appState.includedItems,
                  tokens,
                );
                dispatch({ type: "clear-stat-overwrites" });
                dispatch({ type: "set-operation", operation: "none" });
              },
            }}
          ></ActionButton>
        );
      default:
        return <></>;
    }
  };

  const items: JSX.Element[] = appState.rolls.map((stampedRoll) => {
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
              dispatch({
                type: "add-roll",
                diceExpression: diceExpression,
                dispatch: dispatch,
              });
              setDiceMenuOpen(false);
            }}
          >
            Roll Again
          </Button>
          <Button
            variant={"secondary"}
            className="shrink grow"
            onClick={() => {
              dispatch({ type: "set-value", value: stampedRoll.total });
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
  if (appState.value !== null)
    switch (appState.operation) {
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
      {(appState.operation === "none" ||
        appState.operation === "damage" ||
        appState.operation === "healing") && (
        <div className="flex flex-wrap gap-4 p-2 px-4 dark:bg-mirage-900">
          <Popover open={diceMenuOpen} onOpenChange={setDiceMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant={"outline"}>Roll Log</Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0" align="start">
              <ScrollArea className="h-[420px] px-4">
                <div className="flex flex-col gap-4 py-4">
                  <h4 className="font-medium leading-none">Roll History</h4>
                  {appState.rolls.length > 0 ? (
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
              {appState.animateRoll && (
                <div className={"absolute animate-inverse-bounce"}>
                  <DiceSVG />
                </div>
              )}
              {!appState.animateRoll && (
                <div>
                  {appState.value
                    ? calculateScaledHealthDiff(3, appState.value)
                    : ""}
                </div>
              )}
            </div>
            <div className="flex h-full items-center justify-center rounded-md p-2 px-4">
              {valueDisplayString}
            </div>
          </div>
          {getOperationButton(appState.operation)}
        </div>
      )}
      {appState.operation === "overwrite" && (
        <>
          <div className="flex items-center gap-2 border-t border-mirage-300 p-2 px-4 dark:border-mirage-800">
            <StatStyledInput
              name="health"
              inputProps={{
                value: appState.statOverwrites.hitPoints,
                onChange: (e) =>
                  dispatch({
                    type: "set-hit-points-overwrite",
                    hitPointsOverwrite: e.target.value,
                  }),
                onBlur: (e) =>
                  dispatch({
                    type: "set-hit-points-overwrite",
                    hitPointsOverwrite: toValidIntString(e.target.value),
                  }),
                className: "w-24 h-[36px]",
                placeholder: "unchanged",
              }}
            />
            <StatStyledInput
              name="maxHealth"
              inputProps={{
                value: appState.statOverwrites.maxHitPoints,
                onChange: (e) =>
                  dispatch({
                    type: "set-max-hit-points-overwrite",
                    maxHitPointsOverwrite: e.target.value,
                  }),
                onBlur: (e) =>
                  dispatch({
                    type: "set-max-hit-points-overwrite",
                    maxHitPointsOverwrite: toValidIntString(e.target.value),
                  }),
                className: "w-24 h-[36px]",
                placeholder: "unchanged",
              }}
            />
            <StatStyledInput
              name="tempHealth"
              inputProps={{
                value: appState.statOverwrites.tempHitPoints,
                onChange: (e) =>
                  dispatch({
                    type: "set-temp-hit-points-overwrite",
                    tempHitPointsOverwrite: e.target.value,
                  }),
                onBlur: (e) =>
                  dispatch({
                    type: "set-temp-hit-points-overwrite",
                    tempHitPointsOverwrite: toValidIntString(e.target.value),
                  }),
                className: "w-24 h-[36px]",
                placeholder: "unchanged",
              }}
            />
            <StatStyledInput
              name="armorClass"
              inputProps={{
                value: appState.statOverwrites.armorClass,
                onChange: (e) =>
                  dispatch({
                    type: "set-armor-class-overwrite",
                    armorClassOverwrite: e.target.value,
                  }),
                onBlur: (e) =>
                  dispatch({
                    type: "set-armor-class-overwrite",
                    armorClassOverwrite: toValidIntString(e.target.value),
                  }),
                className: "w-24 h-[36px]",
                placeholder: "unchanged",
              }}
            />
            {getOperationButton(appState.operation)}
          </div>
        </>
      )}
    </>
  );
}

const toValidIntString = (value: string): string => {
  const valueNum = Math.trunc(parseFloat(value));
  if (Number.isNaN(valueNum)) return "";
  return valueNum.toString();
};
