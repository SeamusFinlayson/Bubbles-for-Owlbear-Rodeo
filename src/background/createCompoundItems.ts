import {
  AttachmentBehavior,
  Item,
  Vector2,
  buildCurve,
  buildShape,
  buildText,
} from "@owlbear-rodeo/sdk";

// Constants used in multiple functions
const FONT_SIZE = 22;
const FONT = "Roboto, sans-serif";
const DISABLE_HIT = true;
const BACKGROUND_OPACITY = 0.6;
const DISABLE_ATTACHMENT_BEHAVIORS: AttachmentBehavior[] = [
  "ROTATION",
  "VISIBLE",
  "COPY",
  "SCALE",
];
const TEXT_VERTICAL_OFFSET = 2;

// Constants used in createStatBubble()
export const DIAMETER = 30;
const CIRCLE_FONT_SIZE = DIAMETER - 8;
const REDUCED_CIRCLE_FONT_SIZE = DIAMETER - 15;
const CIRCLE_TEXT_HEIGHT = DIAMETER + 0;

/** Creates Stat Bubble component items */
export function createStatBubble(
  item: Item,
  bounds: { width: number; height: number },
  value: number,
  color: string,
  position: { x: number; y: number },
  label: string,
): Item[] {
  const bubbleShape = buildShape()
    .width(bounds.width)
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
      y: position.y - DIAMETER / 2 + TEXT_VERTICAL_OFFSET + 0.3,
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

  const backgroundPoints: Vector2[] = createRoundRectangle(barWidth, barHeight);

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
    .points(backgroundPoints)
    .build();

  let healthPercentage: number;
  if (health <= 0) {
    healthPercentage = 0;
  } else if (health < maxHealth) {
    if (segments === 0) {
      healthPercentage = health / maxHealth;
    } else {
      healthPercentage = Math.ceil((health / maxHealth) * segments) / segments;
    }
  } else if (health >= maxHealth) {
    healthPercentage = 1;
  } else {
    healthPercentage = 0;
  }

  const healthFillPoints: Vector2[] = createRoundRectangle(
    barWidth,
    barHeight,
    healthPercentage,
  );

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
    .points(healthFillPoints)
    .build();

  if (variant === "short") {
    return [backgroundShape, healthShape];
  }

  const healthText = buildText()
    .position({ x: position.x, y: position.y + TEXT_VERTICAL_OFFSET })
    .plainText(`${health}/${maxHealth}`)
    .textAlign("CENTER")
    .textAlignVertical("MIDDLE")
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
    .locked(true)
    .id(`${item.id}health-label`)
    .visible(setVisibilityProperty)
    .disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
    .disableHit(DISABLE_HIT)
    .build();

  return [backgroundShape, healthShape, healthText];
}

// Constants used in createNameTag()
const LETTER_WIDTH = 14;
const NAME_TAG_HEIGHT = 26;

/** Create name tag component items */
export function createNameTag(
  item: Item,
  origin: { x: number; y: number },
  nameTagVisible: boolean,
): Item[] {
  const nameTagWidth = LETTER_WIDTH * item.name.length + 4;

  const setVisibilityProperty = item.visible;

  let nameTagBackgroundColor = "darkgrey";
  if (!nameTagVisible) {
    nameTagBackgroundColor = "black";
  }

  const nameTagTextHeight = NAME_TAG_HEIGHT + 0;

  const position = {
    x: origin.x - nameTagWidth / 2,
    y: origin.y,
  };

  const nameTagBackground = buildShape()
    .width(nameTagWidth)
    .height(NAME_TAG_HEIGHT)
    .shapeType("RECTANGLE")
    .fillColor(nameTagBackgroundColor)
    .fillOpacity(BACKGROUND_OPACITY)
    .strokeWidth(0)
    .position({ x: position.x, y: position.y })
    .attachedTo(item.id)
    .layer("ATTACHMENT")
    .locked(true)
    .id(`${item.id}name-tag-background`)
    .visible(setVisibilityProperty)
    .disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
    .disableHit(DISABLE_HIT)
    .build();

  const nameTagText = buildText()
    .position({ x: position.x, y: position.y + TEXT_VERTICAL_OFFSET })
    .plainText(item.name)
    .textAlign("CENTER")
    .textAlignVertical("MIDDLE")
    .fontSize(FONT_SIZE)
    .fontFamily(FONT)
    .textType("PLAIN")
    .height(nameTagTextHeight)
    .width(nameTagWidth)
    .fontWeight(400)
    //.strokeColor("black")
    //.strokeWidth(0)
    .attachedTo(item.id)
    .fillOpacity(1)
    .layer("TEXT")
    .locked(true)
    .id(`${item.id}name-tag-text`)
    .visible(setVisibilityProperty)
    .disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
    .disableHit(DISABLE_HIT)
    .build();

  return [nameTagBackground, nameTagText];
}

