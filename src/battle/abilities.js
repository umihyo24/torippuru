export const canTriggerOnEnter = (abilityDef) => abilityDef?.triggerType === 'onEnter';

export const applyTraitEffects = ({
  eventType,
  context = {},
  getSelectedTrait,
  TRAIT_LIBRARY,
  isAlive,
  adjustStageWithTraitRule,
  isWeaknessHit,
  addStatus
}) => {
  const out = { forceHit: false, overrideDamage: null, messages: [], effects: [] };
  const actor = context.actor || null;
  const target = context.target || null;
  const source = context.source || actor || null;
  const sourceTrait = getSelectedTrait(source);
  const targetTrait = getSelectedTrait(target);

  if ((eventType === 'onBattleStart' || eventType === 'onSwitchIn') && source && sourceTrait?.key === 'intimidate') {
    const opponent = context.opponent || null;
    if (opponent && isAlive(opponent)) {
      const changed = adjustStageWithTraitRule(opponent, 'atk', -1);
      if (changed !== 0) {
        out.effects.push({ type: 'addAtkStage', amount: changed, targetId: opponent.uid, targetName: opponent.name });
        out.messages.push(`${source.name}の ${sourceTrait.name}が 発動した！`);
        out.messages.push(`${opponent.name}の こうげきが さがった！`);
      }
    }
  }

  if (eventType === 'beforeHitCheck') {
    if (sourceTrait?.key === 'no_guard' || targetTrait?.key === 'no_guard') out.forceHit = true;
  }

  if (eventType === 'beforeDamage' && target && targetTrait?.key === 'wonder_guard' && context.move) {
    if (!isWeaknessHit(target, context.move)) out.overrideDamage = 0;
  }

  if (eventType === 'afterDamage' && source && sourceTrait) {
    const traitDef = TRAIT_LIBRARY[sourceTrait.key];
    (traitDef?.onAfterDamage || []).forEach((effect) => {
      if (effect.type === 'applyStatus' && target && isAlive(target)) {
        addStatus(target, effect.status, effect.duration);
        out.effects.push({
          type: 'applyStatus',
          statusId: effect.status,
          duration: effect.duration,
          sourceType: 'trait',
          sourceId: source.uid,
          sourceName: source.name,
          traitKind: sourceTrait.key,
          targetId: target.uid,
          targetName: target.name
        });
      }
    });
  }

  if (eventType === 'onTurnStart' && source && sourceTrait) {
    const traitDef = TRAIT_LIBRARY[sourceTrait.key];
    (traitDef?.onTurnStart || []).forEach((effect) => {
      if (effect.type === 'addAtkStage') {
        const changed = adjustStageWithTraitRule(source, 'atk', Number(effect.amount) || 0);
        if (changed !== 0) out.effects.push({ type: 'addAtkStage', amount: changed, targetId: source.uid, targetName: source.name });
      }
    });
  }

  return out;
};

export const resolveUnitOnEnterEffects = ({
  state,
  team,
  slot,
  unit,
  TEAM,
  TRAIT_LIBRARY,
  STATUSES,
  STATUS_LABELS,
  STATUS_APPLY_TEXT,
  CONFIG,
  addStatus,
  clamp,
  getSelectedTrait,
  applyTraitEffects
}) => {
  const messages = [];
  const statusApplies = [];
  const applyEffects = (effects = [], sourceLabel = null, announceAbility = false) => {
    if (!effects.length) return;
    if (announceAbility && sourceLabel) messages.push(`${unit.name}の ${sourceLabel}が 発動した！`);
    effects.forEach((effect) => {
      if (effect.type !== 'applyStatus') return;
      const duration = effect.duration ?? STATUSES[effect.status]?.duration ?? 1;
      addStatus(unit, effect.status, duration);
      const text = STATUS_APPLY_TEXT[effect.status]?.(unit.name) || `${unit.name}に ${effect.status}！`;
      messages.push(text);
      statusApplies.push({ targetId: unit.uid, statusId: effect.status, duration });
    });
  };
  const applyStatEffects = (effects = [], sourceLabel = null, announceAbility = false) => {
    if (!effects.length) return;
    if (announceAbility && sourceLabel) messages.push(`${unit.name}の ${sourceLabel}が 発動した！`);
    effects.forEach((effect) => {
      if (effect.type === 'addAtkStage') {
        const amount = Math.max(0, Number(effect.amount) || 0);
        if (amount <= 0) return;
        unit.buffs.atkStage = clamp((Number(unit?.buffs?.atkStage) || 0) + amount, -CONFIG.CRIT_STAGE_MAX, CONFIG.CRIT_STAGE_MAX);
        messages.push(`${unit.name}の こうげき体勢が高まった！`);
      }
    });
  };

  state.globalStatuses.forEach((status) => applyEffects(status.onEnter, STATUS_LABELS[status.kind] || status.kind));
  state.teams[team].statuses.forEach((status) => applyEffects(status.onEnter, STATUS_LABELS[status.kind] || status.kind));
  (state.teams[team].tileEffects?.[slot] || []).forEach((tileEffect) => applyEffects(tileEffect.onEnter, tileEffect.name || tileEffect.kind || 'tile effect'));
  const selectedTrait = getSelectedTrait(unit);
  const traitDef = TRAIT_LIBRARY[selectedTrait?.key];
  if (traitDef?.triggerType === 'onEnter') {
    applyEffects(traitDef?.onEnter, null, false);
    applyStatEffects(traitDef?.onEnter, null, false);
  }
  const opponent = state?.teams?.[team === TEAM.ALLY ? TEAM.ENEMY : TEAM.ALLY]?.active?.[slot] || null;
  const traitResult = applyTraitEffects({ eventType: 'onSwitchIn', context: { source: unit, opponent, state, team, slot } });
  messages.push(...traitResult.messages);

  return { messages, statusApplies };
};
