import { cn } from "@/lib/utils";
import PartiallyControlledInput from "./StatInput";
import { InputName } from "@/statInputHelpers";
import { InputColor } from "@/colorHelpers";
import StatToolTip from "./StatToolTip";
import { useState } from "react";

export default function BarInput({
  parentValue,
  parentMax,
  color,
  valueUpdateHandler,
  maxUpdateHandler,
  valueName,
  maxName,
  animateOnlyWhenRootActive = false,
}: {
  parentValue: number;
  parentMax: number;
  color: InputColor;
  valueUpdateHandler: (target: HTMLInputElement) => Promise<void>;
  maxUpdateHandler: (target: HTMLInputElement) => Promise<void>;
  valueName: InputName;
  maxName: InputName;
  animateOnlyWhenRootActive?: boolean;
}): JSX.Element {
  const [valueHasFocus, setValueHasFocus] = useState(false);
  const [maxHasFocus, setMaxHasFocus] = useState(false);

  const animationDuration75 = animateOnlyWhenRootActive
    ? "group-focus-within/root:duration-75 group-hover/root:duration-75"
    : "duration-75";

  return (
    <div
      className={`grid grid-cols-1 grid-rows-1 place-items-center drop-shadow-sm focus-within:bg-transparent focus-within:drop-shadow-md`}
    >
      <div
        className={cn(
          animationDuration75,
          "peer col-span-full row-span-full flex h-[44px] w-[100px] justify-between rounded-xl pb-[2px] outline-0 dark:outline dark:outline-2 dark:-outline-offset-2 dark:outline-white/40",
          {
            "bg-stat-red/10 fill-stat-red/25 dark:bg-stat-red-dark/10 dark:fill-stat-red-dark/20 dark:focus-within:outline-stat-red-highlight-dark":
              color === "RED",
          },
        )}
      >
        <div className={"pointer-events-none absolute -z-30"}>
          {valueHasFocus && <LeftCutoutBackground />}
          {maxHasFocus && <RightCutoutBackground />}
          {!valueHasFocus && !maxHasFocus && (
            <div
              className={cn("h-[44px] w-[100px] rounded-xl", {
                "bg-stat-red/25 dark:bg-stat-red-dark/20": color === "RED",
              })}
            ></div>
          )}
        </div>
        <StatToolTip
          open={valueHasFocus && parentValue !== 0}
          text={parentValue.toString()}
          color={color}
        >
          <PartiallyControlledInput
            parentValue={parentValue.toString()}
            name={valueName}
            onUserConfirm={valueUpdateHandler}
            onFocus={() => setValueHasFocus(true)}
            onBlur={() => setValueHasFocus(false)}
            className={cn(
              "size-[44px] rounded-xl bg-transparent text-center font-normal text-text-primary outline-none dark:text-text-primary-dark",
            )}
          />
        </StatToolTip>
        <div
          className={cn(
            "flex h-full items-center justify-center pt-[2px] text-text-primary dark:text-text-primary-dark",
          )}
        >
          /
        </div>
        <StatToolTip
          open={maxHasFocus && parentMax !== 0}
          text={parentMax.toString()}
          color={color}
        >
          <PartiallyControlledInput
            parentValue={parentMax.toString()}
            name={maxName}
            onUserConfirm={maxUpdateHandler}
            onFocus={() => setMaxHasFocus(true)}
            onBlur={() => setMaxHasFocus(false)}
            className={cn(
              "size-[44px] rounded-xl bg-transparent text-center font-normal text-text-primary outline-none dark:text-text-primary-dark",
            )}
          />
        </StatToolTip>
      </div>
    </div>
  );
}

function LeftCutoutBackground() {
  return (
    <svg>
      <path
        d="
          M 44 22
          l 0 -10 
          a 12 12 -90 0 0 -12 -12
          l 56 0
          a 12 12 90 0 1 12 12
          l 0 20
          a 12 12 90 0 1 -12 12
          l -56 0
          a 12 12 -90 0 0 12 -12
          l 0 -10
        "
      />
    </svg>
  );
}

function RightCutoutBackground() {
  return (
    <svg>
      <path
        d="
          M 56 22
          l 0 -10 
          a 12 12 -90 0 1 12 -12
          l -56 0
          a 12 12 90 0 0 -12 12
          l 0 20
          a 12 12 90 0 0 12 12
          l 56 0
          a 12 12 -90 0 1 -12 -12
          l 0 -10
        "
      />
    </svg>
  );
}
