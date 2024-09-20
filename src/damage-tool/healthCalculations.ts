export function calculateNewHealth(
  health: number,
  maxHealth: number,
  tempHealth: number,
  healthDiff: number,
) {
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

  if (healthDiff > 0) {
    // Healing

    let healing = healthDiff;

    newHealth = health + healing;
    newTempHealth = tempHealth;

    if (newHealth > maxHealth) {
      newHealth = maxHealth;
    }
  } else {
    // Damage

    let damage = Math.abs(healthDiff);

    if (tempHealth <= 0) {
      // Doesn't have temp health

      newHealth = health - damage;
      newTempHealth = tempHealth;
    } else {
      // Has temp health

      if (tempHealth > damage) {
        // Damage only changes temp health
        newHealth = health;
        newTempHealth = tempHealth - damage;
      } else {
        //damage overflows into regular health
        newHealth = health + tempHealth - damage;
        newTempHealth = 0;
      }
    }
  }

  // Restrict health to values within [-999, 9999]
  if (newHealth > 9999) {
    newHealth = 9999;
  } else if (newHealth < -999) {
    newHealth = -999;
  }

  // Restrict temp health to values within [-999, 999]
  if (newTempHealth > 999) {
    newTempHealth = 999;
  } else if (newTempHealth < -999) {
    newTempHealth = -999;
  }

  return [newHealth, newTempHealth];
}

export function scaleHealthDiff(
  damageScaleOptions: Map<string, number>,
  healthDiff: number,
  key: string,
) {
  const damageScaleOption = damageScaleOptions.get(key);
  if (!damageScaleOption) throw "Error: Invalid radio button value.";
  return calculateScaledHealthDiff(damageScaleOption, healthDiff);
}

export function calculateScaledHealthDiff(
  damageScaleOption: number,
  healthDiff: number,
) {
  switch (damageScaleOption) {
    case 0:
      return 0;
    case 1:
      return Math.trunc(Math.trunc(healthDiff * 0.5) * 0.5);
    case 2:
      return Math.trunc(healthDiff * 0.5);
    case 3:
      return Math.trunc(healthDiff);
    case 4:
      return Math.trunc(healthDiff) * 2;
    default:
  }
  throw "Error: Invalid radio button value.";
}
