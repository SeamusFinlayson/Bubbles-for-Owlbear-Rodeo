import {
  AttachmentBehavior,
  Item,
  buildCurve,
  buildShape,
  buildText,
} from "@owlbear-rodeo/sdk";
import { createRoundedRectangle, getFillPortion } from "./mathHelpers";

// Constants used in multiple functions
const FONT_SIZE = 22;
const FONT = "Roboto, sans-serif";
const DISABLE_HIT = false;
const BACKGROUND_OPACITY = 0.6;
const DISABLE_ATTACHMENT_BEHAVIORS: AttachmentBehavior[] = [
  "ROTATION",
  "VISIBLE",
  // "COPY",
  "SCALE",
  // "POSITION",
];
export const TEXT_VERTICAL_OFFSET = 1.5;
const LINE_HEIGHT = 0.8;

// Constants used in createStatBubble()
export const DIAMETER = 30;
const CIRCLE_FONT_SIZE = DIAMETER - 8;
const REDUCED_CIRCLE_FONT_SIZE = DIAMETER - 15;
const CIRCLE_TEXT_HEIGHT = DIAMETER + 0;

/** Creates Stat Bubble component items */
export function createStatBubble(
  item: Item,
  value: number,
  color: string,
  position: { x: number; y: number },
  label: string,
): Item[] {
  const bubbleShape = buildShape()
    .width(DIAMETER)
    .height(DIAMETER)
    .shapeType("CIRCLE")
    .fillColor(color)
    .fillOpacity(BACKGROUND_OPACITY)
    .strokeColor(color)
    .strokeOpacity(0.5)
    .strokeWidth(0)
    .position({ x: position.x, y: position.y })
    .attachedTo(item.id)
    .layer("ATTACHMENT")
    .locked(true)
    .id(`${item.id + label}-background`)
    .visible(item.visible)
    .disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
    .disableHit(DISABLE_HIT)
    .build();

  const valueText = value.toString();

  const bubbleText = buildText()
    .position({
      x: position.x - DIAMETER / 2,
      y: position.y - DIAMETER / 2 + TEXT_VERTICAL_OFFSET - 0.7,
    })
    .plainText(valueText.length > 3 ? String.fromCharCode(0x2026) : valueText)
    .textAlign("CENTER")
    .textAlignVertical("MIDDLE")
    .fontSize(
      valueText.length === 3 ? REDUCED_CIRCLE_FONT_SIZE : CIRCLE_FONT_SIZE,
    )
    .fontFamily(FONT)
    .textType("PLAIN")
    .height(CIRCLE_TEXT_HEIGHT)
    .width(DIAMETER)
    .fontWeight(400)
    //.strokeColor("black")
    //.strokeWidth(0)
    .attachedTo(item.id)
    .layer("TEXT")
    .locked(true)
    .lineHeight(LINE_HEIGHT)
    .id(`${item.id + label}-label`)
    .visible(item.visible)
    .disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
    .disableHit(DISABLE_HIT)
    .build();

  return [bubbleShape, bubbleText];
}

// Constants used in createHealthBar()
const BAR_PADDING = 2;
const HEALTH_OPACITY = 0.5;
export const FULL_BAR_HEIGHT = 20;
const SHORT_BAR_HEIGHT = 12;
const BAR_CORNER_RADIUS = FULL_BAR_HEIGHT / 2;

/** Creates health bar component items */
export function createHealthBar(
  item: Item,
  bounds: { width: number; height: number },
  health: number,
  maxHealth: number,
  statsVisible: boolean,
  origin: { x: number; y: number },
  variant: "full" | "short" = "full",
  segments = 0,
): Item[] {
  let barHeight: number;
  if (variant === "short") {
    barHeight = SHORT_BAR_HEIGHT;
  } else {
    barHeight = FULL_BAR_HEIGHT;
  }
  const position = {
    x: origin.x - bounds.width / 2 + BAR_PADDING,
    y: origin.y - barHeight - 2,
  };
  const barWidth = bounds.width - BAR_PADDING * 2;
  const barTextHeight = barHeight + 0;
  const setVisibilityProperty = item.visible;

  let healthBackgroundColor = "#A4A4A4";
  if (!statsVisible) {
    healthBackgroundColor = "black";
  }

  const backgroundShape = buildCurve()
    .fillColor(healthBackgroundColor)
    .fillOpacity(BACKGROUND_OPACITY)
    .strokeWidth(0)
    .position({ x: position.x, y: position.y })
    .attachedTo(item.id)
    .layer("ATTACHMENT")
    .locked(true)
    .id(`${item.id}health-background`)
    .visible(setVisibilityProperty)
    .disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
    .disableHit(DISABLE_HIT)
    .tension(0)
    .closed(true)
    .points(createRoundedRectangle(barWidth, barHeight, BAR_CORNER_RADIUS))
    .build();

  const healthFillPortion = getFillPortion(health, maxHealth, segments);

  const healthShape = buildCurve()
    .fillColor("red")
    .fillOpacity(HEALTH_OPACITY)
    .strokeWidth(0)
    .strokeOpacity(0)
    .position({ x: position.x, y: position.y })
    .attachedTo(item.id)
    .layer("ATTACHMENT")
    .locked(true)
    .id(`${item.id}health`)
    .visible(setVisibilityProperty)
    .disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
    .disableHit(DISABLE_HIT)
    .tension(0)
    .closed(true)
    .points(
      createRoundedRectangle(
        barWidth,
        barHeight,
        BAR_CORNER_RADIUS,
        healthFillPortion,
      ),
    )
    .build();

  if (variant === "short") {
    return [backgroundShape, healthShape];
  }

  const healthText = buildText()
    .position({ x: position.x, y: position.y + TEXT_VERTICAL_OFFSET })
    .plainText(`${health}/${maxHealth}`)
    .textAlign("CENTER")
    .textAlignVertical("TOP")
    .fontSize(FONT_SIZE)
    .fontFamily(FONT)
    .textType("PLAIN")
    .height(barTextHeight)
    .width(barWidth)
    .fontWeight(400)
    //.strokeColor("black")
    //.strokeWidth(0)
    .attachedTo(item.id)
    .fillOpacity(1)
    .layer("TEXT")
    .lineHeight(LINE_HEIGHT)
    .locked(true)
    .id(`${item.id}health-label`)
    .visible(setVisibilityProperty)
    .disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
    .disableHit(DISABLE_HIT)
    .build();

  return [backgroundShape, healthShape, healthText];
}

