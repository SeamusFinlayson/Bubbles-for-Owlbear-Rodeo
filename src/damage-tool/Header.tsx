import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Command from "./Command";
import { Operation, StampedDiceRoll } from "./types";
import { Button } from "@/components/ui/button";

export default function Header({
  operation,
  setOperation,
  setStampedRolls: setRolls,
  setAnimateRoll,
}: {
  operation: Operation;
  setOperation: React.Dispatch<React.SetStateAction<Operation>>;
  setStampedRolls: React.Dispatch<React.SetStateAction<StampedDiceRoll[]>>;
  setAnimateRoll: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  return (
    <div className="flex gap-4 bg-mirage-900 p-4 pb-2 pt-3">
      <Command
        setOperation={setOperation}
        setStampedRolls={setRolls}
        setAnimateRoll={setAnimateRoll}
      ></Command>
      <Select
        value={operation}
        onValueChange={(value) => {
          setOperation(value as Operation);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Editor Mode" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Operation</SelectLabel>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="damage">Damage</SelectItem>
            <SelectItem value="healing">Heal</SelectItem>
            <SelectItem value="overwrite">Overwrite Multiple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button size={"icon"} variant={"outline"}>
        {" i "}
      </Button>
    </div>
  );
}
