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
import { getDamageScaleOption, getIncluded } from "./helpers";

export function SetValuesTable({
  tokens,
  includedItems,
  setIncludedItems,
}: {
  tokens: Token[];
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
              included={allChecked(includedItems)}
              setIncludedItems={setIncludedItems}
            />
            <TableHead>Icon</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Hit Points</TableHead>
            <TableHead>Temporary Hit Points</TableHead>
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
                <TokenImageTableCell token={token} />
                <TokenNameTableCell token={token} />
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatInput defaultValue={token.health}></StatInput>
                    <div>{"/"}</div>
                    <StatInput defaultValue={token.maxHealth}></StatInput>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <StatInput defaultValue={token.health}></StatInput>
                  </div>
                </TableCell>
                <TableCell>
                  <StatInput defaultValue={token.armorClass}></StatInput>
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
              included={allChecked(includedItems)}
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
            const damageScaleOption = damageScaleOptions.get(token.item.id);
            if (damageScaleOption === undefined) throw "Error invalid option";
            const scaledDamage = calculateScaledHealthDiff(
              included ? damageScaleOption : 0,
              value,
            );
            const [newHealth, newTempHealth] = calculateNewHealth(
              token.health,
              token.maxHealth,
              token.tempHealth,
              -1 * scaledDamage,
            );

            return (
              <TableRow key={token.item.id}>
                <CheckboxTableCell
                  token={token}
                  included={included}
                  setIncludedItems={setIncludedItems}
                />
                <TokenImageTableCell token={token} />
                <TokenNameTableCell token={token} />
                <TableCell>
                  <div className="flex max-w-32">
                    <Button
                      className="size-8 rounded-full"
                      size={"icon"}
                      variant={"outline"}
                      onClick={() => {
                        setDamageScaleOptions((prev) =>
                          new Map(prev).set(
                            token.item.id,
                            option > 1 ? option - 1 : option,
                          ),
                        );
                      }}
                    >
                      <ArrowLeftIcon className="size-4" />
                    </Button>
                    <div className="flex w-14 items-center justify-center text-lg font-medium">
                      {multipliers[option]}
                    </div>
                    <Button
                      className="size-8 rounded-full"
                      size={"icon"}
                      variant={"outline"}
                      onClick={() => {
                        setDamageScaleOptions((prev) =>
                          new Map(prev).set(
                            token.item.id,
                            option < multipliers.length - 1
                              ? option + 1
                              : option,
                          ),
                        );
                      }}
                    >
                      <ArrowRightIcon className="size-4" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>{scaledDamage}</TableCell>
                <TableCell className="md:min-w-16 lg:min-w-20">
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

function TokenImageTableCell({ token }: { token: Token }): JSX.Element {
  return (
    <TableCell className="font-medium">
      <img
        className="size-8 min-h-8 min-w-8"
        src={(token.item as Image).image.url}
      ></img>
    </TableCell>
  );
}

function TokenNameTableCell({ token }: { token: Token }): JSX.Element {
  return (
    <TableCell className="max-w-28 text-sm font-medium">
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

function StatInput({ defaultValue }: { defaultValue: number }): JSX.Element {
  return (
    <div className="flex items-center">
      <Input
        className="h-[32px] w-[60px] md:w-[65px] lg:w-[70px]"
        defaultValue={defaultValue}
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

const allChecked = (map: Map<string, boolean>): boolean | "indeterminate" => {
  let allChecked = true;
  let noneChecked = true;
  for (const entry of map) {
    if (entry[1] === false) allChecked = false;
    if (entry[1] === true) noneChecked = false;
  }
  if (allChecked) return true;
  if (noneChecked) return false;
  return "indeterminate";
};
