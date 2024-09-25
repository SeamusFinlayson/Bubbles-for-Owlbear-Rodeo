import { useEffect, useRef, useState } from "react";
import ChildrenBlur from "../components/ChildrenBlur";
import { Input2 } from "@/components/ui/input2";
import { Separator } from "@/components/ui/separator";
import { Parser } from "@dice-roller/rpg-dice-roller";
import { EditorMode, StampedDiceRoll } from "./types";
import { addNewRollToRolls } from "./helpers";

type CommandType = {
  code: string;
  getHintLabel: () => string;
  commandParser: (string: string) => string;
};

// Create code hint commands
const commandFactory = (
  code: string,
  hintLabel: string,
  commandParser: (string: string) => string,
): [string, CommandType] => {
  return [
    code,
    {
      code: code,
      getHintLabel: () => hintLabel,
      commandParser: commandParser,
    },
  ];
};
const commands = new Map<string, CommandType>([
  commandFactory("r", "Roll", (string: string) => {
    return validRoll(extractCommandContent(string))
      ? `Roll ${extractCommandContent(string)}`
      : "Invalid Roll";
  }),
  commandFactory("d", "Roll Damage", (string: string) => {
    return validRoll(extractCommandContent(string))
      ? `Roll ${extractCommandContent(string)} damage`
      : "Invalid Roll";
  }),
  commandFactory("h", "Roll Healing", (string: string) => {
    return validRoll(extractCommandContent(string))
      ? `Roll ${extractCommandContent(string)} healing`
      : "Invalid Roll";
  }),
  // commandFactory("t", "Set Temporary Hit Points", () => ""),
]);

// Command line text parsers
const extractCommandCode = (string: string) => {
  let code = string.substring(0, string.indexOf(" "));
  return code;
};
const getCommandCodeIndex = (code: string): boolean => {
  return commands.has(code);
};
const extractCommandContent = (string: string) => {
  string = string.substring(string.indexOf(" ") + 1);
  string = string.replace(/\s/g, "");
  string = string.replaceAll("+", " + ");
  string = string.replaceAll("-", " - ");
  // const diceStatementRegex = new RegExp(
  //   /^((\d+|(\d+d\d)+)\+)*(\d+|(\d+d\d+))$/g,
  // );
  // let validDiceStatement = diceStatementRegex.test(string);
  return string;
};
const validRoll = (string: string) => {
  let valid = true;
  try {
    Parser.parse(string);
  } catch (error) {
    valid = false;
  }
  return valid;
};