// Constants used in createNameTag()
export const APPROXIMATE_LETTER_WIDTH = 12;
export const NAME_TAG_HEIGHT = 26;

/** Create name tag component items */
export function createNameTagText(
  item: Item,
  plainText: string,
  position: { x: number; y: number },
  invisible = false,
): Item[] {
  const nameTagText = buildText()
    .position(position)
    .plainText(plainText)
    .textAlign("CENTER")
    .textAlignVertical("MIDDLE")
    .fontSize(FONT_SIZE)
    .fontFamily(FONT)
    .textType("PLAIN")
    .height(NAME_TAG_HEIGHT)
    .fontWeight(400)
    .attachedTo(invisible ? "none" : item.id)
    .fillOpacity(invisible ? 0 : 0.87)
    .layer("TEXT")
    .locked(true)
    .id(invisible ? getNameTagTextTestId(item.id) : `${item.id}name-tag-text`)
    .visible(item.visible)
    .disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
    .disableHit(DISABLE_HIT)
    .build();

  return [nameTagText];
}

export const TEXT_BG_PADDING = 4;
const TEXT_BG_CORNER_RADIUS = 12;

/** Create name tag component items */
export function createNameTagBackground(
  item: Item,
  position: { x: number; y: number },
  size: { width: number; height: number },
): Item {
  const nameTagBackground = buildCurve()
    .fillColor("#3a3c4d")
    .fillOpacity(0.6)
    .strokeWidth(0)
    .position(position)
    .attachedTo(item.id)
    .layer("ATTACHMENT")
    .locked(true)
    .id(`${item.id}name-tag-background`)
    .visible(item.visible)
    .disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
    .disableHit(DISABLE_HIT)
    .tension(0)
    .closed(true)
    .points(
      createRoundedRectangle(
        size.width + TEXT_BG_PADDING * 2,
        size.height + TEXT_BG_PADDING * 2,
        TEXT_BG_CORNER_RADIUS,
      ),
    )
    .build();

  return nameTagBackground;
}

export function getNameTagTextId(itemId: string) {
  return `${itemId}name-tag-text`;
}

export function getNameTagTextTestId(itemId: string) {
  return `${itemId}name-tag-text-test`;
}

export function getNameTagBackgroundId(itemId: string) {
  return `${itemId}name-tag-background`;
}

export function addAllExtensionAttachmentsToArray(
  array: any[],
  itemId: string,
) {
  addHealthAttachmentsToArray(array, itemId);
  addArmorAttachmentsToArray(array, itemId);
  addTempHealthAttachmentsToArray(array, itemId);
  addNameTagAttachmentsToArray(array, itemId);
}

export function addHealthAttachmentsToArray(array: any[], itemId: string) {
  array.push(
    `${itemId}health-background`,
    `${itemId}health`,
    `${itemId}health-label`,
  );
}

export function addArmorAttachmentsToArray(array: any[], itemId: string) {
  array.push(`${itemId}ac-background`, `${itemId}ac-label`);
}

export function addTempHealthAttachmentsToArray(array: any[], itemId: string) {
  array.push(`${itemId}temp-hp-background`, `${itemId}temp-hp-label`);
}

export function addNameTagAttachmentsToArray(array: any[], itemId: string) {
  array.push(
    `${itemId}name-tag-background`,
    `${itemId}name-tag-text`,
    `${itemId}name-tag-text-test`,
  );
}

export function addNameTagTestAttachmentsToArray(array: any[], itemId: string) {
  array.push(`${itemId}name-tag-text-test`);
}
