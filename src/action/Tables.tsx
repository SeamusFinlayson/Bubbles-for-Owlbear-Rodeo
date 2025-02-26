import Token from "../metadataHelpers/TokenType";
import "../index.css";
import { Image } from "@owlbear-rodeo/sdk";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import {
  calculateNewHealth,
  calculateScaledHealthDiff,
} from "./healthCalculations";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DEFAULT_DAMAGE_SCALE,
  focusItem,
  getDamageScaleOption,
  getIncluded,
  handleTokenClicked,
} from "./helpers";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  getNewStatValue,
  InputName,
  isInputName,
  writeTokenValueToItem,
} from "@/statInputHelpers";
import StatStyledInput from "./StatStyledInput";
import { Action, BulkEditorState } from "./types";
import BookLock from "@/components/icons/BookLock";
import BookOpen from "@/components/icons/BookOpen";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToFirstScrollableAncestor } from "@dnd-kit/modifiers";

import { SmartMouseSensor } from "./SmartPointerSensor";
import { SortableTableRow } from "./SortableTableRow";

export function SceneTokensTable({
  appState,
  dispatch,
  tokens,
  setTokens,
  playerRole,
  playerSelection,
  handleDragEnd,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  playerRole: "PLAYER" | "GM";
  playerSelection: string[];
  handleDragEnd: (event: DragEndEvent) => void;
}): JSX.Element {
  const sensors = useSensors(
    useSensor(SmartMouseSensor, {
      activationConstraint: { distance: { y: 10 } },
    }),
  );

  return (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToFirstScrollableAncestor]}
      collisionDetection={closestCenter}
      onDragEnd={playerRole === "GM" ? handleDragEnd : () => {}}
    >
      <SortableContext
        items={playerRole === "GM" ? tokens.map((token) => token.item.id) : []}
        strategy={verticalListSortingStrategy}
      >
        <Table tabIndex={-1}>
          <TableHeader>
            <TableRow>
              {appState.operation !== "none" && (
                <CheckboxTableHead
                  included={allChecked(tokens, appState.includedItems)}
                  onCheckedChange={(checked) =>
                    dispatch({
                      type: "set-included-items",
                      includedItems: new Map(
                        tokens.map((token) => [token.item.id, checked]),
                      ),
                    })
                  }
                />
              )}
              <TableHead>Token</TableHead>
              {appState.operation === "none" && playerRole === "GM" && (
                <TableHead>Access</TableHead>
              )}
              {appState.operation !== "damage" && (
                <TableHead title="Hit Points / Maximum Hit Points, Temporary Hit Points">
                  Stats
                </TableHead>
              )}
              {appState.operation === "damage" && (
                <>
                  <TableHead>Multiplier</TableHead>
                  <TableHead>Damage</TableHead>
                  <TableHead>New Hit Points</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => {
              const included = getIncluded(
                token.item.id,
                appState.includedItems,
              );

              const option = getDamageScaleOption(
                token.item.id,
                appState.damageScaleOptions,
              );
              const scaledDamage = calculateScaledHealthDiff(
                included ? option : 0,
                appState.value ? appState.value : 0,
              );
              const [newHealth, newTempHealth] = calculateNewHealth(
                token.health,
                token.maxHealth,
                token.tempHealth,
                -1 * scaledDamage,
              );

              const nextDamageOption = () => {
                dispatch({
                  type: "set-damage-scale-options",
                  damageScaleOptions: new Map(appState.damageScaleOptions).set(
                    token.item.id,
                    option < multipliers.length - 1 ? option + 1 : option,
                  ),
                });
              };

              const resetDamageOption = () => {
                dispatch({
                  type: "set-damage-scale-options",
                  damageScaleOptions: new Map(appState.damageScaleOptions).set(
                    token.item.id,
                    DEFAULT_DAMAGE_SCALE,
                  ),
                });
              };

              const previousDamageOption = () => {
                dispatch({
                  type: "set-damage-scale-options",
                  damageScaleOptions: new Map(appState.damageScaleOptions).set(
                    token.item.id,
                    option > 1 ? option - 1 : option,
                  ),
                });
              };

              const handleKeyDown = (
                event: React.KeyboardEvent<HTMLTableRowElement>,
              ) => {
                switch (event.code) {
                  case "ArrowLeft":
                    previousDamageOption();
                    break;
                  case "ArrowRight":
                    nextDamageOption();
                    break;
                  case "KeyR":
                    resetDamageOption();
                    break;
                }
              };

              return (
                <SortableTableRow
                  key={token.item.id}
                  id={token.item.id}
                  onKeyDown={handleKeyDown}
                >
                  {appState.operation !== "none" && (
                    <CheckboxTableCell
                      included={included}
                      onCheckedChange={(checked) =>
                        dispatch({
                          type: "set-included-items",
                          includedItems: appState.includedItems.set(
                            token.item.id,
                            checked,
                          ),
                        })
                      }
                    />
                  )}
                  <TokenTableCell
                    token={token}
                    faded={!included && appState.operation !== "none"}
                    playerSelection={playerSelection}
                  />
                  {appState.operation === "none" && playerRole === "GM" && (
                    <AccessButton token={token} setTokens={setTokens} />
                  )}
                  {appState.operation !== "damage" && (
                    <TableCell>
                      <div className="grid min-w-[140px] grid-cols-2 justify-items-stretch gap-2 sm:min-w-[250px] sm:grid-cols-4">
                        <div className="col-span-2 flex items-center justify-between gap-1">
                          <StatInput
                            parentValue={token.health}
                            name={"health"}
                            updateHandler={(target) =>
                              handleStatUpdate(
                                token.item.id,
                                target,
                                token.health,
                                setTokens,
                              )
                            }
                          />
                          <div>{"/"}</div>
                          <StatInput
                            parentValue={token.maxHealth}
                            name={"maxHealth"}
                            updateHandler={(target) =>
                              handleStatUpdate(
                                token.item.id,
                                target,
                                token.maxHealth,
                                setTokens,
                              )
                            }
                          />
                        </div>
                        <StatInput
                          parentValue={token.tempHealth}
                          name={"tempHealth"}
                          updateHandler={(target) =>
                            handleStatUpdate(
                              token.item.id,
                              target,
                              token.tempHealth,
                              setTokens,
                            )
                          }
                        />
                        <StatInput
                          parentValue={token.armorClass}
                          name={"armorClass"}
                          updateHandler={(target) =>
                            handleStatUpdate(
                              token.item.id,
                              target,
                              token.armorClass,
                              setTokens,
                            )
                          }
                        />
                      </div>
                    </TableCell>
                  )}
                  {appState.operation === "damage" && (
                    <>
                      <TableCell>
                        <div className="flex max-w-32 gap-2">
                          <Button
                            className="size-8 min-w-8 rounded-full"
                            tabIndex={-1}
                            size={"icon"}
                            variant={"outline"}
                            onClick={(e) => {
                              previousDamageOption();
                              e.stopPropagation();
                            }}
                          >
                            <ArrowLeftIcon className="size-4" />
                          </Button>
                          <Button
                            className="flex h-8 w-10 items-center justify-center text-lg font-medium"
                            tabIndex={-1}
                            variant={"ghost"}
                            onClick={(e) => {
                              resetDamageOption();
                              e.stopPropagation();
                            }}
                          >
                            {multipliers[option]}
                          </Button>
                          <Button
                            className="size-8 min-w-8 rounded-full"
                            tabIndex={-1}
                            size={"icon"}
                            variant={"outline"}
                            onClick={(e) => {
                              nextDamageOption();
                              e.stopPropagation();
                            }}
                          >
                            <ArrowRightIcon className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell
                        className={cn({
                          "text-mirage-500 dark:text-mirage-400": !included,
                        })}
                      >
                        {scaledDamage}
                      </TableCell>
                      <TableCell
                        className={cn("md:min-w-16 lg:min-w-20", {
                          "text-mirage-500 dark:text-mirage-400": !included,
                        })}
                      >
                        {newHealth.toString() +
                          (newTempHealth > 0 ? ` (${newTempHealth})` : "")}
                      </TableCell>
                    </>
                  )}
                </SortableTableRow>
              );
            })}
          </TableBody>
        </Table>
      </SortableContext>
    </DndContext>
  );
}