export default function Command({
  setEditorMode,
  setStampedRolls,
  setAnimateRoll,
}: {
  setEditorMode: React.Dispatch<React.SetStateAction<EditorMode>>;
  setStampedRolls: React.Dispatch<React.SetStateAction<StampedDiceRoll[]>>;
  setAnimateRoll: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element {
  const [inputContent, setInputContent] = useState("");
  const [selection, setSelection] = useState(0);
  const [hasFocus, setHasFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.code === "KeyK" && e.ctrlKey) {
        e.stopPropagation();
        e.preventDefault();
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }
    });
  }, []);

  const executeCommandMap = new Map<string, () => void>();
  const indexCodeMap = new Map<number, string>();
  let commandCount = 0;

  let commandItems: JSX.Element[] = [];
  const commandCode = extractCommandCode(inputContent);
  if (getCommandCodeIndex(commandCode)) {
    if (commands.has(commandCode)) {
      const executeCommand = () => {
        if (validRoll(extractCommandContent(inputContent))) {
          // Get roll
          const diceExpression = extractCommandContent(inputContent);
          const addToRolls = () => {
            setStampedRolls((prevRolls) =>
              addNewRollToRolls(prevRolls, diceExpression, setAnimateRoll),
            );
          };
          switch (commandCode) {
            case "r":
              addToRolls();
              break;
            case "d":
              addToRolls();
              setEditorMode("damage");
              break;
            case "h":
              addToRolls();
              setEditorMode("healing");
              break;
            case "t":
              addToRolls();
              break;
          }
          // Unfocus command line
          if (inputRef.current) inputRef.current.blur();
        }
      };

      commandCount++;
      indexCodeMap.set(commandCount, "roll demo");
      executeCommandMap.set("roll demo", executeCommand);

      const command = commands.get(commandCode);

      if (command)
        commandItems.push(
          <CommandItem
            key={"x"}
            selection={selection}
            value={commandCount}
            onSelectionConfirm={executeCommand}
          >
            <div className="pl-1">{command.commandParser(inputContent)}</div>
            {commandCount === selection && (
              <div className="ml-auto justify-end text-mirage-500 dark:text-mirage-500">
                enter
              </div>
            )}
          </CommandItem>,
        );
    }
  } else {
    for (const command of commands) {
      const executeCommand = () => {
        setInputContent(`${command[0]} `);
        if (inputRef.current) inputRef.current.focus();
      };

      commandCount++;
      indexCodeMap.set(commandCount, command[0]);
      executeCommandMap.set(command[0], executeCommand);

      commandItems.push(
        <CommandItem
          key={command[1].getHintLabel()}
          selection={selection}
          value={commandCount}
          // onSelectorFocus={() => setInputContent(command.applyCode(false))}
          onSelectionConfirm={executeCommand}
        >
          <div
            className={
              (commandCount === selection
                ? "bg-mirage-50 dark:bg-mirage-800"
                : "bg-mirage-50 hover:bg-mirage-50/70 dark:bg-mirage-900 dark:hover:bg-mirage-800/70") +
              " " +
              "flex size-6 items-center justify-center rounded-sm drop-shadow"
            }
          >
            {command[0]}
          </div>
          <div>{command[1].getHintLabel()}</div>
          {commandCount === selection && (
            <div className="ml-auto justify-end text-mirage-500 dark:text-mirage-500">
              enter
            </div>
          )}
        </CommandItem>,
      );
    }
  }

  if (selection > commandItems.length || selection < 1) setSelection(1);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const previousItem = () => {
      if (selection > 1) setSelection(selection - 1);
      else setSelection(commandItems.length);
      event.preventDefault();
    };
    const nextItem = () => {
      if (selection < commandItems.length) setSelection(selection + 1);
      else setSelection(1);
      event.preventDefault();
    };

    switch (event.key) {
      case "Escape":
        if (inputRef.current) inputRef.current.blur();
        event.preventDefault();
        break;
      case "ArrowUp":
        previousItem();
        break;
      case "ArrowDown":
        nextItem();
        break;
      case "Tab":
        if (event.shiftKey) previousItem();
        else nextItem();
        break;
      case "Enter":
        const selectionCode = indexCodeMap.get(selection);
        if (selectionCode) {
          const executeCommand = executeCommandMap.get(selectionCode);
          if (executeCommand) executeCommand();
        }
        break;
    }
    // console.log(event.key);
  };

  return (
    <div className="relative z-10 h-[40px] w-[500px] flex-grow overflow-visible">
      <ChildrenBlur onBlur={() => setHasFocus(false)}>
        <div className="rounded-md border border-mirage-300 bg-mirage-50 shadow-sm dark:border-mirage-800 dark:bg-mirage-950 focus-within:[&:has(:focus-visible)]:border-transparent focus-within:[&:has(:focus-visible)]:ring-2 focus-within:[&:has(:focus-visible)]:ring-primary dark:focus-within:[&:has(:focus-visible)]:ring-primary-dark">
          <Input2
            ref={inputRef}
            placeholder="Enter a command (ctrl+k)"
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e)}
            onFocus={() => setHasFocus(true)}
            autoFocus
          />
          {document.activeElement === inputRef.current && (
            <div className="flex flex-col gap-1 p-2 pt-0">
              <Separator className="mt-0"></Separator>
              {commandItems}
            </div>
          )}
        </div>
      </ChildrenBlur>
    </div>
  );
}

function CommandItem({
  value,
  selection,
  onSelectorFocus,
  onSelectionConfirm,
  children,
}: {
  value: number;
  selection: number;
  onSelectorFocus?: () => void;
  onSelectionConfirm: () => void;
  children: any;
}): JSX.Element {
  useEffect(() => {
    if (onSelectorFocus && value === selection) onSelectorFocus();
  }, [selection]);

  return (
    <div
      className={
        (value === selection
          ? "bg-mirage-100 dark:bg-mirage-900"
          : "bg-transparent hover:bg-mirage-100/70 dark:bg-transparent dark:hover:bg-mirage-900/70") +
        " " +
        "flex w-full items-center gap-2 rounded-sm p-2 pr-4 text-sm"
      }
      onClick={(e) => {
        e.stopPropagation();
        onSelectionConfirm();
      }}
    >
      {children}
    </div>
  );
}
