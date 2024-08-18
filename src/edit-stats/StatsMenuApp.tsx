import Token, { StatsObject } from "../TokenClass";
import { useEffect, useState } from "react";
import {
  isInputName,
  writeInputValueToTokenMetadata,
} from "./writeInputValueToTokenMetadata";
import { useTheme } from "@mui/material";
import OBR from "@owlbear-rodeo/sdk";
import {
  getName,
  getSelectedItemNameProperty,
  getSelectedItems,
  parseSelectedTokens,
  writeNameToSelectedItem,
} from "../itemHelpers";
import BarInput from "../components/BarInput";
import "../index.css";
import BubbleInput from "../components/BubbleInput";
import ToggleButton from "../components/ToggleButton";
import "./editStatsStyle.css";
import TextField from "../components/TextField";
import IconButton from "../components/IconButton";
import MagicIcon from "../components/MagicIcon";
import { getPluginId } from "../getPluginId";

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
  const mode = useTheme().palette.mode;
  const textColor = useTheme().palette.text.primary;

  const [token, setToken] = useState<StatsObject>(
    initialToken.returnStatsAsObject(),
  );

  useEffect(
    () =>
      OBR.scene.items.onChange(() => {
        const updateStats = (tokens: Token[]) => {
          let currentToken = tokens[0];
          setToken(currentToken.returnStatsAsObject());
        };
        getSelectedItems().then((selectedItems) => {
          parseSelectedTokens(false, selectedItems).then((tokens) =>
            updateStats(tokens),
          );
          setTokenName(getName(selectedItems[0]));
        });
      }),
    [],
  );

  async function handleTargetUpdate(target: HTMLInputElement) {
    const name = target.name;
    if (!isInputName(name)) {
      throw "Error: invalid input name.";
    }

    let value: string;

    switch (target.type) {
      case "text":
        value = target.value;
        break;
      default:
        throw "Error unhandled input type.";
    }

    await writeInputValueToTokenMetadata(name, value).then((newValue) => {
      let correctTypeValue: number | boolean;
      if (typeof newValue === "string")
        correctTypeValue = Math.trunc(parseFloat(newValue));
      else correctTypeValue = newValue;

      setToken((prev): StatsObject => {
        return { ...prev, [name]: correctTypeValue };
      });
    });
  }

  function updateHide(target: HTMLInputElement) {
    const name = target.name;
    if (!isInputName(name)) {
      throw "Error: invalid input name.";
    }

    let value: boolean;

    switch (target.type) {
      case "checkbox":
        value = target.checked;
        break;
      default:
        throw "Error unhandled input type.";
    }

    setToken((prev): StatsObject => {
      return { ...prev, [name]: value };
    });


    writeInputValueToTokenMetadata(name, value);
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
        <div className=" right-0 top-0 ">
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
    <div className={"stat-grid " + mode} style={{ color: textColor }}>
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
        valueUpdateHandler={handleTargetUpdate}
        maxUpdateHandler={handleTargetUpdate}
        valueInputProps={{ name: "health" }}
        maxInputProps={{ name: "maxHealth" }}
        animateOnlyWhenRootActive={true}
      ></BarInput>
      <BubbleInput
        parentValue={token.tempHealth}
        color={1}
        updateHandler={handleTargetUpdate}
        inputProps={{ name: "tempHealth" }}
        animateOnlyWhenRootActive={true}
      ></BubbleInput>
      <BubbleInput
        parentValue={token.armorClass}
        color={2}
        updateHandler={handleTargetUpdate}
        inputProps={{ name: "armorClass" }}
        animateOnlyWhenRootActive={true}
      ></BubbleInput>
    </div>
  );

  const HideRow: JSX.Element = (
    <div className={"hide-switch-row " + mode} style={{ color: textColor }}>
      <label htmlFor="hide" className="label" style={{ margin: 0 }}>
        Hide stats from players
      </label>
      <ToggleButton
        isChecked={token.hideStats}
        changeHandler={updateHide}
        inputProps={{ name: "hideStats" }}
      ></ToggleButton>
    </div>
  );

  const ShowRaw: JSX.Element = (
    <div className={"hide-switch-row " + mode} style={{ color: textColor }}>
      <label htmlFor="raw" className="label" style={{ margin: 0 }}>
        Show total hit points 
      </label>
      <ToggleButton
        isChecked={token.showRaw}
        changeHandler={updateHide}
        inputProps={{ name: "showRaw" }}
      ></ToggleButton>
    </div>
  );

  if (role === "GM") {
    return (
      <div className={mode}>
        {nameTagsEnabled && NameField}
        {StatsMenu}
        {ShowRaw}
        {HideRow}
      </div>
    );
  } else {
    return (
      <div className={mode}>
        {nameTagsEnabled && NameField}
        {StatsMenu}
        {ShowRaw}
      </div>
    );
  }
}
