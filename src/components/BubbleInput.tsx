import { InputName } from "@/statInputHelpers";
import PartiallyControlledInput from "./StatInput";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { InputColor } from "@/colorHelpers";
import StatToolTip from "./StatToolTip";

export default function BubbleInput({
  parentValue,
  color,
  updateHandler,
  name,
  animateOnlyWhenRootActive = false,
}: {
  parentValue: number;
  color: InputColor;
  updateHandler: (target: HTMLInputElement) => void;
  name: InputName;
  animateOnlyWhenRootActive?: boolean;
}): JSX.Element {
  const [hasFocus, setHasFocus] = useState(false);

  const animationDuration75 = animateOnlyWhenRootActive
    ? "group-focus-within/root:duration-75 group-hover/root:duration-75"
    : "duration-75";
  const animationDuration100 = animateOnlyWhenRootActive
    ? "group-focus-within/root:duration-100 group-hover/root:duration-100"
    : "duration-100";

  return (
    <div
      className={`${animationDuration75} grid grid-cols-1 grid-rows-1 place-items-center drop-shadow-sm focus-within:drop-shadow-md`}
    >
      <div
        className={cn(
          animationDuration100,
          {
            "bg-stat-green/40 focus-within:bg-stat-green/10 dark:bg-stat-green-dark/30 dark:focus-within:bg-stat-green-dark/10 dark:focus-within:outline-stat-green-highlight-dark":
              color === "GREEN",
            "bg-stat-blue/40 focus-within:bg-stat-blue/10 dark:bg-stat-blue-dark/30 dark:focus-within:bg-stat-blue-dark/10 dark:focus-within:outline-stat-blue-highlight-dark":
              color === "BLUE",
          },
          "peer col-span-full row-span-full size-[44px] rounded-full bg-opacity-0 dark:outline dark:outline-2 dark:-outline-offset-2 dark:outline-white/40",
        )}
      >
        <StatToolTip
          open={hasFocus && parentValue !== 0}
          text={parentValue.toString()}
          color={color}
        >
          <PartiallyControlledInput
            name={name}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            parentValue={parentValue.toString()}
            onUserConfirm={updateHandler}
            className={`${animationDuration100} size-[44px] rounded-full bg-transparent text-center font-normal text-text-primary outline-none dark:text-text-primary-dark`}
          />
        </StatToolTip>
      </div>
    </div>
  );
}
