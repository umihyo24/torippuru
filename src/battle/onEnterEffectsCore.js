export function resolveUnitOnEnterEffectsCore({
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
}) {
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
}