function AccessButton({
  token,
  setTokens,
}: {
  token: Token;
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
}): JSX.Element {
  return (
    <TableCell className="py-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"ghost"}
            size={"icon"}
            name={
              token.hideStats
                ? "Make Stats Visible to Players"
                : "Hide Stats from players"
            }
            onClick={() =>
              handleHiddenUpdate(token.item.id, token.hideStats, setTokens)
            }
          >
            {token.hideStats ? (
              <div className="text-primary-500 dark:text-primary-dark">
                <BookLock />
              </div>
            ) : (
              <BookOpen />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          {token.hideStats ? "Dungeon Master Only" : "Player Editable"}
        </TooltipContent>
      </Tooltip>
    </TableCell>
  );
}

function TokenTableCell({
  token,
  faded,
  playerSelection,
}: {
  token: Token;
  faded: boolean;
  playerSelection: string[];
}): JSX.Element {
  const image = (
    <img
      className="min-h-8 min-w-8"
      src={(token.item as Image).image.url}
    ></img>
  );
  return (
    <TableCell>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <button
              className={cn(
                "size-12 font-medium outline-none sm:size-8",
                {
                  "opacity-60": faded,
                },
                {
                  "outline-image dark:outline-image": playerSelection.includes(
                    token.item.id,
                  ),
                },
              )}
              onClick={(e) =>
                handleTokenClicked(token.item.id, !(e.shiftKey || e.ctrlKey))
              }
              onDoubleClick={() => focusItem(token.item.id)}
              tabIndex={-1}
            >
              {image}
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">{token.item.name}</TooltipContent>
      </Tooltip>
    </TableCell>
  );
}

async function handleHiddenUpdate(
  itemId: string,
  previousValue: boolean,
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>,
) {
  const name: InputName = "hideStats";
  if (!isInputName(name)) throw "Error: invalid input name.";

  const value = !previousValue;

  setTokens((prevTokens) => {
    for (let i = 0; i < prevTokens.length; i++) {
      // console.log(prevTokens[i]);
      if (prevTokens[i].item.id === itemId)
        prevTokens[i] = { ...prevTokens[i], [name]: value } as Token;
    }
    return [...prevTokens];
  });
  writeTokenValueToItem(itemId, name, value);
}

function handleStatUpdate(
  itemId: string,
  target: HTMLInputElement,
  previousValue: number,
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>,
) {
  const name = target.name;
  if (!isInputName(name)) throw "Error: invalid input name.";

  const value = getNewStatValue(name, target.value, previousValue);

  setTokens((prevTokens) => {
    for (let i = 0; i < prevTokens.length; i++) {
      // console.log(prevTokens[i]);
      if (prevTokens[i].item.id === itemId)
        prevTokens[i] = { ...prevTokens[i], [name]: value } as Token;
    }
    return [...prevTokens];
  });
  writeTokenValueToItem(itemId, name, value);
}

function StatInput({
  parentValue,
  updateHandler,
  name,
}: {
  parentValue: number;
  updateHandler: (target: HTMLInputElement) => void;
  name: InputName;
}): JSX.Element {
  const [value, setValue] = useState<string>(parentValue.toString());
  let ignoreBlur = false;

  // Update value when the tracker value changes in parent
  const [valueInputUpdateFlag, setValueInputUpdateFlag] = useState(false);
  if (valueInputUpdateFlag) {
    setValue(parentValue.toString());
    setValueInputUpdateFlag(false);
  }
  useEffect(() => setValueInputUpdateFlag(true), [parentValue]);

  // Update tracker in parent element
  const runUpdateHandler = (
    e:
      | React.FocusEvent<HTMLInputElement, Element>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    updateHandler(e.target as HTMLInputElement);
    setValueInputUpdateFlag(true);
  };

  // Select text on focus
  const selectText = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    event.target.select();
  };

  return (
    <StatStyledInput
      name={name}
      inputProps={{
        className: "w-full",
        value: value,
        onChange: (e) => setValue(e.target.value),
        onBlur: (e) => {
          if (!ignoreBlur) runUpdateHandler(e);
        },
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          } else if (e.key === "Escape") {
            ignoreBlur = true;
            (e.target as HTMLInputElement).blur();
            ignoreBlur = false;
            setValue(parentValue.toString());
          }
        },
        onFocus: selectText,
        onClick: (e) => e.stopPropagation(),
      }}
    ></StatStyledInput>
  );
}

