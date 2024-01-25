import OBR from "@owlbear-rodeo/sdk";
import { getPluginId } from "../getPluginId";
import Token from "./Token";

export default async function parseSelectedTokens(): Promise<Token[]> {

    const selectedTokens: Token[] = [];

    // Get selected Items
    const selection = await OBR.player.getSelection();
    const items = await OBR.scene.items.getItems(selection);

    if (items.length === 0) {
        // OBR.popover.close()
        throw "Error: No item selected";
    }

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
        if (isNaN(health)) {
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
        }
        if (isNaN(maxHealth)) {
            hasMaxHealth = false;
        }

        // Extract temp health metadata
        let tempHealth: number = NaN;
        try {
            tempHealth = parseFloat(metadata["temporary health"]);
        } catch (error) {
            tempHealth = 0;
        }
        if (isNaN(tempHealth)) {
            tempHealth = 0;
        }

        // If the token has health and max health add it to the list of valid tokens
        if (hasMaxHealth) {
            if (maxHealth !== 0) {
                selectedTokens.push(new Token(item, health, maxHealth, tempHealth));
            }
        }
    }

    return selectedTokens;
}
