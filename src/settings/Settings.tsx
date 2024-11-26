import "../index.css";
import Switch from "@/components/Switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SaveLocation,
  updateSettingMetadata,
} from "@/metadataHelpers/settingMetadataHelpers";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  OFFSET_METADATA_ID,
  BAR_AT_TOP_METADATA_ID,
  SHOW_BARS_METADATA_ID,
  SEGMENTS_METADATA_ID,
  NAME_TAGS_METADATA_ID,
} from "@/metadataHelpers/settingMetadataIds";
import useSettings from "./useSettings";

export default function Settings(): JSX.Element {
  const roomSettings = useSettings("ROOM");
  const sceneSettings = useSettings("SCENE");

  const sceneOverridesCount =
    (sceneSettings.offset === undefined ? 0 : 1) +
    (sceneSettings.justification === undefined ? 0 : 1) +
    (sceneSettings.healthBarsVisible === undefined ? 0 : 1) +
    (sceneSettings.nameTags === undefined ? 0 : 1);

  return (
    <div className="h-full">
      <div className="flex h-full flex-col rounded-2xl border bg-mirage-100 text-mirage-900 outline outline-2 -outline-offset-1 outline-primary dark:bg-mirage-950 dark:text-mirage-50 dark:outline-primary-dark">
        <ScrollArea className="h-full 2xs:px-3 xs:px-4" type="scroll">
          <div className="flex flex-wrap items-center justify-between gap-2 pt-4">
            <div>
              <h1 className="text-2xl font-light">Settings</h1>
              <p className="text-xs text-mirage-400">
                <i>Stat Bubbles for D&D</i>
              </p>
            </div>
            <div className="flex gap-2 pr-0.5">
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

          <Tabs defaultValue="room" className="w-full py-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="room">Room</TabsTrigger>
              <TabsTrigger value="scene">
                {"Scene" +
                  (sceneOverridesCount === 0
                    ? ""
                    : ` (${sceneOverridesCount})`)}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="room">
              {roomSettings.initializationDone &&
                roomSettings.offset !== undefined &&
                roomSettings.justification !== undefined &&
                roomSettings.healthBarsVisible !== undefined &&
                roomSettings.segments !== undefined &&
                roomSettings.nameTags !== undefined && (
                  <div className="flex h-max flex-col justify-start gap-2 text-base">
                    <VerticalOffsetSettings
                      offset={roomSettings.offset}
                      setOffset={roomSettings.setOffset}
                      saveLocation="ROOM"
                    />
                    <JustificationSettings
                      justification={roomSettings.justification}
                      setJustification={roomSettings.setJustification}
                      saveLocation="ROOM"
                    />
                    <ShowHealthBarsSettings
                      healthBarsVisible={roomSettings.healthBarsVisible}
                      setHealthBarsVisible={roomSettings.setHealthBarsVisible}
                      segments={roomSettings.segments}
                      setSegments={roomSettings.setSegments}
                      saveLocation="ROOM"
                    />
                    <NameTagSettings
                      nameTags={roomSettings.nameTags}
                      setNameTags={roomSettings.setNameTags}
                      saveLocation="ROOM"
                    />
                  </div>
                )}
            </TabsContent>

            <TabsContent value="scene">
              {sceneSettings.initializationDone && (
                <div className="space-y-4">
                  <div className="text-balance pl-1">
                    Override the active room's settings for this scene.
                  </div>

                  {sceneOverridesCount > 0 && (
                    <div
                      className={cn(
                        "flex h-max flex-col justify-start gap-2 text-base",
                      )}
                    >
                      {sceneSettings.offset !== undefined && (
                        <VerticalOffsetSettings
                          offset={sceneSettings.offset}
                          setOffset={sceneSettings.setOffset}
                          saveLocation="SCENE"
                          removeHandler={() => {
                            sceneSettings.setOffset(undefined);
                            updateSettingMetadata(
                              OFFSET_METADATA_ID,
                              undefined,
                              "SCENE",
                            );
                          }}
                        />
                      )}
                      {sceneSettings.justification !== undefined && (
                        <JustificationSettings
                          justification={sceneSettings.justification}
                          setJustification={sceneSettings.setJustification}
                          saveLocation="SCENE"
                          removeHandler={() => {
                            sceneSettings.setJustification(undefined);
                            updateSettingMetadata(
                              BAR_AT_TOP_METADATA_ID,
                              undefined,
                              "SCENE",
                            );
                          }}
                        />
                      )}
                      {sceneSettings.healthBarsVisible !== undefined &&
                        sceneSettings.segments !== undefined && (
                          <ShowHealthBarsSettings
                            healthBarsVisible={sceneSettings.healthBarsVisible}
                            setHealthBarsVisible={
                              sceneSettings.setHealthBarsVisible
                            }
                            segments={sceneSettings.segments}
                            setSegments={sceneSettings.setSegments}
                            saveLocation="SCENE"
                            removeHandler={() => {
                              sceneSettings.setHealthBarsVisible(undefined);
                              updateSettingMetadata(
                                SHOW_BARS_METADATA_ID,
                                undefined,
                                "SCENE",
                              );
                            }}
                          />
                        )}
                      {sceneSettings.nameTags !== undefined && (
                        <NameTagSettings
                          nameTags={sceneSettings.nameTags}
                          setNameTags={sceneSettings.setNameTags}
                          saveLocation="SCENE"
                          removeHandler={() => {
                            sceneSettings.setNameTags(undefined);
                            updateSettingMetadata(
                              NAME_TAGS_METADATA_ID,
                              undefined,
                              "SCENE",
                            );
                          }}
                        />
                      )}
                    </div>
                  )}

                  {sceneOverridesCount < 4 && (
                    <div className="flex flex-wrap gap-2 pl-0.5 pr-8">
                      <AddSceneSettingButton
                        visible={sceneSettings.offset === undefined}
                        initializeSettings={() => {
                          sceneSettings.setOffset(roomSettings.offset);
                          updateSettingMetadata(
                            OFFSET_METADATA_ID,
                            parseFloat(roomSettings.offset as string),
                            "SCENE",
                          );
                        }}
                      >
                        + Offset
                      </AddSceneSettingButton>
                      <AddSceneSettingButton
                        visible={sceneSettings.justification === undefined}
                        initializeSettings={() => {
                          sceneSettings.setJustification(
                            roomSettings.justification,
                          );
                          updateSettingMetadata(
                            BAR_AT_TOP_METADATA_ID,
                            roomSettings.justification === "TOP" ? true : false,
                            "SCENE",
                          );
                        }}
                      >
                        + Justification
                      </AddSceneSettingButton>
                      <AddSceneSettingButton
                        visible={sceneSettings.healthBarsVisible === undefined}
                        initializeSettings={async () => {
                          sceneSettings.setHealthBarsVisible(
                            roomSettings.healthBarsVisible,
                          );
                          sceneSettings.setSegments(roomSettings.segments);
                          await updateSettingMetadata(
                            SHOW_BARS_METADATA_ID,
                            roomSettings.healthBarsVisible,
                            "SCENE",
                          );
                          updateSettingMetadata(
                            SEGMENTS_METADATA_ID,
                            parseFloat(roomSettings.segments as string),
                            "SCENE",
                          );
                        }}
                      >
                        + Show Health Bars
                      </AddSceneSettingButton>
                      <AddSceneSettingButton
                        visible={sceneSettings.nameTags === undefined}
                        initializeSettings={() => {
                          sceneSettings.setNameTags(roomSettings.nameTags);
                          updateSettingMetadata(
                            NAME_TAGS_METADATA_ID,
                            roomSettings.nameTags,
                            "SCENE",
                          );
                        }}
                      >
                        + Name Tags
                      </AddSceneSettingButton>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
    </div>
  );
}

function AddSceneSettingButton({
  visible,
  initializeSettings,
  children,
}: {
  visible: boolean;
  initializeSettings: () => void;
  children: any;
}) {
  if (!visible) return <></>;
  return (
    <Button
      className="h-[28px] rounded-full px-3"
      variant={"outline"}
      onClick={initializeSettings}
    >
      {children}
    </Button>
  );
}

function VerticalOffsetSettings({
  offset,
  setOffset,
  saveLocation,
  removeHandler,
}: {
  offset: string;
  setOffset: React.Dispatch<React.SetStateAction<string | undefined>>;
  saveLocation: SaveLocation;
  removeHandler?: () => void;
}) {
  return (
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
            updateSettingMetadata(OFFSET_METADATA_ID, value, saveLocation);
          }}
        />
      }
      last={removeHandler === undefined}
    >
      {removeHandler === undefined ? (
        <></>
      ) : (
        <RemoveSetting removeHandler={removeHandler} />
      )}
    </SettingsRow>
  );
}

function JustificationSettings({
  justification,
  setJustification,
  saveLocation,
  removeHandler,
}: {
  justification: "TOP" | "BOTTOM";
  setJustification: React.Dispatch<
    React.SetStateAction<"TOP" | "BOTTOM" | undefined>
  >;
  saveLocation: SaveLocation;
  removeHandler?: () => void;
}) {
  return (
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
            updateSettingMetadata(
              BAR_AT_TOP_METADATA_ID,
              justification === "TOP" ? false : true,
              saveLocation,
            );
          }}
        >
          {justification.toLowerCase()}
        </Button>
      }
      last={removeHandler === undefined}
    >
      {removeHandler === undefined ? (
        <></>
      ) : (
        <RemoveSetting removeHandler={removeHandler} />
      )}
    </SettingsRow>
  );
}

