import { SVGProps } from "react";

export default function IconButton({
  Icon,
  onClick,
  rounded = "rounded-full",
  padding = "p-[2px]",
  danger = false,
  animateOnlyWhenRootActive = false,
}: {
  Icon: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  onClick: () => void;
  rounded?: string;
  padding?: string;
  danger?: boolean;
  animateOnlyWhenRootActive?: boolean;
}): JSX.Element {
  const animationDuration100 = animateOnlyWhenRootActive
    ? "group-focus-within/root:duration-100 group-hover/root:duration-100"
    : "duration-100";

  return (
    <button
      className={`group flex items-center justify-center ${rounded} ${padding} outline-none`}
      onClick={onClick}
    >
      <div
        className={`flex h-[36px] w-[36px] items-center justify-center ${animationDuration100} ${rounded} ${danger ? "group-hover:bg-red-400/60 group-focus-visible:bg-red-400/60 group-hover:dark:bg-red-400/30 group-focus-visible:dark:bg-red-400/30" : "group-hover:bg-black/10 group-focus-visible:bg-black/10 group-hover:dark:bg-white/10 group-focus-visible:dark:bg-white/10"}`}
      >
        <Icon
          className={`h-[24px] w-[24px] fill-text-secondary dark:fill-text-secondary-dark`}
        ></Icon>
      </div>
    </button>
  );
}
