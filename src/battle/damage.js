import { CONFIG } from '../config.js';

export function calculateDamage(attacker, defender, move) {
  let power = move.power;
  if (attacker.abilityId === 'iron_fist' && move.tags.includes('punch')) {
    power *= CONFIG.IRON_FIST_MULTIPLIER;
  }
  const raw = Math.round(power + attacker.atk + attacker.tempAtk - defender.def * 0.6);
  return Math.max(1, raw);
}
