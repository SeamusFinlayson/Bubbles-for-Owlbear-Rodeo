import {
	AttachmentBehavior,
	Item,
	buildShape,
	buildText,
} from "@owlbear-rodeo/sdk";

const FONT_SIZE = 22;
const FONT = "Lucida Console, monospace";
const DISABLE_HIT = true;
const BACKGROUND_OPACITY = 0.6
const DISABLE_ATTACHMENT_BEHAVIORS: AttachmentBehavior[] = [
    "ROTATION",
    "VISIBLE",
    "COPY",
    "SCALE",
];
const DIAMETER = 30;
const BAR_HEIGHT = 20;

/** Creates Stat Bubble component items */
export function createStatBubble(
	item: Item,
	bounds: { width: number; height: number },
	value: number,
	color: string,
	position: { x: number; y: number },
	label: string,
): Item[] {
	const diameter = 30;

	const circleFontSize = diameter - 8;
	const reducedCircleFontSize = diameter - 15;
	const circleTextHeight = diameter + 0;
	const textVerticalOffset = 1.5;

	const bubbleShape = buildShape()
		.width(bounds.width)
		.height(diameter)
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
		.id(item.id + label + "-background")
		.visible(item.visible)
		.disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
		.disableHit(DISABLE_HIT)
		.build();

	const valueText = value.toString();

	const bubbleText = buildText()
		.position({
			x: position.x - diameter / 2 - (valueText.length >= 3 ? 0.2 : 0.5),
			y: position.y - diameter / 2 + textVerticalOffset,
		})
		.plainText(valueText.length > 3 ? String.fromCharCode(0x2026) : valueText)
		.textAlign("CENTER")
		.textAlignVertical("MIDDLE")
		.fontSize(valueText.length === 3 ? reducedCircleFontSize : circleFontSize)
		.fontFamily(FONT)
		.textType("PLAIN")
		.height(circleTextHeight)
		.width(diameter)
		.fontWeight(400)
		//.strokeColor("black")
		//.strokeWidth(0)
		.attachedTo(item.id)
		.layer("TEXT")
		.locked(true)
		.id(item.id + label + "ac-label")
		.visible(item.visible)
		.disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
		.disableHit(DISABLE_HIT)
		.build();

	return [bubbleShape, bubbleText];
}

/** Creates health bar component items */
export function createHealthBar(
	item: Item,
	bounds: { width: number; height: number },
	health: number,
	maxHealth: number,
	statsVisible: boolean,
	position: { x: number; y: number },
	variant: "full" | "short" = "full",
	segments = 0,
): Item[] {
	let barHeight: number;
	if (variant === "short") {
		barHeight = 12;
	} else {
		barHeight = 20;
	}
	const barPadding = 2;
	const barWidth = bounds.width - barPadding * 2;
	const barTextHeight = barHeight + 0;
	const textVerticalOffset = 1.5;
	const healthOpacity = 0.5;
	const setVisibilityProperty = item.visible;

	let healthBackgroundColor = "#A4A4A4";
	if (!statsVisible) {
		healthBackgroundColor = "black";
	}

	const backgroundShape = buildShape()
		.width(barWidth)
		.height(barHeight)
		.shapeType("RECTANGLE")
		.fillColor(healthBackgroundColor)
		.fillOpacity(BACKGROUND_OPACITY)
		.strokeWidth(0)
		.position({ x: position.x, y: position.y })
		.attachedTo(item.id)
		.layer("ATTACHMENT")
		.locked(true)
		.id(item.id + "health-background")
		.visible(setVisibilityProperty)
		.disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
		.disableHit(DISABLE_HIT)
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

	const healthShape = buildShape()
		.width(healthPercentage === 0 ? 0 : barWidth * healthPercentage)
		.height(barHeight)
		.shapeType("RECTANGLE")
		.fillColor("red")
		.fillOpacity(healthOpacity)
		.strokeWidth(0)
		.strokeOpacity(0)
		.position({ x: position.x, y: position.y })
		.attachedTo(item.id)
		.layer("ATTACHMENT")
		.locked(true)
		.id(item.id + "health")
		.visible(setVisibilityProperty)
		.disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
		.disableHit(DISABLE_HIT)
		.build();

	if (variant === "short") {
		return [backgroundShape, healthShape];
	}

	const healthText = buildText()
		.position({ x: position.x, y: position.y + textVerticalOffset })
		.plainText("" + health + String.fromCharCode(0x2215) + maxHealth)
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
		.id(item.id + "health-label")
		.visible(setVisibilityProperty)
		.disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
		.disableHit(DISABLE_HIT)
		.build();

	return [backgroundShape, healthShape, healthText];
}

/** Create name tag component items */
export function createNameTag(
	item: Item,
	position: { x: number; y: number },
	nameTagVisible: boolean,
): Item[] {
	const letterWidth = 14;
	const nameTagHeight = 26;
	const nameTagWidth = letterWidth * item.name.length + 4;

    const setVisibilityProperty = item.visible;

	let nameTagBackgroundColor = "darkgrey";
	if (!nameTagVisible) {
		nameTagBackgroundColor = "black";
	}

	const nameTagFontSize = FONT_SIZE;
	const nameTagTextHeight = nameTagHeight + 0;
    const textVerticalOffset = 1.5;

	const nameTagBackground = buildShape()
		.width(nameTagWidth)
		.height(nameTagHeight)
		.shapeType("RECTANGLE")
		.fillColor(nameTagBackgroundColor)
		.fillOpacity(BACKGROUND_OPACITY)
		.strokeWidth(0)
		.position({ x: position.x, y: position.y })
		.attachedTo(item.id)
		.layer("ATTACHMENT")
		.locked(true)
		.id(item.id + "name-tag-background")
		.visible(setVisibilityProperty)
		.disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
		.disableHit(DISABLE_HIT)
		.build();

	const nameTagText = buildText()
		.position({ x: position.x, y: position.y + textVerticalOffset })
		.plainText(item.name)
		.textAlign("CENTER")
		.textAlignVertical("MIDDLE")
		.fontSize(nameTagFontSize)
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
		.id(item.id + "name-tag-text")
		.visible(setVisibilityProperty)
		.disableAttachmentBehavior(DISABLE_ATTACHMENT_BEHAVIORS)
		.disableHit(DISABLE_HIT)
		.build();

    return [nameTagBackground, nameTagText];
}