function ShowHealthBarsSettings({
  healthBarsVisible,
  setHealthBarsVisible,
  segments,
  setSegments,
  saveLocation,
  removeHandler,
}: {
  healthBarsVisible: boolean;
  setHealthBarsVisible: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
  segments: string;
  setSegments: React.Dispatch<React.SetStateAction<string | undefined>>;
  saveLocation: SaveLocation;
  removeHandler?: () => void;
}) {
  return (
    <SettingsRow
      icon={<Drama />}
      label="Show Health Bars"
      description="Show dungeon master only health bars, but not the text, to players "
      action={
        <Switch
          inputProps={{
            checked: healthBarsVisible,
            onChange: (e) => {
              setHealthBarsVisible(e.target.checked);
              updateSettingMetadata(
                SHOW_BARS_METADATA_ID,
                e.target.checked,
                saveLocation,
              );
            },
          }}
        />
      }
      last={!healthBarsVisible && removeHandler === undefined}
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
              updateSettingMetadata(SEGMENTS_METADATA_ID, value, saveLocation);
            }}
          />
        }
        collapseElement={!healthBarsVisible}
        last={removeHandler === undefined}
      />
      {removeHandler === undefined ? (
        <></>
      ) : (
        <RemoveSetting removeHandler={removeHandler} />
      )}
    </SettingsRow>
  );
}

