export const hasMoveTag = (move, tag) => Array.isArray(move?.tags) && move.tags.includes(tag);

export const applyPassivePowerModifiers = ({ attacker, move, basePower, getSelectedTrait, TRAIT_LIBRARY, CONFIG }) => {
  const selectedTrait = getSelectedTrait(attacker);
  const traitDef = TRAIT_LIBRARY[selectedTrait?.key];
  if (traitDef?.triggerType === 'passive' && selectedTrait?.key === 'iron_fist' && hasMoveTag(move, 'punch')) {
    return Math.floor((Number(basePower) || 0) * CONFIG.IRON_FIST_MULTIPLIER);
  }
  return Number(basePower) || 0;
};

export const calcDamage = ({ attacker, defender, move, isCritical = false, applyTraitEffects, getAttackStatForMove, getDefenseStatForMove, findStatus, CONFIG, getSelectedTrait, TRAIT_LIBRARY }) => {
  const beforeDamageTrait = applyTraitEffects('beforeDamage', { actor: attacker, target: defender, move });
  if (beforeDamageTrait.overrideDamage === 0) return 0;
  const modifiedPower = applyPassivePowerModifiers({ attacker, move, basePower: move.power, getSelectedTrait, TRAIT_LIBRARY, CONFIG });
  const atk = getAttackStatForMove(attacker, move) + Math.floor(modifiedPower / 10);
  const def = getDefenseStatForMove(defender, move, { ignoreDefUp: isCritical });
  let dmg = Math.max(1, atk - def);
  if (!isCritical && findStatus(defender.statuses, 'barrier')) dmg = Math.max(1, Math.floor(dmg * CONFIG.BARRIER_RATIO));
  if (isCritical) dmg = Math.max(1, Math.floor(dmg * CONFIG.CRIT_MULTIPLIER));
  return Math.min(dmg, defender.hp);
};
