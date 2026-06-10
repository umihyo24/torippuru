import { CONFIG } from "./config.js";

export const getNextKnownnessGoal = (state) => CONFIG.KNOWNNESS_THRESHOLDS.find((v) => v > (state?.knownness || 0)) || CONFIG.KNOWNNESS_THRESHOLDS.at(-1);

export const clearContextSelectionIfInvalid = (state) => {
  const sealExists = state.seals?.some((seal) => seal.id === state.ui?.selectedSealId);
  if (!sealExists) state.ui.selectedSealId = null;
  const dungeonExists = state.dungeons?.some((dungeon) => dungeon.id === state.ui?.selectedDungeonId);
  if (!dungeonExists) state.ui.selectedDungeonId = null;
  if (state.ui?.selectedTool && !CONFIG.BUILD_TOOLS[state.ui.selectedTool]) state.ui.selectedTool = null;
  if (!CONFIG.BUILD_CATEGORIES.some((category) => category.id === state.ui?.placementCategory)) state.ui.placementCategory = "facility";
};

const advanceCalendar = (state) => {
  state.calendar.week += 1;
  if (state.calendar.week > CONFIG.TIME.monthWeeks) {
    state.calendar.week = 1;
    state.calendar.month += 1;
    state.monthlyResult = {
      hunts: state.monthlyHunts,
      knownnessGain: Math.max(1, state.monthlyHunts * 3 + state.map.buildings.length)
    };
    state.knownness += state.monthlyResult.knownnessGain;
    state.monthlyHunts = 0;
  }
  if (state.calendar.month > CONFIG.TIME.monthsPerYear) {
    state.calendar.month = 1;
    state.calendar.year += 1;
  }
};

const updateDungeons = (state, dt) => {
  for (const dungeon of state.dungeons || []) {
    if (!dungeon.running) continue;
    dungeon.progress = Math.min(100, (dungeon.progress || 0) + dt * 7 * (state.speed || 1));
    if (dungeon.progress >= 100) {
      dungeon.running = false;
      dungeon.progress = 0;
      state.monthlyHunts += 1;
      state.player.gold += 45 * (dungeon.difficulty || 1);
      state.knownness += 8 * (dungeon.difficulty || 1);
      state.ui.message = `${dungeon.name}を攻略しました`;
    }
  }
};

export const update = (state, dt) => {
  if (state.phase !== "playing") return;
  clearContextSelectionIfInvalid(state);
  const speed = Math.max(0, Number(state.speed) || 0);
  if (speed > 0) {
    state.calendar.weekTimer += dt * speed;
    while (state.calendar.weekTimer >= CONFIG.TIME.weekMs / 1000) {
      state.calendar.weekTimer -= CONFIG.TIME.weekMs / 1000;
      advanceCalendar(state);
    }
    updateDungeons(state, dt);
  }
};
