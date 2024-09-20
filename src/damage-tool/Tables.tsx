import Token from "../TokenClass";
import "../index.css";
import { Image } from "@owlbear-rodeo/sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import {
  calculateNewHealth,
  calculateScaledHealthDiff,
} from "./healthCalculations";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DEFAULT_DAMAGE_SCALE,
  getDamageScaleOption,
  getIncluded,
} from "./helpers";
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, useEffect, useState } from "react";
import {
  getNewStatValue,
  InputName,
  isInputName,
  writeTokenValueToItem,
} from "@/statInputHelpers";

export function SetValuesTable({
  tokens,
  setTokens,
  includedItems,
  setIncludedItems,
}: {
  tokens: Token[];
  setTokens: React.Dispatch<React.SetStateAction<Token[]>>;
  includedItems: Map<string, boolean>;
  setIncludedItems: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
}): JSX.Element {
  return (
    <ScrollArea className="grow pl-4 pr-4 dark:bg-mirage-950">
      <Table>
        <TableHeader>
          <TableRow>
            <CheckboxTableHead
              tokens={tokens}
              included={allChecked(tokens, includedItems)}
              setIncludedItems={setIncludedItems}
            />
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead title="Hit Points / Maximum Hit Points, Temporary Hit Points">
              Hit Points
            </TableHead>
            <TableHead>Armor Class</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => {
            const included = getIncluded(token.item.id, includedItems);

            return (
              <TableRow key={token.item.id}>
                <CheckboxTableCell
                  token={token}
                  included={included}
                  setIncludedItems={setIncludedItems}
                />
                <TokenImageTableCell token={token} fade={!included} />
                <TokenNameTableCell token={token} fade={!included} />
                <TableCell>
                  <div className="flex items-center gap-2">
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
                    ></StatInput>
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
                    ></StatInput>
                    <div>{""}</div>
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
                    ></StatInput>
                  </div>
                </TableCell>
                <TableCell>
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
                  ></StatInput>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" forceMount />
    </ScrollArea>
  );
}

export function DamageTable({
  tokens,
  value,
  includedItems,
  setIncludedItems,
  damageScaleOptions,
  setDamageScaleOptions,
}: {
  tokens: Token[];
  value: number;
  includedItems: Map<string, boolean>;
  setIncludedItems: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
  damageScaleOptions: Map<string, number>;
  setDamageScaleOptions: React.Dispatch<
    React.SetStateAction<Map<string, number>>
  >;
}): JSX.Element {
  return (
    <ScrollArea className="grow pl-4 pr-4 dark:bg-mirage-950">
      <Table>
        <TableHeader>
          <TableRow>
            <CheckboxTableHead
              tokens={tokens}
              included={allChecked(tokens, includedItems)}
              setIncludedItems={setIncludedItems}
            />
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Multiplier</TableHead>
            <TableHead>Damage</TableHead>
            <TableHead>New Hit Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => {
            const included = getIncluded(token.item.id, includedItems);
            const option = getDamageScaleOption(
              token.item.id,
              damageScaleOptions,
            );
            const scaledDamage = calculateScaledHealthDiff(
              included ? option : 0,
              value,
            );
            const [newHealth, newTempHealth] = calculateNewHealth(
              token.health,
              token.maxHealth,
              token.tempHealth,
              -1 * scaledDamage,
            );

            const nextDamageOption = () => {
              setDamageScaleOptions((prev) =>
                new Map(prev).set(
                  token.item.id,
                  option < multipliers.length - 1 ? option + 1 : option,
                ),
              );
            };

            const resetDamageOption = () => {
              setDamageScaleOptions((prev) =>
                new Map(prev).set(token.item.id, DEFAULT_DAMAGE_SCALE),
              );
            };

            const previousDamageOption = () => {
              setDamageScaleOptions((prev) =>
                new Map(prev).set(
                  token.item.id,
                  option > 1 ? option - 1 : option,
                ),
              );
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
              }
            };

            return (
              <TableRow
                key={token.item.id}
                onKeyDown={(event) => handleKeyDown(event)}
              >
                <CheckboxTableCell
                  token={token}
                  included={included}
                  setIncludedItems={setIncludedItems}
                />
                <TokenImageTableCell token={token} fade={!included} />
                <TokenNameTableCell token={token} fade={!included} />
                <TableCell>
                  <div className="flex max-w-32 gap-2">
                    <Button
                      className="size-8 min-w-8 rounded-full"
                      tabIndex={-1}
                      size={"icon"}
                      variant={"outline"}
                      onClick={previousDamageOption}
                    >
                      <ArrowLeftIcon className="size-4" />
                    </Button>
                    {/* <div
                      className={cn(
                        "flex w-14 items-center justify-center text-lg font-medium",
                        {
                          "text-mirage-500 dark:text-mirage-400": !included,
                        },
                      )}
                    >
                      {multipliers[option]}
                    </div> */}
                    <Button
                      className="flex h-8 w-10 items-center justify-center text-lg font-medium"
                      tabIndex={-1}
                      variant={"ghost"}
                      onClick={resetDamageOption}
                    >
                      {multipliers[option]}
                    </Button>
                    <Button
                      className="size-8 min-w-8 rounded-full"
                      tabIndex={-1}
                      size={"icon"}
                      variant={"outline"}
                      onClick={nextDamageOption}
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" forceMount />
    </ScrollArea>
  );
}

function TokenImageTableCell({
  token,
  fade,
}: {
  token: Token;
  fade: boolean;
}): JSX.Element {
  return (
    <TableCell className={cn("font-medium", { "opacity-60": fade })}>
      <img
        className="size-8 min-h-8 min-w-8"
        src={(token.item as Image).image.url}
      ></img>
    </TableCell>
  );
}

function TokenNameTableCell({
  token,
  fade,
}: {
  token: Token;
  fade: boolean;
}): JSX.Element {
  return (
    <TableCell
      className={cn("max-w-28 text-sm font-medium", {
        "text-mirage-500 dark:text-mirage-400": fade,
      })}
    >
      <div className="group">
        <div
          className="overflow-hidden text-clip text-nowrap"
          title={token.item.name}
        >
          {token.item.name}
        </div>
      </div>
    </TableCell>
  );
}

async function handleStatUpdate(
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
  inputProps,
}: {
  parentValue: number;
  updateHandler: (target: HTMLInputElement) => Promise<void>;
  name: InputName;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
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
    updateHandler(e.target as HTMLInputElement).then(() =>
      setValueInputUpdateFlag(true),
    );
  };

  // Select text on focus
  const selectText = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    event.target.select();
  };

  return (
    <div className="flex items-center">
      <Input
        {...inputProps}
        className="h-[32px] w-[60px] md:w-[65px] lg:w-[70px]"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={(e) => {
          if (!ignoreBlur) runUpdateHandler(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          } else if (e.key === "Escape") {
            ignoreBlur = true;
            (e.target as HTMLInputElement).blur();
            ignoreBlur = false;
            setValue(parentValue.toString());
          }
        }}
        onFocus={selectText}
      ></Input>
    </div>
  );
}

function CheckboxTableHead({
  tokens,
  included,
  setIncludedItems,
}: {
  tokens: Token[];
  included: boolean | "indeterminate";
  setIncludedItems: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
}): JSX.Element {
  return (
    <TableCell>
      <Checkbox
        checked={included}
        onCheckedChange={(checked) => {
          if (typeof checked === "boolean")
            setIncludedItems(
              () => new Map(tokens.map((token) => [token.item.id, checked])),
            );
        }}
      />
    </TableCell>
  );
}

function CheckboxTableCell({
  token,
  included,
  setIncludedItems,
}: {
  token: Token;
  included: boolean;
  setIncludedItems: React.Dispatch<React.SetStateAction<Map<string, boolean>>>;
}): JSX.Element {
  return (
    <TableCell>
      <Checkbox
        checked={included}
        onCheckedChange={(checked) => {
          if (typeof checked === "boolean")
            setIncludedItems((prev) =>
              new Map(prev).set(token.item.id, checked),
            );
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
