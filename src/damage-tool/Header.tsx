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
import { Action, BulkEditorState, Operation } from "./types";
import { Button } from "@/components/ui/button";

export default function Header({
  appState,
  dispatch,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
}): JSX.Element {
  return (
    <div className="flex gap-4 p-4 pb-2 pt-3 dark:bg-mirage-900">
      <Command dispatch={dispatch}></Command>
      <Select
        value={appState.operation}
        onValueChange={(value) => {
          dispatch({ type: "set-operation", operation: value as Operation });
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
