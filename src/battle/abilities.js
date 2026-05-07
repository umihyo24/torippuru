import { ABILITIES } from '../data/abilities.js';

export function applyOnEnterAbility(unit) {
  const ability = ABILITIES[unit.abilityId];
  if (!ability || ability.triggerType !== 'onEnter') return;
  unit.tempAtk += ability.atkBoost || 0;
}
