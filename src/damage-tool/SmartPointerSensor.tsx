import { MouseSensor } from "@dnd-kit/core";
import type { MouseEvent } from "react";

export class SmartMouseSensor extends MouseSensor {
  static activators = [
    {
      eventName: "onMouseDown" as any,
      handler: ({ nativeEvent: event }: MouseEvent) => {
        if (
          event.button !== 0 ||
          isInteractiveElement(event.target as Element)
        ) {
          return false;
        }

        return true;
      },
    },
  ];
}
function isInteractiveElement(element: Element | null) {
  const interactiveElements = [
    // "button",
    "input",
    "textarea",
    "select",
    "option",
  ];
  if (
    element?.tagName &&
    interactiveElements.includes(element.tagName.toLowerCase())
  ) {
    return true;
  }

  return false;
}
