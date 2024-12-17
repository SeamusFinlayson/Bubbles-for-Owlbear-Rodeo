import "../index.css";
import "./editStatsStyle.css";
import Token from "../metadataHelpers/TokenType";
import { useEffect, useState } from "react";
import {
  getNewStatValue,
  InputName,
  isInputName,
  writeTokenValueToItem,
} from "../statInputHelpers";
import OBR from "@owlbear-rodeo/sdk";
import {
  getSelectedItems,
  parseItems,
} from "../metadataHelpers/itemMetadataHelpers";
import BarInput from "../components/BarInput";
import BubbleInput from "../components/BubbleInput";
import NameInput from "../components/NameInput";
import IconButton from "../components/IconButton";
import MagicIcon from "../components/MagicIcon";
import { Button } from "@/components/ui/button";
import BookLock from "@/components/icons/BookLock";
import BookOpen from "@/components/icons/BookOpen";
import { cn } from "@/lib/utils";
import {
  getName,
  getSelectedItemNameProperty,
  writeNameToSelectedItem,
} from "@/metadataHelpers/nameHelpers";
import getGlobalSettings from "@/background/getGlobalSettings";

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

  function handleStatUpdate(target: HTMLInputElement, previousValue: number) {
    const name = target.name;
    if (!isInputName(name)) throw "Error: invalid input name.";

    const value = getNewStatValue(name, target.value, previousValue);

    setToken((prev) => ({ ...prev, [name]: value }) as Token);
    writeTokenValueToItem(token.item.id, name, value);
  }

  function toggleHide() {
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
    OBR.scene.onMetadataChange(async (sceneMetadata) => {
      const nameTagsEnabled = (
        await getGlobalSettings(undefined, sceneMetadata, undefined)
      ).settings.nameTags;
      setNameTagsEnabled(nameTagsEnabled);
    }),
  );
  useEffect(() =>
    OBR.room.onMetadataChange(async (roomMetadata) => {
      const nameTagsEnabled = (
        await getGlobalSettings(undefined, undefined, roomMetadata)
      ).settings.nameTags;
      setNameTagsEnabled(nameTagsEnabled);
    }),
  );

  const NameField: JSX.Element = (
    <div className="grid grid-cols-[1fr,auto,1fr] place-items-center">
      <div></div>
      <div className="w-[144px]">
        <NameInput
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
        ></NameInput>
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
    <div
      className={
        "grid grid-cols-4 rounded-lg bg-mirage-950/[0.07] fill-text-secondary p-1 py-1 dark:bg-mirage-50/[0.07] dark:fill-text-secondary-dark"
      }
    >
      <div className="col-span-2 grid grid-cols-1 grid-rows-[12px_1fr_12px] justify-items-center gap-y-[1px]">
        <h2 className="col-span-2 flex justify-center self-start text-2xs font-medium tracking-wider text-text-secondary dark:text-text-secondary-dark">
          HIT POINTS
        </h2>
        <BarInput
          parentValue={token.health}
          parentMax={token.maxHealth}
          color={"RED"}
          valueUpdateHandler={async (target) =>
            handleStatUpdate(target, token.health)
          }
          maxUpdateHandler={async (target) =>
            handleStatUpdate(target, token.maxHealth)
          }
          valueName="health"
          maxName="maxHealth"
          animateOnlyWhenRootActive={true}
        ></BarInput>
        <h2 className="col-span-2 flex justify-center self-start text-2xs font-medium tracking-wider text-text-secondary dark:text-text-secondary-dark">
          & MAXIMUM
        </h2>
      </div>

      <div className="col-start-3 row-start-1 flex items-center justify-center">
        <div className="size-0">
          <TextRing
            topText={"TEMPORARY"}
            bottomText={"HIT POINTS"}
            letterSpacing={0.8}
          />
        </div>
      </div>
      <div className="col-start-3 row-start-1 flex size-full items-center justify-center">
        <BubbleInput
          parentValue={token.tempHealth}
          color="GREEN"
          updateHandler={(target) => handleStatUpdate(target, token.tempHealth)}
          name="tempHealth"
          animateOnlyWhenRootActive={true}
        />
      </div>

      <div className="col-start-4 row-start-1 flex items-center justify-center">
        <div className="size-0">
          <TextRing topText={"ARMOR"} bottomText={"CLASS"} letterSpacing={1} />
        </div>
      </div>
      <div className="col-start-4 row-start-1 flex size-full items-center justify-center">
        <BubbleInput
          parentValue={token.armorClass}
          color="BLUE"
          updateHandler={(target) => handleStatUpdate(target, token.armorClass)}
          name={"armorClass"}
          animateOnlyWhenRootActive={true}
        />
      </div>
    </div>
  );

  const HideButton: JSX.Element = (
    <div>
      <Button
        variant={"ghost"}
        className={cn(
          "size-full rounded-lg bg-mirage-950/[0.07] text-base font-normal text-text-primary hover:bg-mirage-950/15 dark:bg-mirage-50/[0.07] dark:text-text-primary-dark dark:hover:bg-mirage-50/15",
        )}
        onClick={() => toggleHide()}
      >
        {token.hideStats && true ? (
          <div className="inline-flex items-center gap-2 text-primary-800 hover:text-primary-800 dark:text-primary-dark-300 dark:hover:text-primary-dark-300">
            <BookLock />
            <div>Dungeon Master Only</div>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2">
            <BookOpen />
            <div>Player Editable</div>
          </div>
        )}
      </Button>
    </div>
  );

  return (
    <div className="h-full space-y-2 overflow-hidden px-2 py-1">
      {nameTagsEnabled && NameField}
      {StatsMenu}
      {role === "GM" && HideButton}
    </div>
  );
}

const TextRing = ({
  topText,
  bottomText,
  letterSpacing,
}: {
  topText: string;
  bottomText: string;
  letterSpacing: number;
}): JSX.Element => {
  const fillOpacity = 0;
  const radius = 29;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible text-2xs font-medium"
    >
      <path
        id="topCirclePath"
        d={`
          M ${(-radius).toString()} 0
          A ${radius.toString()} ${radius.toString()} 0 0,1 ${radius.toString()},0
        `}
        fillOpacity={fillOpacity}
      />
      <path
        id="bottomCirclePath"
        d={`
            M ${(-radius).toString()} 0
            A ${radius.toString()} ${radius.toString()} 0 0,0 ${radius.toString()},0
          `}
        fillOpacity={fillOpacity}
      />
      <text>
        <textPath
          href="#topCirclePath"
          startOffset="50%"
          dominantBaseline="central"
          textAnchor="middle"
          letterSpacing={letterSpacing}
        >
          {topText}
        </textPath>
      </text>
      <text>
        <textPath
          href="#bottomCirclePath"
          startOffset="50%"
          dominantBaseline="central"
          textAnchor="middle"
          letterSpacing={letterSpacing}
        >
          {bottomText}
        </textPath>
      </text>
    </svg>
  );
};
