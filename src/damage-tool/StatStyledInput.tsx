import { Input } from "@/components/ui/input";
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
    <Input
      {...inputProps}
      name={name}
      className={cn(
        "h-[32px]",
        "w-[60px]",
        { "md:w-[65px] lg:w-[70px]": !inputProps?.className },
        {
          "bg-stat-light-health/10 dark:bg-stat-dark-health/5":
            name === "health" || name === "maxHealth",
          "bg-stat-light-temp/10 dark:bg-stat-dark-temp/5":
            name === "tempHealth",
          "bg-stat-light-armor/10 dark:bg-stat-dark-armor/5":
            name === "armorClass",
        },
        inputProps?.className,
      )}
    />
  );
}
