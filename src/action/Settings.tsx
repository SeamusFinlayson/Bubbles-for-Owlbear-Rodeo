import { Separator } from "@/components/ui/separator";
import "../index.css";
import Switch from "@/components/Switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import OBR, { Metadata } from "@owlbear-rodeo/sdk";
import {
  BAR_AT_TOP_METADATA_ID,
  NAME_TAGS_METADATA_ID,
  OFFSET_METADATA_ID,
  readBooleanFromMetadata,
  readNumberFromMetadata,
  SEGMENTS_METADATA_ID,
  SHOW_BARS_METADATA_ID,
  updateSceneMetadata,
} from "@/sceneMetadataHelpers";
import { MoveVertical } from "../components/icons/MoveVertical";
import { AlignVerticalJustifyEnd } from "../components/icons/AlignVerticalJustifyEnd";
import { AlignVerticalJustifyStart } from "../components/icons/AlignVerticalJustifyStart";
import { Drama } from "../components/icons/Drama";
import { NameTag } from "../components/icons/NameTag";
import LinkButton from "./LinkButton";
import { Patreon } from "@/components/icons/Patreon";
import { QuestionMark } from "@/components/icons/QuestionMark";
import { History } from "@/components/icons/History";
import { Bug } from "@/components/icons/bug";

