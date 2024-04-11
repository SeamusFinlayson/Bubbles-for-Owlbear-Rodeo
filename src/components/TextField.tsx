import { InputHTMLAttributes } from "react";

export default function TextField({
  updateHandler,
  inputProps,
  animateOnlyWhenRootActive = false,
}: {
  updateHandler: (target: HTMLInputElement) => void;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
  animateOnlyWhenRootActive?: boolean;
}): JSX.Element {
  const animationDuration100 = animateOnlyWhenRootActive
    ? "group-focus-within/root:duration-100 group-hover/root:duration-100"
    : "duration-100";

  const runUpdateHandler = (target: HTMLInputElement) => {
    updateHandler(target);
  };

  return (
    <input
      {...inputProps}
      spellCheck={false}
      onBlur={(e) => runUpdateHandler(e.target)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          runUpdateHandler(e.target as HTMLInputElement);
        }
      }}
      className={`${animationDuration100} h-[36px] w-full rounded-xl bg-black/[0.07] px-1.5 py-1 text-center text-base text-text-primary outline-none -outline-offset-2 outline-black/5 hover:outline-black/25 focus:outline-primary dark:bg-default-dark/40 dark:text-text-primary-dark dark:outline dark:outline-2 dark:outline-white/20 dark:hover:outline-white/60  dark:focus:outline-primary-dark `}
    ></input>
  );
}
