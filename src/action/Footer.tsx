import { Action, BulkEditorState, Operation } from "./types";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { calculateScaledHealthDiff } from "./healthCalculations";
import { useEffect, useState } from "react";
import DiceSVG from "./DiceSVG";
import StatStyledInput from "./StatStyledInput";
import ActionButton from "./ActionButton";
import { applyHealthDiffToItems, overwriteStats } from "./helpers";
import Token from "@/metadataHelpers/TokenType";
import { Separator } from "@/components/ui/separator";
import OBR from "@owlbear-rodeo/sdk";
import { Check } from "@/components/icons/Check";
import { Dices } from "@/components/icons/Dices";
import { Equal } from "@/components/icons/Equal";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Footer({
  appState,
  dispatch,
  tokens,
  playerRole,
  playerName,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
  playerRole: "PLAYER" | "GM";
  playerName: string;
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

  const rolls: JSX.Element[] = appState.rolls
    .filter((roll) => {
      if (roll.visibility === "PUBLIC") return true;
      if (roll.visibility === "GM" && playerRole === "GM") return true;
      if (roll.visibility === "PRIVATE" && OBR.player.id === roll.playerId)
        return true;
      return false;
    })
    .map((roll) => {
      const rollString = roll.roll;
      const diceExpression = rollString.substring(0, rollString.indexOf(":"));
      const dieResults = rollString.substring(
        rollString.indexOf(":") + 1,
        rollString.indexOf(" ="),
      );
      const titleString = `${roll.playerName} rolled `;

      return (
        <div
          key={roll.timeStamp}
          className="flex w-full flex-col gap-2 overflow-clip rounded-lg border border-mirage-300 bg-mirage-100 p-2 text-sm shadow-sm dark:border-none dark:bg-mirage-900"
        >
          <div className="">
            {roll.visibility === "GM" && (
              <div className="float-end pr-0.5">GM</div>
            )}
            {roll.visibility === "PRIVATE" && (
              <div className="float-end pr-0.5">Private</div>
            )}
            <p className="flex flex-wrap items-center gap-x-1">
              <span className="text-mirage-500 dark:text-mirage-400">
                {titleString}
              </span>
              <span>{`${diceExpression}`}</span>
            </p>
          </div>
          <Separator />
          <div className="flex w-full justify-center text-mirage-500 dark:text-mirage-400">{` ${dieResults}`}</div>
          <div className="flex w-full justify-between gap-2">
            <div className="flex w-full rounded-md border border-mirage-300 bg-slate-50 px-2 font-light dark:border-none dark:bg-mirage-950">
              <span className="ml-auto flex items-center justify-center text-2xl text-mirage-500 dark:text-mirage-400">
                <Equal />
              </span>
              <span className="ml-auto flex grow items-center justify-center text-lg">
                {`${roll.total}`}
              </span>
            </div>
            <Tooltip defaultOpen={false}>
              <TooltipTrigger asChild>
                <Button
                  variant={"outline"}
                  size={"icon"}
                  className="shrink-0"
                  onClick={() => {
                    const diceExpression = rollString.substring(
                      0,
                      rollString.indexOf(":"),
                    );
                    dispatch(
                      roll.visibility === "PRIVATE"
                        ? {
                            type: "add-roll",
                            diceExpression: diceExpression,
                            playerName: playerName,
                            visibility: roll.visibility,
                            dispatch: dispatch,
                            playerId: roll.playerId,
                          }
                        : {
                            type: "add-roll",
                            diceExpression: diceExpression,
                            playerName: playerName,
                            visibility: roll.visibility,
                            dispatch: dispatch,
                          },
                    );
                    setDiceMenuOpen(false);
                  }}
                >
                  <Dices />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Roll Again</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={"secondary"}
                  size={"icon"}
                  className="shrink-0"
                  onClick={() => {
                    dispatch({ type: "set-value", value: roll.total });
                    setDiceMenuOpen(false);
                  }}
                >
                  <Check />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Use Roll</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      );
    });

  let valueDisplayString = "Make a roll";
  if (appState.value !== null)
    switch (appState.operation) {
      case "none":
      case "overwrite":
        valueDisplayString = `Roll Result`;
        break;
      case "damage":
        valueDisplayString = `Damage Result`;
        break;
      case "healing":
        valueDisplayString = `Healing Result`;
        break;
    }

  const POPOVER_TOP_MARGIN = 60;
  const [popoverHeight, setPopoverHeight] = useState(
    window.innerHeight - POPOVER_TOP_MARGIN,
  );
  useEffect(() => {
    const handler = () =>
      setPopoverHeight(window.innerHeight - POPOVER_TOP_MARGIN);
    window.addEventListener("resize", handler);
    return window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="space-y-2 p-2 px-4">
      {appState.operation === "overwrite" && (
        <div className="grid grid-cols-2 items-center justify-items-stretch gap-2 border-mirage-300 dark:border-mirage-800 sm:grid-cols-4">
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
              className: "min-w-[90px] w-full h-[36px]",
              placeholder: "Unchanged",
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
              className: "min-w-[90px] w-full h-[36px]",
              placeholder: "Unchanged",
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
              className: "min-w-[90px] w-full h-[36px]",
              placeholder: "Unchanged",
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
              className: "min-w-[90px] w-full h-[36px]",
              placeholder: "Unchanged",
            }}
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Popover open={diceMenuOpen} onOpenChange={setDiceMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant={"outline"}>Roll Log</Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-72 p-0"
            align="start"
            style={{ height: popoverHeight }}
          >
            <ScrollArea className="h-full px-4">
              <div className="flex flex-col gap-2 py-3">
                <button className="absolute size-0" name="root, does nothing" />
                <h4 className="font-medium">Scene Roll Log</h4>
                <Separator />
                {appState.rolls.length > 0 ? (
                  <div className="flex flex-col justify-start gap-2">
                    {rolls}
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
        <div className="flex h-9 self-start rounded-md border border-mirage-300 text-sm font-medium dark:border-mirage-800">
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
        {appState.operation !== "none" && (
          <div className="ml-auto w-full md:w-fit">
            {getOperationButton(appState.operation)}
          </div>
        )}
      </div>
    </div>
  );
}

const toValidIntString = (value: string): string => {
  const valueNum = Math.trunc(parseFloat(value));
  if (Number.isNaN(valueNum)) return "";
  return valueNum.toString();
};
