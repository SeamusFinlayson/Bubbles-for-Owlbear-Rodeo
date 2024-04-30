import { InputHTMLAttributes, useEffect, useState } from "react";
import { getBackgroundColor } from "../colorHelpers";

export default function BarInput({
  parentValue,
  parentMax,
  color,
  valueUpdateHandler,
  maxUpdateHandler,
  valueInputProps,
  maxInputProps,
  animateOnlyWhenRootActive = false,
}: {
  parentValue: number;
  parentMax: number;
  color: number;
  valueUpdateHandler: (target: HTMLInputElement) => Promise<void>;
  maxUpdateHandler: (target: HTMLInputElement) => Promise<void>;
  valueInputProps?: InputHTMLAttributes<HTMLInputElement>;
  maxInputProps?: InputHTMLAttributes<HTMLInputElement>;
  animateOnlyWhenRootActive?: boolean;
}): JSX.Element {
  const [value, setValue] = useState<string>(parentValue.toString());
  const [valueInputUpdateFlag, setValueInputUpdateFlag] = useState(false);
  let ignoreBlur = false;

  if (valueInputUpdateFlag) {
    setValue(parentValue.toString());
    setValueInputUpdateFlag(false);
  }

  useEffect(() => setValueInputUpdateFlag(true), [parentValue]);

  const [max, setMax] = useState<string>(parentMax.toString());
  const [maxInputUpdateFlag, setMaxInputUpdateFlag] = useState(false);

  if (maxInputUpdateFlag) {
    setMax(parentMax.toString());
    setMaxInputUpdateFlag(false);
  }

  useEffect(() => setMaxInputUpdateFlag(true), [parentMax]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    event.target.select();
  };

  const runUpdateHandler = (
    e:
      | React.FocusEvent<HTMLInputElement, Element>
      | React.KeyboardEvent<HTMLInputElement>,
    field: "value" | "max",
  ) => {
    if (field === "value") {
      valueUpdateHandler(e.target as HTMLInputElement).then(() =>
        setValueInputUpdateFlag(true),
      );
    } else {
      maxUpdateHandler(e.target as HTMLInputElement).then(() =>
        setValueInputUpdateFlag(true),
      );
    }
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
        className={`${animationDuration75} ${getBackgroundColor(color)} peer col-span-full row-span-full flex h-[44px] w-[100px] flex-row justify-between rounded-xl pb-[2px] outline-0 dark:outline dark:outline-2 dark:-outline-offset-2 dark:outline-white/40 dark:focus-within:outline-offset-0 dark:focus-within:outline-white/60`}
      >
        <input
          {...valueInputProps}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={(e) => {
            if (!ignoreBlur) runUpdateHandler(e, "value");
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
          onFocus={handleFocus}
          className={`${animationDuration100} size-[44px] rounded-xl bg-transparent text-center font-medium text-text-primary outline-none hover:bg-white/10 focus:bg-white/15 dark:text-text-primary-dark dark:hover:bg-black/10 dark:focus:bg-black/15`}
          placeholder=""
        ></input>
        <div className="self-center pt-[2px] text-text-primary dark:text-text-primary-dark">
          /
        </div>
        <input
          {...maxInputProps}
          value={max}
          onChange={(e) => setMax(e.target.value)}
          onBlur={(e) => {
            if (!ignoreBlur) runUpdateHandler(e, "max");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              (e.target as HTMLInputElement).blur();
            } else if (e.key === "Escape") {
              ignoreBlur = true;
              (e.target as HTMLInputElement).blur();
              ignoreBlur = false;
              setMax(parentMax.toString());
            }
          }}
          onFocus={handleFocus}
          className={`${animationDuration100} size-[44px] rounded-xl bg-transparent text-center font-medium text-text-primary outline-none hover:bg-white/10 focus:bg-white/15 dark:text-text-primary-dark dark:hover:bg-black/10 dark:focus:bg-black/15`}
          placeholder=""
        ></input>
      </div>
      <div
        className={`${animationDuration75} ${getBackgroundColor(color)} -z-10 col-span-full row-span-full h-[44px] w-[100px] rounded-xl peer-focus-within:scale-x-[1.08] peer-focus-within:scale-y-[1.18] dark:bg-transparent`}
      ></div>
    </div>
  );
}