function NameTagSettings({
  nameTags,
  setNameTags,
  saveLocation,
  removeHandler,
}: {
  nameTags: boolean;
  setNameTags: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  saveLocation: SaveLocation;
  removeHandler?: () => void;
}) {
  return (
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
              updateSettingMetadata(
                NAME_TAGS_METADATA_ID,
                e.target.checked,
                saveLocation,
              );
            },
          }}
        />
      }
      last={removeHandler === undefined}
    >
      {removeHandler === undefined ? (
        <></>
      ) : (
        <RemoveSetting removeHandler={removeHandler} />
      )}
    </SettingsRow>
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
          { "rounded-b-none": last === false },
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

function RemoveSetting({
  removeHandler,
}: {
  removeHandler: () => void;
}): JSX.Element {
  return (
    <div className="pt-0.5">
      <div
        className={cn(
          "flex items-center justify-start gap-4 rounded-none bg-mirage-200 dark:bg-mirage-900",
          { "rounded-b": true },
        )}
      >
        <Button
          className="w-full rounded-t-none hover:bg-red-500/10 hover:text-red-800 dark:hover:bg-red-500/10 dark:hover:text-red-500"
          variant={"ghost"}
          onClick={removeHandler}
        >
          Restore Room Default
        </Button>
      </div>
    </div>
  );
}
