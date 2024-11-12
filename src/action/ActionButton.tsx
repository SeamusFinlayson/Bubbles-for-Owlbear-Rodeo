import { Button } from "@/components/ui/button";

export default function ActionButton({
  label,
  buttonProps,
}: {
  label: string;
  buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
}): JSX.Element {
  return (
    <Button
      key={label}
      className="w-full"
      variant={"secondary"}
      {...buttonProps}
    >
      {label}
    </Button>
  );
}
