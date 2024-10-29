import { InputHTMLAttributes } from "react";

export default function NameInput({
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
      className={`${animationDuration100} h-[36px] w-full rounded-xl bg-mirage-950/5 px-1.5 py-1 text-center text-base text-text-primary outline-none -outline-offset-2 outline-mirage-950/10 hover:outline-black/25 focus:outline-primary dark:bg-mirage-950/40 dark:text-text-primary-dark dark:outline dark:outline-2 dark:outline-white/20 dark:hover:outline-white/60 dark:focus:outline-primary-dark`}
    ></input>
  );
}
