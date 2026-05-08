export const MOVE_EFFECTS = {
  multi_hit_2: (ctx) => {
    ctx.hitCount = 2;
  },
  multi_hit_by_alive_allies: (ctx) => {
    const aliveAllies = Number(ctx.aliveAllies) || 1;
    ctx.hitCount = Math.max(1, aliveAllies);
  },
  always_hit: (ctx) => {
    ctx.alwaysHit = true;
  },
  priority_plus_1: (ctx) => {
    ctx.priority += 1;
  },
  recoil_small: (ctx) => {
    ctx.recoilRate = 0.2;
  },
  recoil_20: (ctx) => {
    ctx.recoilRate = 0.2;
  },
  self_def_down: (ctx) => {
    ctx.selfStatChanges.push({ stat: "def", amount: -1 });
  },
  self_atk_def_down: (ctx) => {
    ctx.selfStatChanges.push({ stat: "atk", amount: -1 });
    ctx.selfStatChanges.push({ stat: "def", amount: -1 });
  },
  power_up_if_target_acted: (ctx) => {
    ctx.powerModifier = (Number(ctx.powerModifier) || 1) * 1.5;
    ctx.requiresTargetActed = true;
  },
  power_up_if_target_attacking: (ctx) => {
    ctx.powerModifier = (Number(ctx.powerModifier) || 1) * 1.5;
    ctx.requiresTargetAttacking = true;
  },
  power_up_if_ally_defeated: (ctx) => {
    ctx.powerModifier = (Number(ctx.powerModifier) || 1) * 1.35;
    ctx.requiresAllyDefeated = true;
  }
};

export const TRAIT_EFFECTS = {
  first_turn_priority: (ctx) => {
    if ((Number(ctx.turnNumber) || 0) === 1) ctx.priority += 2;
  },
  ignore_stat_down: (ctx) => {
    ctx.ignoreStatDown = true;
  },
  atk_up_def_down: (ctx) => {
    ctx.afterAttackSelfChanges.push({ stat: "atk", amount: 1 });
    ctx.afterAttackSelfChanges.push({ stat: "def", amount: -1 });
  },
  no_guard: (ctx) => {
    ctx.forceHit = true;
  },
  wonder_guard: (ctx) => {
    ctx.blockNonWeakness = true;
  },
  intimidate: (ctx) => {
    ctx.intimidate = true;
  }
};

export const createAttackContext = ({ attacker = null, defender = null, move = null, aliveAllies = 1, turnNumber = 0 } = {}) => ({
  attacker,
  defender,
  move,
  aliveAllies,
  hitCount: 1,
  alwaysHit: false,
  priority: 0,
  recoilRate: 0,
  powerModifier: 1,
  requiresTargetActed: false,
  requiresTargetAttacking: false,
  requiresAllyDefeated: false,
  selfStatChanges: [],
  afterAttackSelfChanges: [],
  turnNumber,
  ignoreStatDown: false
});

export const applyMoveEffect = (ctx) => {
  if (!ctx || !ctx.move) return ctx;
  const effectKey = typeof ctx.move.effectKey === "string" ? ctx.move.effectKey : "";
  const fn = MOVE_EFFECTS[effectKey];
  if (typeof fn === "function") fn(ctx);
  return ctx;
};

export const applyTraitEffect = (ctx, traitKey = "") => {
  if (!ctx || typeof traitKey !== "string" || !traitKey) return ctx;
  const fn = TRAIT_EFFECTS[traitKey];
  if (typeof fn === "function") fn(ctx);
  return ctx;
};
