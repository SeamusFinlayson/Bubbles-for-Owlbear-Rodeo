import { InputHTMLAttributes, useEffect, useState } from "react";
import { getBackgroundColor } from "../colorHelpers";

export default function BubbleInput({
  parentValue,
  color,
  updateHandler,
  inputProps,
  animateOnlyWhenRootActive = false,
}: {
  parentValue: number;
  color: number;
  updateHandler: (target: HTMLInputElement) => Promise<void>;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  animateOnlyWhenRootActive?: boolean;
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
        className={`${animationDuration75} ${getBackgroundColor(color)} peer col-span-full row-span-full size-[44px] rounded-full dark:outline dark:outline-2 dark:-outline-offset-2 dark:outline-white/40 dark:focus-within:outline-offset-0 dark:focus-within:outline-white/60`}
      >
        <input
          {...inputProps}
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
          className={`${animationDuration100} size-[44px] rounded-full bg-transparent text-center font-medium text-text-primary outline-none hover:bg-white/10 focus:bg-white/15 dark:text-text-primary-dark dark:hover:bg-black/10 dark:focus:bg-black/15`}
          placeholder=""
        ></input>
      </div>
      <div
        className={`${animationDuration75} ${getBackgroundColor(color)} -z-10 col-span-full row-span-full size-[44px] rounded-full peer-focus-within:scale-[1.18] dark:bg-transparent`}
      ></div>
    </div>
  );
}
