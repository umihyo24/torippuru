import { CONFIG } from "./config.js";
import { gameState, replaceGameState, sanitizeLoadedState } from "./state.js";
import { renderUI } from "./render.js";

let canvasRef = null;
let rootRef = null;

export const setActiveBottomTab = (tabId) => {
  gameState.ui.activeBottomTab = tabId;
  gameState.ui.panelCollapsed = !tabId;
  renderUI(gameState);
};

export const toggleBottomTab = (tabId) => {
  gameState.ui.activeBottomTab = gameState.ui.activeBottomTab === tabId ? null : tabId;
  gameState.ui.panelCollapsed = !gameState.ui.activeBottomTab;
  renderUI(gameState);
};

export const closeBottomPanel = () => {
  gameState.ui.activeBottomTab = null;
  gameState.ui.panelCollapsed = true;
  renderUI(gameState);
};

export const setSelectedTool = (toolId) => {
  if (toolId && !CONFIG.BUILD_TOOLS[toolId]) return;
  gameState.ui.selectedTool = toolId;
  const category = CONFIG.BUILD_TOOLS[toolId]?.category;
  if (category) gameState.ui.placementCategory = category;
  renderUI(gameState);
};

export const clearSelectedTool = () => setSelectedTool(null);

const tileAt = (x, y) => gameState.map.tiles?.[y]?.[x] || null;
const buildingAt = (x, y) => gameState.map.buildings.find((building) => x >= building.x && y >= building.y && x < building.x + building.w && y < building.y + building.h);

const canPlace = (tool, x, y) => {
  const [rawW, rawH] = tool.size || [1, 1];
  const rotated = gameState.ui.rotate === true;
  const w = rotated ? rawH : rawW;
  const h = rotated ? rawW : rawH;
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      const tile = tileAt(xx, yy);
      if (!tile || tile.terrain === "water" || tile.buildingId) return { ok: false, reason: "ここには置けません" };
      if (tile.terrain === "forest" && tool.id !== "clearing" && tool.id !== "delete") return { ok: false, reason: "先に開拓してください" };
    }
  }
  if ((gameState.player.gold || 0) < (tool.cost || 0)) return { ok: false, reason: "Gが足りません" };
  return { ok: true, w, h };
};

const placeTool = (toolId, x, y) => {
  const tool = CONFIG.BUILD_TOOLS[toolId];
  if (!tool) return false;
  if (tool.id === "delete") {
    const building = buildingAt(x, y);
    if (!building) { gameState.ui.message = "撤去するものがありません"; return true; }
    gameState.map.buildings = gameState.map.buildings.filter((item) => item.id !== building.id);
    for (const row of gameState.map.tiles) for (const tile of row) if (tile.buildingId === building.id) tile.buildingId = null;
    gameState.ui.message = `${building.label}を撤去しました`;
    return true;
  }
  if (tool.id === "clearing") {
    const tile = tileAt(x, y);
    if (!tile || tile.terrain !== "forest") { gameState.ui.message = "開拓できる森を選んでください"; return true; }
    if (gameState.player.gold < tool.cost) { gameState.ui.message = "Gが足りません"; return true; }
    gameState.player.gold -= tool.cost;
    tile.terrain = "grass";
    gameState.ui.message = "森を開拓しました";
    return true;
  }
  const result = canPlace(tool, x, y);
  if (!result.ok) { gameState.ui.message = result.reason; return true; }
  const building = { id: `${tool.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`, toolId, label: tool.label, x, y, w: result.w, h: result.h, rotation: gameState.ui.rotate ? 90 : 0 };
  gameState.player.gold -= tool.cost || 0;
  gameState.map.buildings.push(building);
  for (let yy = y; yy < y + result.h; yy += 1) for (let xx = x; xx < x + result.w; xx += 1) tileAt(xx, yy).buildingId = building.id;
  gameState.ui.message = `${tool.label}を配置しました`;
  return true;
};

