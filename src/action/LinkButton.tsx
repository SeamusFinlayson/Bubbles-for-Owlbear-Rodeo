import { cn } from "@/lib/utils";

export default function LinkButton({
  icon,
  href,
  size,
}: {
  icon: JSX.Element;
  href: string;
  size?: "base" | "large";
}): JSX.Element {
  return (
    <a
      className={cn(
        "flex items-center justify-center border border-mirage-300 fill-mirage-950 stroke-mirage-950 outline-none hover:bg-mirage-200 focus-visible:ring-2 focus-visible:ring-primary dark:border-mirage-800 dark:fill-mirage-50 dark:stroke-mirage-50 dark:hover:bg-mirage-800 dark:focus-visible:ring-primary-dark",
        {
          "size-[36px] rounded-lg": size === "base" || size === undefined,
          "size-10 rounded-full": size === "large",
        },
      )}
      target="_blank"
      rel="noreferrer noopener"
      href={href}
    >
      {icon}
    </a>
  );
}