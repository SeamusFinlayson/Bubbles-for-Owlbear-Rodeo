export function calculateNewHealth(health: number, maxHealth: number, tempHealth: number, healthDiff: number) {

    let newHealth: number;
    let newTempHealth: number;

    if (healthDiff > 0) { // Healing

        let healing = healthDiff;

        newHealth = health + healing;
        newTempHealth = tempHealth;

        if (newHealth > maxHealth) {
            newHealth = maxHealth;
        }

    } else { // Damage

        let damage = Math.abs(healthDiff);

        if (tempHealth <= 0) { // Doesn't have temp health

            newHealth = health - damage;
            newTempHealth = tempHealth;

        } else { // Has temp health

            if (tempHealth > damage) { // Damage only changes temp health
                newHealth = health;
                newTempHealth = tempHealth - damage;
            } else { //damage overflows into regular health
                newHealth = health + tempHealth - damage;
                newTempHealth = 0;
            }

        }
    }

    return [newHealth, newTempHealth];
}

export function scaleHealthDiff(damageScaleOptions: number[], healthDiff: number, tokenIndex: number) {
    let scaledHealthDiff: number;
    switch (damageScaleOptions[tokenIndex]) {
        case 0: scaledHealthDiff = 0; break;
        case 1: scaledHealthDiff = Math.trunc(healthDiff * 0.5); break;
        case 2: scaledHealthDiff = healthDiff; break;
        case 3: scaledHealthDiff = healthDiff * 2; break;
        default: throw ("Error: Invalid radio button value.");
    }
    return scaledHealthDiff;
}