const getCanvasTile = (event) => {
  const rect = canvasRef.getBoundingClientRect();
  const scaleX = canvasRef.width / rect.width;
  const scaleY = canvasRef.height / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  return { px: x, py: y, tx: Math.floor(x / CONFIG.CANVAS.tile), ty: Math.floor(y / CONFIG.CANVAS.tile) };
};

const distanceTo = (entity, tx, ty) => Math.hypot((entity.x || 0) - tx - 0.5, (entity.y || 0) - ty - 0.5);

const selectNearestContext = (tx, ty) => {
  const seal = (gameState.seals || []).map((item) => ({ type: "seal", item, d: distanceTo(item, tx, ty) })).filter((hit) => hit.d < 1.1);
  const dungeon = (gameState.dungeons || []).map((item) => ({ type: "dungeon", item, d: distanceTo(item, tx, ty) })).filter((hit) => hit.d < 1.3);
  const nearest = [...seal, ...dungeon].sort((a, b) => a.d - b.d)[0];
  if (!nearest) {
    gameState.ui.selectedSealId = null;
    gameState.ui.selectedDungeonId = null;
    gameState.ui.message = "";
    return;
  }
  if (nearest.type === "seal") {
    gameState.ui.selectedSealId = nearest.item.id;
    gameState.ui.selectedDungeonId = null;
    if (!gameState.ui.activeBottomTab) gameState.ui.activeBottomTab = "seals";
  } else {
    gameState.ui.selectedDungeonId = nearest.item.id;
    gameState.ui.selectedSealId = null;
    if (!gameState.ui.activeBottomTab) gameState.ui.activeBottomTab = "dungeons";
  }
};

const saveGame = () => {
  localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify({ ...gameState, ui: undefined }));
  gameState.ui.message = "セーブしました";
  renderUI(gameState);
};

const loadGame = () => {
  const raw = localStorage.getItem(CONFIG.SAVE_KEY);
  if (!raw) { gameState.ui.message = "セーブデータがありません"; renderUI(gameState); return; }
  replaceGameState(sanitizeLoadedState(JSON.parse(raw)));
  renderUI(gameState);
};

export const bindUIEvents = (root, canvas) => {
  rootRef = root;
  canvasRef = canvas;
  rootRef.addEventListener("click", (event) => {
    const actionEl = event.target.closest("[data-action]");
    if (!actionEl) return;
    event.stopPropagation();
    const { action, tab, tool, category, speed } = actionEl.dataset;
    if (action === "start") gameState.phase = "playing";
    if (action === "tab") toggleBottomTab(tab);
    if (action === "tool") setSelectedTool(tool);
    if (action === "category") { gameState.ui.placementCategory = category; renderUI(gameState); }
    if (action === "clear-tool") clearSelectedTool();
    if (action === "rotate") { gameState.ui.rotate = !gameState.ui.rotate; renderUI(gameState); }
    if (action === "speed") { gameState.speed = Number(speed); renderUI(gameState); }
    if (action === "save") saveGame();
    if (action === "load") loadGame();
    if (action === "run-dungeon") {
      const dungeon = gameState.dungeons.find((item) => item.id === gameState.ui.selectedDungeonId);
      if (dungeon) { dungeon.running = true; gameState.ui.message = `${dungeon.name}を攻略中`; renderUI(gameState); }
    }
  });
  canvasRef.addEventListener("click", (event) => {
    if (event.target.closest(".hud,.bottom-tabs,.bottom-panel")) return;
    if (gameState.phase === "start") { gameState.phase = "playing"; renderUI(gameState); return; }
    const { tx, ty } = getCanvasTile(event);
    if (gameState.ui.selectedTool) placeTool(gameState.ui.selectedTool, tx, ty);
    else selectNearestContext(tx, ty);
    renderUI(gameState);
  });
  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    gameState.ui.selectedTool = null;
    if (gameState.ui.activeBottomTab) closeBottomPanel();
    renderUI(gameState);
  });
};

Object.assign(window, { setActiveBottomTab, toggleBottomTab, closeBottomPanel, setSelectedTool, clearSelectedTool });
