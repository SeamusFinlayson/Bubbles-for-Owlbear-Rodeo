import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "./getPluginId";
import Token from "./TokenClass";

export default async function parseSelectedTokens(
	mustHaveMaxHealth = false,
): Promise<Token[]> {
	const selectedTokens: Token[] = [];

	// Get selected Items
	const selection = await OBR.player.getSelection();
	const items = await OBR.scene.items.getItems(selection);

	for (const item of items) {
		// Get token metadata
		const metadata: any = item.metadata[getPluginId("metadata")];

		// Extract health metadata
		let health: number = NaN;
		try {
			health = parseFloat(metadata["health"]);
		} catch (error) {
			health = 0;
		}
		if (Number.isNaN(health)) {
			health = 0;
		}

		// Extract max health metadata
		let maxHealth: number = NaN;
		let hasMaxHealth: boolean;
		try {
			maxHealth = parseFloat(metadata["max health"]);
			hasMaxHealth = true;
		} catch (error) {
			hasMaxHealth = false;
			maxHealth = 0;
		}
		if (Number.isNaN(maxHealth)) {
			hasMaxHealth = false;
			maxHealth = 0;
		}

		// Extract temp health metadata
		let tempHealth: number = NaN;
		try {
			tempHealth = parseFloat(metadata["temporary health"]);
		} catch (error) {
			tempHealth = 0;
		}
		if (Number.isNaN(tempHealth)) {
			tempHealth = 0;
		}

		let armorClass: number = NaN;
		try {
			armorClass = parseFloat(metadata["armor class"]);
		} catch (error) {
			armorClass = 0;
		}
		if (Number.isNaN(armorClass)) {
			armorClass = 0;
		}

		let hideStats = false;
		try {
			hideStats = Boolean(metadata["hide"]).valueOf();
		} catch (error) {
			hideStats = false;
		}

		if (mustHaveMaxHealth) {
			// If the token has health and max health add it to the list of valid tokens
			if (hasMaxHealth && maxHealth !== 0) {
				selectedTokens.push(
					new Token(item, health, maxHealth, tempHealth, armorClass, hideStats),
				);
			}
		} else {
			selectedTokens.push(
				new Token(item, health, maxHealth, tempHealth, armorClass, hideStats),
			);
		}
	}

	return selectedTokens;
}