export default function Settings(): JSX.Element {
  const [offset, setOffset] = useState("0");
  const [justification, setJustification] = useState<"TOP" | "BOTTOM">("TOP");
  const [healthBarVisible, setHealthBarVisible] = useState(false);
  const [segments, setSegments] = useState("0");
  const [nameTags, setNameTags] = useState(false);

  // UI state
  const [initializationDone, setInitializationDone] = useState(false);

  useEffect(() => {
    const handleSceneMetadataChange = (sceneMetadata: Metadata) => {
      setOffset(
        readNumberFromMetadata(sceneMetadata, OFFSET_METADATA_ID).toString(),
      );
      setJustification(
        readBooleanFromMetadata(sceneMetadata, BAR_AT_TOP_METADATA_ID)
          ? "TOP"
          : "BOTTOM",
      );
      setHealthBarVisible(
        readBooleanFromMetadata(sceneMetadata, SHOW_BARS_METADATA_ID),
      );
      setSegments(
        readNumberFromMetadata(sceneMetadata, SEGMENTS_METADATA_ID).toString(),
      );
      setNameTags(
        readBooleanFromMetadata(sceneMetadata, NAME_TAGS_METADATA_ID),
      );
      setInitializationDone(true);
    };
    OBR.scene.getMetadata().then(handleSceneMetadataChange);
    return OBR.scene.onMetadataChange(handleSceneMetadataChange);
  }, []);

  return (
    <div className="h-full">
      <div className="flex h-full flex-col rounded-2xl border bg-mirage-100 py-4 text-mirage-900 outline outline-2 -outline-offset-1 outline-primary dark:bg-mirage-950 dark:text-mirage-50 dark:outline-primary-dark">
        <div className="flex flex-wrap items-center justify-between gap-2 px-4">
          <div>
            <h1 className="text-2xl font-light">Scene Settings</h1>
            <p className="text-xs text-mirage-400">
              <i>Stat Bubbles for D&D</i>
            </p>
          </div>
          <div className="flex gap-2">
            <LinkButton
              name="Patreon"
              size="large"
              icon={<Patreon />}
              href={"https://www.patreon.com/SeamusFinlayson"}
            />
            <LinkButton
              name="Change Log"
              size="large"
              icon={<History />}
              href={"https://www.patreon.com/collection/306916?view=expanded"}
            />
            <LinkButton
              name="Instructions"
              size="large"
              icon={<QuestionMark />}
              href={
                "https://github.com/SeamusFinlayson/Bubbles-for-Owlbear-Rodeo?tab=readme-ov-file#how-it-works"
              }
            />
            <LinkButton
              name="Report Bug"
              size="large"
              icon={<Bug />}
              href="https://discord.gg/WMp9bky4be"
            />
          </div>
        </div>
        <div className="px-4 py-2">
          <Separator />{" "}
        </div>
        {initializationDone && (
          <ScrollArea className="h-full 2xs:px-3 xs:px-4">
            <div className="flex h-max flex-col justify-start gap-2 text-base">
              <SettingsRow
                icon={<MoveVertical />}
                label="Offset"
                description="Move stat bubbles up or down"
                action={
                  <Input
                    className="w-20 bg-mirage-50/30 focus:bg-mirage-50/40 dark:bg-mirage-950/40 dark:focus:bg-mirage-950/80"
                    value={offset}
                    onChange={(e) => setOffset(e.target.value)}
                    onBlur={(e) => {
                      let value = Math.trunc(parseFloat(e.target.value));
                      if (Number.isNaN(value)) value = 0;
                      setOffset(value.toString());
                      updateSceneMetadata(OFFSET_METADATA_ID, value);
                    }}
                  />
                }
              />
              <SettingsRow
                icon={
                  justification === "TOP" ? (
                    <AlignVerticalJustifyStart />
                  ) : (
                    <AlignVerticalJustifyEnd />
                  )
                }
                label="Justification"
                description="Snap stat bubbles to the top or bottom of tokens"
                action={
                  <Button
                    variant={"outline"}
                    className="w-20 capitalize"
                    onClick={() => {
                      setJustification(justification);
                      updateSceneMetadata(
                        BAR_AT_TOP_METADATA_ID,
                        justification === "TOP" ? false : true,
                      );
                    }}
                  >
                    {justification.toLowerCase()}
                  </Button>
                }
              />
              <SettingsRow
                icon={<Drama />}
                label="Show Health Bars"
                description="Show dungeon master only health bars, but not the text, to players "
                action={
                  <Switch
                    inputProps={{
                      checked: healthBarVisible,
                      onChange: (e) => {
                        setHealthBarVisible(e.target.checked);
                        updateSceneMetadata(
                          SHOW_BARS_METADATA_ID,
                          e.target.checked,
                        );
                      },
                    }}
                  />
                }
                last={healthBarVisible}
              >
                <SubSettingsRow
                  label="Segments"
                  description="Only show when creatures drop to certain fractions of their health"
                  action={
                    <Input
                      className="w-20 bg-mirage-50/30 focus:bg-mirage-50/40 dark:bg-mirage-950/40 dark:focus:bg-mirage-950/80"
                      value={segments}
                      onChange={(e) => setSegments(e.target.value)}
                      onBlur={(e) => {
                        let value = Math.trunc(parseFloat(e.target.value));
                        if (Number.isNaN(value)) value = 0;
                        setSegments(value.toString());
                        updateSceneMetadata(SEGMENTS_METADATA_ID, value);
                      }}
                    />
                  }
                  collapseElement={!healthBarVisible}
                  last
                />
              </SettingsRow>
              <SettingsRow
                icon={<NameTag />}
                label="Name Tags"
                description="Custom name tags that never overlap with stat bubbles"
                action={
                  <Switch
                    inputProps={{
                      checked: nameTags,
                      onChange: (e) => {
                        setNameTags(e.target.checked);
                        updateSceneMetadata(
                          NAME_TAGS_METADATA_ID,
                          e.target.checked,
                        );
                      },
                    }}
                  />
                }
              />
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  description,
  action,
  children,
  last,
}: {
  icon: JSX.Element;
  label: string;
  description: string;
  action: JSX.Element;
  children?: JSX.Element | JSX.Element[];
  last?: boolean;
}): JSX.Element {
  return (
    <div>
      <div
        className={cn(
          "flex min-h-16 items-center justify-start gap-4 rounded bg-mirage-200 p-2 dark:bg-mirage-900",
          { "rounded-b-none": last },
        )}
      >
        <div className="size-10 min-w-10 stroke-mirage-950 p-2 dark:stroke-mirage-50">
          {icon}
        </div>
        <div>
          <label htmlFor="vertical offset">{label}</label>
          <div className="text-xs text-mirage-400">{description}</div>
        </div>
        <div className="ml-auto">{action}</div>
      </div>
      {children}
    </div>
  );
}

function SubSettingsRow({
  label,
  description,
  action,
  last,
  collapseElement,
}: {
  label: string;
  description?: string;
  action: JSX.Element;
  last?: boolean;
  collapseElement: boolean;
}): JSX.Element {
  return (
    <div
      {...{ inert: collapseElement ? "" : undefined }} // type script react does not recognize inert
      className={cn("overflow-clip transition-max-height duration-300", {
        "max-h-60 ease-in": !collapseElement,
        "max-h-0 ease-out": collapseElement,
      })}
    >
      <div className="pt-0.5">
        <div
          className={cn(
            "flex min-h-16 items-center justify-start gap-4 rounded-none bg-mirage-200 p-2 dark:bg-mirage-900",
            { "rounded-b": last },
          )}
        >
          <div className="size-10 min-w-10 p-2"></div>
          <div>
            <label htmlFor="vertical offset">{label}</label>
            <div className="text-xs text-mirage-400">{description}</div>
          </div>
          <div className="ml-auto">{action}</div>
        </div>
      </div>
    </div>
  );
}
