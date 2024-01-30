export function calculateNewHealth(health: number, maxHealth: number, tempHealth: number, healthDiff: number) {

    let newHealth: number;
    let newTempHealth: number;

    // If health was less than 0 use 0 instead as per 5e rules,
    // displaying negative HP is useful or overflow but not for AOE effects
    if (health < 0) {
        health = 0;
    }

    // If temp health was less than 0 use 0 instead as per 5e rules,
    // displaying negative HP is useful or overflow but not for AOE effects
    if (tempHealth < 0) {
        tempHealth = 0;
    }

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

export function scaleHealthDiff(damageScaleOptions: Map<string, number>, healthDiff: number, key: string) {
    let scaledHealthDiff: number;
    switch (damageScaleOptions.get(key)) {
        case 0: scaledHealthDiff = 0; break;
        case 1: scaledHealthDiff = Math.trunc(Math.trunc(healthDiff * 0.5) * 0.5); break;
        case 2: scaledHealthDiff = Math.trunc(healthDiff * 0.5); break;
        case 3: scaledHealthDiff = healthDiff; break;
        case 4: scaledHealthDiff = healthDiff * 2; break;
        default: throw ("Error: Invalid radio button value.");
    }
    return scaledHealthDiff;
}