function createRoundRectangle(
  maxLength: number,
  height: number,
  fill: number = 1,
): Vector2[] {
  const radius = height / 2;

  if (fill === 1) {
    // Draw full shape
    return [
      { x: radius, y: 0 },
      { x: maxLength - radius, y: 0 },
      ...drawCircle(
        { x: maxLength - radius, y: height / 2 },
        radius,
        Math.PI / 2,
        -Math.PI,
        30,
      ),
      { x: maxLength - radius, y: height },
      { x: 0 + radius, y: height },
      ...drawCircle(
        { x: radius, y: height / 2 },
        radius,
        -Math.PI / 2,
        -Math.PI,
        30,
      ),
    ];
  }

  const barLength = fill * maxLength;
  if (barLength < radius) {
    // Draw only the first end
    const referenceAngle = Math.acos((radius - barLength) / radius);

    return [
      ...drawCircle(
        { x: radius, y: height / 2 },
        radius,
        Math.PI - referenceAngle,
        referenceAngle * 2,
        16,
      ),
    ];
  }

  const remainingBarLength = maxLength - barLength;
  if (remainingBarLength < radius) {
    // Draw the first end the middle and part of the second end
    const referenceAngle = Math.acos((radius - remainingBarLength) / radius);

    return [
      { x: radius, y: 0 },
      { x: maxLength - radius, y: 0 },
      ...drawCircle(
        { x: maxLength - radius, y: height / 2 },
        radius,
        Math.PI / 2,
        -Math.PI / 2 + referenceAngle,
        8,
      ),
      ...drawCircle(
        { x: maxLength - radius, y: height / 2 },
        radius,
        -referenceAngle,
        -Math.PI / 2 + referenceAngle,
        8,
      ),
      { x: maxLength - radius, y: height },
      { x: radius, y: height },
      ...drawCircle(
        { x: radius, y: height / 2 },
        radius,
        -Math.PI / 2,
        -Math.PI,
        30,
      ),
    ];
  }

  // Draw the first end and the middle
  return [
    { x: radius, y: 0 },
    { x: barLength, y: 0 },
    { x: barLength, y: height },
    { x: radius, y: height },
    ...drawCircle(
      { x: radius, y: height / 2 },
      radius,
      -Math.PI / 2,
      -Math.PI,
      30,
    ),
  ];
}

/** Draw a portion of a circle.
 * @param center Center coordinates of the circle.
 * @param startAngle Angle from standard position to start at in radians.
 * @param arcAngle  Angle from standard position to end at in radians.
 * @param points Number of points along the arc to generate.
 */
function drawCircle(
  center: Vector2,
  radius: number,
  startAngle: number,
  arcAngle: number,
  arcPoints: number,
): Vector2[] {
  const pointsArray: Vector2[] = [];
  for (let i = 1; i < arcPoints; i++) {
    const angle = startAngle + (arcAngle * i) / arcPoints;
    pointsArray.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y - radius * Math.sin(angle),
    });
  }
  return pointsArray;
}
