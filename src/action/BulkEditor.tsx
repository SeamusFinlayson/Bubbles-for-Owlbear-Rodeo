import Token from "../metadataHelpers/TokenType";
import "../index.css";
import { useEffect, useReducer, useState } from "react";
import { Action, BulkEditorState } from "./types";
import Footer from "./Footer";
import Header from "./Header";
import { SceneTokensTable } from "./Tables";
import {
  getIncluded,
  getRollsFromScene,
  reducer,
  unsetStatOverwrites,
  writeTokenSortingToItems,
} from "./helpers";
import OBR, { Item } from "@owlbear-rodeo/sdk";
import { itemFilter, parseItems } from "@/metadataHelpers/itemMetadataHelpers";
import { addThemeToBody } from "@/colorHelpers";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { arrayMove } from "@dnd-kit/sortable";
import { DragEndEvent } from "@dnd-kit/core";

export default function BulkEditor(): JSX.Element {
  // App state
  const [appState, dispatch] = useReducer(reducer, {}, (): BulkEditorState => {
    return {
      operation: "none",
      showItems: "SELECTED",
      rolls: [],
      value: null,
      animateRoll: false,
      statOverwrites: unsetStatOverwrites(),
      damageScaleOptions: new Map<string, number>(),
      includedItems: new Map<string, boolean>(),
      mostRecentSelection: [],
    };
  });

  // Scene State
  const [tokens, setTokens] = useState<Token[]>([]);
  const [playerSelection, setPlayerSelection] = useState<string[]>([]);
  const [playerRole, setPlayerRole] = useState<"PLAYER" | "GM">("PLAYER");
  const [playerName, setPlayerName] = useState("");
  const [sceneReady, setSceneReady] = useState(false);

  // Tokens filter state
  const selectionFilter = (token: Token) =>
    (appState.showItems === "ALL" ||
      appState.mostRecentSelection.includes(token.item.id) ||
      getIncluded(token.item.id, appState.includedItems)) &&
    (playerRole === "GM" || !token.hideStats) &&
    !(appState.operation === "damage" && token.maxHealth <= 0) &&
    !(appState.operation === "healing" && token.maxHealth <= 0);
  const selectedTokens = tokens.filter(selectionFilter);

  function handleDragEnd(event: DragEndEvent) {
    //group is unhandled
    const { active, over } = event;
    if (over?.id && active.id !== over.id) {
      setTokens((tokens) => {
        const oldIndex = tokens.find(
          (token) => token.item.id === active.id,
        )?.index;
        const newIndex = tokens.find(
          (token) => token.item.id === over.id,
        )?.index;
        const newTokens = arrayMove(
          tokens,
          oldIndex as number,
          newIndex as number,
        );
        for (let i = 0; i < newTokens.length; i++) newTokens[i].index = i;

        writeTokenSortingToItems(newTokens);
        return newTokens;
      });
    }
  }

  // Sync tokens with scene
  const updateTokens = (items: Item[]) => {
    const newTokens = parseItems(items);
    // Guarantee initialized and ordered indices
    newTokens.sort(
      (a, b) =>
        (a.index === -1 ? newTokens.length : a.index) -
        (b.index === -1 ? newTokens.length : b.index),
    );
    for (let i = 0; i < newTokens.length; i++) newTokens[i].index = i;
    setTokens(newTokens);
  };
  useEffect(() => {
    return OBR.scene.items.onChange(updateTokens);
  }, []);

  // Handle scene ready
  useEffect(() => {
    const handleReady = (ready: boolean) => {
      setSceneReady(ready);
      if (ready) {
        OBR.scene.items.getItems(itemFilter).then(updateTokens);
        getRollsFromScene().then((rolls) =>
          dispatch({
            type: "set-rolls",
            rolls: rolls,
          }),
        );
      } else {
        setTokens([]);
      }
    };
    OBR.scene.isReady().then(handleReady);
    return OBR.scene.onReadyChange(handleReady);
  }, []);

  // Sync player
  useEffect(() => {
    const updateSelection = async (selection: string[] | undefined) => {
      setPlayerSelection(selection ? selection : []);
      const validTokenIds = (await OBR.scene.items.getItems(itemFilter)).map(
        (item) => item.id,
      );
      if (selection) {
        const selectedTokenIds = selection.filter((id) =>
          validTokenIds.includes(id),
        );
        if (selectedTokenIds.length > 0)
          dispatch({
            type: "set-most-recent-selection",
            mostRecentSelection: selectedTokenIds,
          });
      }
    };
    const updatePlayerRole = (role: "PLAYER" | "GM") => {
      setPlayerRole(role);
      if (role === "PLAYER")
        dispatch({ type: "set-operation", operation: "none" });
    };
    const updatePlayerName = (name: string) => {
      setPlayerName(name);
    };
    OBR.player.getSelection().then(updateSelection);
    OBR.player.getRole().then(updatePlayerRole);
    OBR.player.getName().then(updatePlayerName);
    return OBR.player.onChange((player) => {
      updateSelection(player.selection);
      updatePlayerRole(player.role);
      updatePlayerName(player.name);
    });
  }, []);

  // Sync rolls
  useEffect(
    () =>
      OBR.scene.onMetadataChange(async (sceneMetadata) => {
        if (sceneReady)
          dispatch({
            type: "set-rolls",
            rolls: await getRollsFromScene(sceneMetadata),
          });
      }),
    [],
  );

  // Sync theme
  useEffect(
    () => OBR.theme.onChange((theme) => addThemeToBody(theme.mode)),
    [],
  );

  const getTable = () => {
    if (playerRole === "PLAYER")
      return (
        <div className="flex h-full items-start justify-center p-2 text-mirage-400 dark:text-mirage-600">
          Token list is GM only.
        </div>
      );
    if (selectedTokens.length === 0)
      return (
        <div className="flex h-full items-start justify-center p-2 text-mirage-400 dark:text-mirage-600">
          The tokens you most recently selected on the map will be visible here.
        </div>
      );

    return (
      <SceneTokensTable
        appState={appState}
        dispatch={dispatch}
        tokens={selectedTokens}
        setTokens={setTokens}
        playerRole={playerRole}
        playerSelection={playerSelection}
        handleDragEnd={handleDragEnd}
      ></SceneTokensTable>
    );
  };

  return (
    <div className="h-full overflow-clip">
      <div className="flex h-full flex-col justify-between bg-mirage-100/90 dark:bg-mirage-940/85 dark:text-mirage-200">
        <Header
          appState={appState}
          dispatch={dispatch}
          playerRole={playerRole}
          playerName={playerName}
        ></Header>
        <ScrollArea className="h-full sm:px-4">
          <div className="flex flex-col items-center justify-start gap-2 pb-2">
            {getTable()}
            {playerRole === "GM" && (
              <ChangeShowItemsButton appState={appState} dispatch={dispatch} />
            )}
          </div>
          <ScrollBar orientation="horizontal" forceMount />
        </ScrollArea>
        <Footer
          appState={appState}
          dispatch={dispatch}
          tokens={selectedTokens}
          playerRole={playerRole}
          playerName={playerName}
        ></Footer>
      </div>
    </div>
  );
}

function ChangeShowItemsButton({
  appState,
  dispatch,
}: {
  appState: BulkEditorState;
  dispatch: React.Dispatch<Action>;
}): JSX.Element {
  return (
    <Button
      variant={"ghost"}
      onClick={() =>
        dispatch({
          type: "set-show-items",
          showItems: appState.showItems === "ALL" ? "SELECTED" : "ALL",
        })
      }
    >
      {appState.showItems === "ALL"
        ? "Show Only Selected Tokens"
        : "Show All Tokens"}
    </Button>
  );
}
