import { Separator } from "@/components/ui/separator";
import "../index.css";
import ToggleButton from "@/components/ToggleButton";
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
import HeaderButtons from "./HeaderButtons";

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
      <div className="flex h-full flex-col rounded-2xl border border-primary-dark bg-mirage-100 py-4 text-mirage-900 dark:bg-mirage-950 dark:text-mirage-50">
        <div className="flex items-center justify-between px-4">
          <h1 className="text-2xl font-light">Settings</h1>
          <HeaderButtons />
        </div>
        <div className="px-4 py-2">
          <Separator />
        </div>
        {initializationDone && (
          <ScrollArea className="2xs:px-3 xs:px-4 h-full">
            <div className="flex h-max flex-col justify-start gap-2 text-base">
              <SettingsRow
                icon={<VerticalSVG />}
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
                    className="w-20"
                    onClick={() => {
                      const value = justification === "TOP" ? "BOTTOM" : "TOP";
                      setJustification(value);
                      updateSceneMetadata(
                        BAR_AT_TOP_METADATA_ID,
                        justification === "TOP" ? false : true,
                      );
                    }}
                  >
                    {justification === "TOP" ? "Top" : "Bottom"}
                  </Button>
                }
              />
              <SettingsRow
                icon={<Drama />}
                label="Show Health Bars"
                description="Show dungeon master only health bars to players but not the text"
                action={
                  <ToggleButton
                    isChecked={healthBarVisible}
                    changeHandler={(target) => {
                      setHealthBarVisible(target.checked);
                      updateSceneMetadata(
                        SHOW_BARS_METADATA_ID,
                        target.checked,
                      );
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
                  <ToggleButton
                    isChecked={nameTags}
                    changeHandler={(target) => {
                      setNameTags(target.checked);
                      updateSceneMetadata(
                        NAME_TAGS_METADATA_ID,
                        target.checked,
                      );
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
      className={cn("transition-max-height overflow-clip duration-200", {
        "max-h-20": !collapseElement,
        "max-h-0": collapseElement,
      })}
    >
      <div
        className={cn(
          "mt-0.5 flex min-h-16 items-center justify-start gap-4 rounded-none bg-mirage-200 p-2 dark:bg-mirage-900",
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
  );
}

const VerticalSVG = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-move-vertical"
  >
    <polyline points="8 18 12 22 16 18" />
    <polyline points="8 6 12 2 16 6" />
    <line x1="12" x2="12" y1="2" y2="22" />
  </svg>
);

const AlignVerticalJustifyEnd = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-align-vertical-justify-end"
  >
    <rect width="14" height="6" x="5" y="12" rx="2" />
    <rect width="10" height="6" x="7" y="2" rx="2" />
    <path d="M2 22h20" />
  </svg>
);

const AlignVerticalJustifyStart = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-align-vertical-justify-start"
  >
    <rect width="14" height="6" x="5" y="16" rx="2" />
    <rect width="10" height="6" x="7" y="6" rx="2" />
    <path d="M2 2h20" />
  </svg>
);

const Drama = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-drama"
  >
    <path d="M10 11h.01" />
    <path d="M14 6h.01" />
    <path d="M18 6h.01" />
    <path d="M6.5 13.1h.01" />
    <path d="M22 5c0 9-4 12-6 12s-6-3-6-12c0-2 2-3 6-3s6 1 6 3" />
    <path d="M17.4 9.9c-.8.8-2 .8-2.8 0" />
    <path d="M10.1 7.1C9 7.2 7.7 7.7 6 8.6c-3.5 2-4.7 3.9-3.7 5.6 4.5 7.8 9.5 8.4 11.2 7.4.9-.5 1.9-2.1 1.9-4.7" />
    <path d="M9.1 16.5c.3-1.1 1.4-1.7 2.4-1.4" />
  </svg>
);

const NameTag = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-tag"
  >
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" className="fill-white dark:fill-black" />
  </svg>
);
