export const createInitialGameState = () => ({
  phase: 'start',
  turn: 1,
  teams: { ally: { active: [], reserve: [] }, enemy: { active: [], reserve: [] } },
  selectedCommands: { ally: [], enemy: [] },
  logs: [],
  modal: { open: false, kind: null },
  onEnterResolved: { ally: {}, enemy: {} }
});
