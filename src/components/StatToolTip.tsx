import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { InputColor } from "@/colorHelpers";

export default function StatToolTip({
  open,
  text,
  color,
  children,
}: {
  open: boolean;
  text: string;
  color: InputColor;
  children: any;
}) {
  return (
    <Tooltip open={open}>
      <TooltipTrigger asChild>
        <div>{children}</div>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        sideOffset={-8}
        align="center"
        alignOffset={0}
        className={cn(
          "min-w-6 px-1 py-0.5 text-center text-sm font-medium leading-5",
          {
            "dark:bg-stat-red-highlight-dark": color === "RED",
            "dark:bg-stat-green-highlight-dark": color === "GREEN",
            "dark:bg-stat-blue-highlight-dark": color === "BLUE",
          },
        )}
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}
