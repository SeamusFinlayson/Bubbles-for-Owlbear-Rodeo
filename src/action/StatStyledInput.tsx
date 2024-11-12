import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { InputName } from "@/statInputHelpers";
import { InputHTMLAttributes } from "react";

export default function StatStyledInput({
  name,
  inputProps,
}: {
  name: InputName;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Input
          {...inputProps}
          name={name}
          className={cn(
            "h-[32px]",
            "w-[60px]",
            {
              "bg-stat-red/10 dark:bg-stat-red-dark/5":
                name === "health" || name === "maxHealth",
              "bg-stat-green/10 dark:bg-stat-green-dark/5":
                name === "tempHealth",
              "bg-stat-blue/10 dark:bg-stat-blue-dark/5": name === "armorClass",
            },
            inputProps?.className,
          )}
        />
      </TooltipTrigger>
      <TooltipContent>
        <p>{nameToLabel(name)}</p>
      </TooltipContent>
    </Tooltip>
  );
}

const nameToLabel = (name: InputName) => {
  switch (name) {
    case "health":
      return "Current Hit Points";
    case "maxHealth":
      return "Hit Points Maximum";
    case "tempHealth":
      return "Temporary Hit Points";
    case "armorClass":
      return "Armor Class";
  }
};
