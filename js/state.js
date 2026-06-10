import { CONFIG } from "./config.js";

const makeTiles = () => Array.from({ length: CONFIG.MAP.rows }, (_, y) =>
  Array.from({ length: CONFIG.MAP.cols }, (_, x) => ({ x, y, terrain: x < 5 || y < 3 ? "forest" : "grass", buildingId: null }))
);

export const createInitialGameState = () => ({
  phase: "start",
  player: { gold: 260 },
  calendar: { year: 1, month: 1, week: 1, weekTimer: 0 },
  speed: 1,
  knownness: 88,
  monthlyHunts: 0,
  monthlyResult: null,
  map: { tiles: makeTiles(), buildings: [] },
  seals: [
    { id: "resident", name: "ポルカ", kind: "resident", state: "島を案内中", x: 8.5, y: 7.5, equipment: { head: "麦わら帽子", hand: "地図", charm: "なし" } },
    { id: "visitor-1", name: "ミオ", kind: "visitor", state: "宿屋を探している", x: 13.5, y: 8.5, unlocked: true, active: true, equipment: { head: "なし", hand: "貝殻", charm: "旅のお守り" } },
    { id: "visitor-2", name: "ルカ", kind: "visitor", state: "鍛冶屋が気になる", x: 16.2, y: 10.3, unlocked: true, active: true, equipment: { head: "なし", hand: "なし", charm: "なし" } }
  ],
  dungeons: [
    { id: "cave", name: "しおかぜ洞窟", x: 22.5, y: 5.5, difficulty: 1, progress: 0, running: false, expiresWeek: null },
    { id: "ruins", name: "珊瑚の遺跡", x: 6.5, y: 14.5, difficulty: 2, progress: 0, running: false, expiresWeek: null }
  ],
  ui: {
    activeBottomTab: null,
    selectedTool: null,
    selectedSealId: null,
    selectedDungeonId: null,
    placementCategory: "facility",
    panelCollapsed: false,
    message: "島づくりを始めましょう"
  }
});

export let gameState = createInitialGameState();

const normalizeUi = (ui = {}) => ({
  activeBottomTab: null,
  selectedTool: null,
  selectedSealId: null,
  selectedDungeonId: null,
  placementCategory: "facility",
  panelCollapsed: false,
  message: "",
  ...ui
});

export const sanitizeLoadedState = (loaded) => {
  const fresh = createInitialGameState();
  const next = { ...fresh, ...loaded };
  next.phase = ["start", "playing", "gameover"].includes(loaded?.phase) ? loaded.phase : "playing";
  next.ui = normalizeUi({ message: loaded?.ui?.message || "ロードしました" });
  next.map = loaded?.map?.tiles && loaded?.map?.buildings ? loaded.map : fresh.map;
  next.seals = Array.isArray(loaded?.seals) ? loaded.seals : fresh.seals;
  next.dungeons = Array.isArray(loaded?.dungeons) ? loaded.dungeons : fresh.dungeons;
  next.player = { ...fresh.player, ...(loaded?.player || {}) };
  next.calendar = { ...fresh.calendar, ...(loaded?.calendar || {}) };
  return next;
};

export const replaceGameState = (nextState) => {
  gameState = nextState;
};
