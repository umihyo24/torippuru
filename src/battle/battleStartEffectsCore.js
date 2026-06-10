export function collectBattleStartTraitEventsCore({
  state,
  TEAM,
  applyTraitEffects,
  resolveUnitOnEnterEffects,
  isAlive,
  getSelectedTrait
}) {
  void resolveUnitOnEnterEffects;
  if (!state?.teams) return [];
  const events = [];
  [TEAM.ALLY, TEAM.ENEMY].forEach((team) => {
    const opponentTeam = team === TEAM.ALLY ? TEAM.ENEMY : TEAM.ALLY;
    const active = Array.isArray(state.teams?.[team]?.active) ? state.teams[team].active : [];
    active.forEach((unit, slot) => {
      if (!unit || !isAlive(unit)) return;
      const opponent = state?.teams?.[opponentTeam]?.active?.[slot] || null;
      const traitResult = applyTraitEffects({ eventType: 'onBattleStart', context: { source: unit, opponent, state, team, slot } });
      if (!traitResult.messages.length) return;
      events.push({ sourceId: unit.uid, targetId: opponent?.uid || null, traitKind: getSelectedTrait(unit)?.key || null, messages: traitResult.messages });
    });
  });
  return events;
}
