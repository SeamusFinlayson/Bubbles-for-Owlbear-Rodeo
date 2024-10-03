import Token from "../TokenClass";
import { useEffect, useState } from "react";
import {
  getNewStatValue,
  InputName,
  isInputName,
  writeTokenValueToItem,
} from "../statInputHelpers";
import OBR from "@owlbear-rodeo/sdk";
import {
  getName,
  getSelectedItemNameProperty,
  getSelectedItems,
  parseItems,
  writeNameToSelectedItem,
} from "../itemHelpers";
import BarInput from "../components/BarInput";
import "../index.css";
import BubbleInput from "../components/BubbleInput";
import "./editStatsStyle.css";
import TextField from "../components/TextField";
import IconButton from "../components/IconButton";
import MagicIcon from "../components/MagicIcon";
import { getPluginId } from "../getPluginId";
import { Button } from "@/components/ui/button";
import BookLock from "@/components/icons/BookLock";
import BookOpen from "@/components/icons/BookOpen";
import { cn } from "@/lib/utils";

export default function StatsMenuApp({
  initialToken,
  initialTokenName,
  initialNameTagsEnabled,
  role,
}: {
  initialToken: Token;
  initialTokenName: string;
  initialNameTagsEnabled: boolean;
  role: "GM" | "PLAYER";
}): JSX.Element {
  const [token, setToken] = useState<Token>(initialToken);

  useEffect(
    () =>
      OBR.scene.items.onChange(() => {
        const updateStats = (tokens: Token[]) => {
          let currentToken = tokens[0];
          setToken(currentToken);
        };
        getSelectedItems().then((selectedItems) => {
          updateStats(parseItems(selectedItems));
          setTokenName(getName(selectedItems[0]));
        });
      }),
    [],
  );

  async function handleStatUpdate(
    target: HTMLInputElement,
    previousValue: number,
  ) {
    const name = target.name;
    if (!isInputName(name)) throw "Error: invalid input name.";

    const value = getNewStatValue(name, target.value, previousValue);

    setToken((prev) => ({ ...prev, [name]: value }) as Token);
    writeTokenValueToItem(token.item.id, name, value);
  }

  async function toggleHide() {
    const name: InputName = "hideStats";
    if (!isInputName(name)) throw "Error: invalid input name.";

    const value = !token.hideStats;
    setToken((prev) => ({ ...prev, [name]: value }) as Token);
    writeTokenValueToItem(token.item.id, name, value);
  }

  const [tokenName, setTokenName] = useState(initialTokenName);

  const [nameTagsEnabled, setNameTagsEnabled] = useState(
    initialNameTagsEnabled,
  );

  useEffect(() =>
    OBR.scene.onMetadataChange((metadata) => {
      const nameTagsEnabled = (
        metadata[getPluginId("metadata")] as {
          "name-tags": boolean | undefined;
        }
      )["name-tags"];
      if (nameTagsEnabled !== undefined) setNameTagsEnabled(nameTagsEnabled);
    }),
  );

  const NameField: JSX.Element = (
    <div className="grid grid-cols-[1fr,auto,1fr] place-items-center px-2 pt-1">
      <div></div>
      <div className="w-[144px]">
        <TextField
          updateHandler={(target) => {
            const updateName = target.value.replaceAll(" ", "") !== "";
            writeNameToSelectedItem(target.value, updateName);
          }}
          inputProps={{
            placeholder: "Name",
            value: tokenName,
            onChange: (e) => {
              setTokenName(e.target.value);
            },
          }}
          animateOnlyWhenRootActive={true}
        ></TextField>
      </div>
      {tokenName === "" && (
        <div className="right-0 top-0">
          <IconButton
            Icon={MagicIcon}
            onClick={() => {
              getSelectedItemNameProperty().then((name) => {
                setTokenName(name);
                writeNameToSelectedItem(name);
              });
            }}
            padding=""
            animateOnlyWhenRootActive={true}
          ></IconButton>
        </div>
      )}
    </div>
  );

  const StatsMenu: JSX.Element = (
    <div className={"stat-grid bg-mirage-950/[0.07] dark:bg-mirage-50/[0.07]"}>
      <div className="grid-item">
        <label className="label">HP</label>
      </div>
      <div className="grid-item">
        <label className="label">Temp</label>
      </div>
      <div className="grid-item">
        <label className="label">AC</label>
      </div>
      <BarInput
        parentValue={token.health}
        parentMax={token.maxHealth}
        color={0}
        valueUpdateHandler={(target) => handleStatUpdate(target, token.health)}
        maxUpdateHandler={(target) => handleStatUpdate(target, token.maxHealth)}
        valueInputProps={{ name: "health" }}
        maxInputProps={{ name: "maxHealth" }}
        animateOnlyWhenRootActive={true}
      ></BarInput>
      <BubbleInput
        parentValue={token.tempHealth}
        color={1}
        updateHandler={(target) => handleStatUpdate(target, token.tempHealth)}
        inputProps={{ name: "tempHealth" }}
        animateOnlyWhenRootActive={true}
      ></BubbleInput>
      <BubbleInput
        parentValue={token.armorClass}
        color={2}
        updateHandler={(target) => handleStatUpdate(target, token.armorClass)}
        inputProps={{ name: "armorClass" }}
        animateOnlyWhenRootActive={true}
      ></BubbleInput>
    </div>
  );

  const HideRow: JSX.Element = (
    <div className="p-2 pb-0">
      <Button
        variant={"ghost"}
        className={cn(
          "size-full rounded-lg bg-mirage-950/[0.07] text-base hover:bg-mirage-950/15 dark:bg-mirage-50/[0.07] dark:hover:bg-mirage-50/15",
        )}
        onClick={() => toggleHide()}
      >
        {token.hideStats && true ? (
          <div className="dark:text-primary-dark-300 dark:hover:text-primary-dark-300 text-primary-800 hover:text-primary-800 inline-flex items-center gap-2">
            <BookLock />
            Dungeon Master Only
          </div>
        ) : (
          <div className="inline-flex items-center gap-2">
            <BookOpen />
            <div className="transition-none">Player Editable</div>
          </div>
        )}
      </Button>
    </div>
  );

  return (
    <div className="text-text-primary dark:text-text-primary-dark">
      {nameTagsEnabled && NameField}
      {StatsMenu}
      {role === "GM" && HideRow}
    </div>
  );
}