function CheckboxTableHead({
  included,
  onCheckedChange,
}: {
  included: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
}): JSX.Element {
  return (
    <TableCell>
      <Checkbox
        checked={included}
        onCheckedChange={(checked) => {
          if (typeof checked === "boolean") onCheckedChange(checked);
        }}
      />
    </TableCell>
  );
}

function CheckboxTableCell({
  included,
  onCheckedChange,
}: {
  included: boolean;
  onCheckedChange: (checked: boolean) => void;
}): JSX.Element {
  return (
    <TableCell>
      <Checkbox
        checked={included}
        onCheckedChange={(checked) => {
          if (typeof checked === "boolean") onCheckedChange(checked);
        }}
      />
    </TableCell>
  );
}

const multipliers = [
  String.fromCharCode(0x2573),
  String.fromCharCode(0xd7) + String.fromCharCode(0xbc),
  String.fromCharCode(0xd7) + String.fromCharCode(0xbd),
  String.fromCharCode(0xd7) + 1,
  String.fromCharCode(0xd7) + 2,
];

const allChecked = (
  tokens: Token[],
  map: Map<string, boolean>,
): boolean | "indeterminate" => {
  let allChecked = true;
  let noneChecked = true;
  for (const token of tokens) {
    const included = getIncluded(token.item.id, map);
    if (included === false) allChecked = false;
    if (included === true) noneChecked = false;
  }
  if (allChecked) return true;
  if (noneChecked) return false;
  return "indeterminate";
};
