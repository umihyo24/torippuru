export function applyTraitEffectsCore({
  eventType,
  context = {},
  getSelectedTrait,
  TRAIT_LIBRARY,
  isAlive,
  adjustStageWithTraitRule,
  isWeaknessHit,
  addStatus
}) {
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
}
