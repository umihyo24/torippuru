import { CONFIG } from "./config.js";
import { getNextKnownnessGoal } from "./update.js";

let refs = {};

const esc = (value) => String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
const selected = (a, b) => a === b ? " is-active" : "";

export const createUI = (root) => {
  root.innerHTML = `
    <canvas id="game-canvas" width="${CONFIG.CANVAS.width}" height="${CONFIG.CANVAS.height}" aria-label="島マップ"></canvas>
    <div class="hud hud-left" id="hud-left"></div>
    <div class="hud hud-right" id="hud-right"></div>
    <div class="start-overlay" id="start-overlay"><div><h1>トリップル島</h1><p>コンパクトHUDと下部タブで島を発展させよう。</p><button data-action="start">開始</button></div></div>
    <nav class="bottom-tabs" id="bottom-tabs" aria-label="下部メニュー"></nav>
    <section class="bottom-panel" id="bottom-panel" aria-live="polite"></section>`;
  refs = {
    canvas: root.querySelector("#game-canvas"),
    hudLeft: root.querySelector("#hud-left"),
    hudRight: root.querySelector("#hud-right"),
    overlay: root.querySelector("#start-overlay"),
    tabs: root.querySelector("#bottom-tabs"),
    panel: root.querySelector("#bottom-panel")
  };
  return refs;
};

export const renderHUD = (state) => {
  const nextGoal = getNextKnownnessGoal(state);
  refs.hudLeft.innerHTML = `
    <div class="hud-grid">
      <span><b>${Math.floor(state.player?.gold || 0)}</b> G</span>
      <span>${state.calendar?.year || 1}年 ${state.calendar?.month || 1}月 ${state.calendar?.week || 1}週</span>
      <span>知名度 <b>${Math.floor(state.knownness || 0)}</b> / ${nextGoal}</span>
      <span class="wide">今月の討伐 ${state.monthlyHunts || 0}</span>
      <span class="hud-message">${esc(state.ui?.message || "")}</span>
    </div>`;
  refs.hudRight.innerHTML = `
    <div class="speed-box" role="group" aria-label="速度">
      ${[{ label: "⏸", speed: 0 }, { label: "x1", speed: 1 }, { label: "x2", speed: 2 }, { label: "x4", speed: 4 }].map((item) =>
        `<button data-action="speed" data-speed="${item.speed}" class="compact-btn${selected(state.speed, item.speed)}">${item.label}</button>`
      ).join("")}
      <span class="speed-now">速度 ${state.speed === 0 ? "停止" : `x${state.speed}`}</span>
    </div>
    <div class="save-row"><button data-action="save">保存</button><button data-action="load">読込</button></div>`;
};

export const renderBottomTabs = (state) => {
  const tabs = [
    ["build", "建設"],
    ["seals", "人物"],
    ["dungeons", "ダンジョン"],
    ["progress", "発展"]
  ];
  refs.tabs.innerHTML = tabs.map(([id, label]) => `<button data-action="tab" data-tab="${id}" class="tab-btn${selected(state.ui?.activeBottomTab, id)}">${label}</button>`).join("");
};

export const renderSelectedSealDetail = (state) => {
  const seal = state.seals?.find((item) => item.id === state.ui?.selectedSealId);
  if (!seal) return `<div class="hint">アザラシをクリックすると詳細表示</div>`;
  const equipment = seal.equipment || {};
  return `<article class="detail-card"><h3>${esc(seal.name)}</h3><p>${esc(seal.state)}</p><div class="slot-grid">
    <span>頭: ${esc(equipment.head || "なし")}</span><span>手: ${esc(equipment.hand || "なし")}</span><span>護符: ${esc(equipment.charm || "なし")}</span>
  </div></article>`;
};

export const renderSelectedDungeonDetail = (state) => {
  const dungeon = state.dungeons?.find((item) => item.id === state.ui?.selectedDungeonId);
  if (!dungeon) return `<div class="hint">マップ上のダンジョンをクリックして攻略開始</div>`;
  return `<article class="detail-card"><h3>${esc(dungeon.name)}</h3><p>難度 ${dungeon.difficulty} / ${dungeon.running ? "攻略中" : "待機中"}</p>
    <div class="progress"><span style="width:${Math.floor(dungeon.progress || 0)}%"></span></div>
    <button data-action="run-dungeon" ${dungeon.running ? "disabled" : ""}>攻略開始</button></article>`;
};

export const renderBuildPanel = (state) => {
  const category = state.ui?.placementCategory || "facility";
  const tools = Object.values(CONFIG.BUILD_TOOLS).filter((tool) => tool.category === category);
  return `<div class="panel-layout build-panel">
    <div class="panel-main"><div class="category-row">${CONFIG.BUILD_CATEGORIES.map((item) => `<button data-action="category" data-category="${item.id}" class="compact-btn${selected(category, item.id)}">${item.label}</button>`).join("")}</div>
    <div class="tool-grid">${tools.map((tool) => `<button data-action="tool" data-tool="${tool.id}" class="tool-btn${selected(state.ui?.selectedTool, tool.id)}"><b>${tool.label}</b><span>${tool.cost}G</span></button>`).join("")}</div></div>
    <aside class="panel-side"><button data-action="rotate" class="compact-btn${state.ui?.rotate ? " is-active" : ""}">回転 ${state.ui?.rotate ? "90°" : "0°"}</button><button data-action="clear-tool">選択解除</button><p class="hint">選択中: ${esc(CONFIG.BUILD_TOOLS[state.ui?.selectedTool]?.label || "なし")}</p></aside>
  </div>`;
};

export const renderSealsPanel = (state) => {
  const resident = state.seals?.find((seal) => seal.kind === "resident");
  const activeVisitors = (state.seals || []).filter((seal) => seal.kind === "visitor" && seal.active);
  const unlocked = CONFIG.VISITOR_UNLOCKS.filter((visitor) => (state.knownness || 0) >= visitor.threshold);
  return `<div class="panel-layout"><div class="panel-main compact-list">
    <h2>人物</h2><p>住民: ${esc(resident?.name || "なし")} / ${esc(resident?.state || "-")}</p>
    <p>訪問中: ${activeVisitors.length}人</p>${activeVisitors.map((seal) => `<div class="mini-card"><b>${esc(seal.name)}</b><span>${esc(seal.state)}</span></div>`).join("")}
    <p class="hint">解放済み ${unlocked.length} / ${CONFIG.VISITOR_UNLOCKS.length} ・ 未解放 ${CONFIG.VISITOR_UNLOCKS.length - unlocked.length}</p><p class="hint">アザラシをクリックすると詳細表示</p>
  </div><aside class="panel-side">${renderSelectedSealDetail(state)}</aside></div>`;
};

export const renderDungeonsPanel = (state) => {
  const running = (state.dungeons || []).filter((dungeon) => dungeon.running);
  return `<div class="panel-layout"><div class="panel-main compact-list"><h2>ダンジョン</h2>
    <p>発見済み: ${(state.dungeons || []).length} / 攻略中: ${running.length}</p>
    ${running.map((dungeon) => `<div class="mini-card"><b>${esc(dungeon.name)}</b><span>${Math.floor(dungeon.progress || 0)}%</span></div>`).join("") || `<p class="hint">実行中の攻略はありません</p>`}
    <p class="hint">マップ上のダンジョンをクリックして攻略開始</p></div><aside class="panel-side">${renderSelectedDungeonDetail(state)}</aside></div>`;
};

export const renderProgressPanel = (state) => {
  const goal = getNextKnownnessGoal(state);
  const prev = [...CONFIG.KNOWNNESS_THRESHOLDS].reverse().find((v) => v <= (state.knownness || 0)) || 0;
  const ratio = Math.min(100, Math.max(0, ((state.knownness - prev) / Math.max(1, goal - prev)) * 100));
  const nextUnlock = CONFIG.VISITOR_UNLOCKS.find((visitor) => visitor.threshold > (state.knownness || 0));
  const unlocked = CONFIG.VISITOR_UNLOCKS.filter((visitor) => visitor.threshold <= (state.knownness || 0));
  return `<div class="compact-list"><h2>発展</h2><p>現在の知名度: ${Math.floor(state.knownness || 0)}</p><p>次の目標: ${goal}</p>
    <div class="progress"><span style="width:${ratio}%"></span></div>
    <p>次の訪問者: ${nextUnlock ? `${esc(nextUnlock.name)}（${nextUnlock.threshold}）` : "全員解放済み"}</p>
    <p>しきい値: ${CONFIG.KNOWNNESS_THRESHOLDS.join(" / ")}</p>
    <p>解放済み: ${unlocked.map((v) => esc(v.name)).join("、") || "なし"}</p>
    <p class="hint">月次結果: ${state.monthlyResult ? `討伐${state.monthlyResult.hunts} / 知名度+${state.monthlyResult.knownnessGain}` : "まだありません"}</p></div>`;
};

export const renderUI = (state) => {
  if (!refs.canvas) return;
  renderHUD(state);
  renderBottomTabs(state);
  refs.overlay.classList.toggle("hidden", state.phase !== "start");
  const tab = state.ui?.activeBottomTab;
  refs.panel.classList.toggle("is-open", Boolean(tab));
  if (!tab) { refs.panel.innerHTML = ""; return; }
  refs.panel.innerHTML = tab === "build" ? renderBuildPanel(state) : tab === "seals" ? renderSealsPanel(state) : tab === "dungeons" ? renderDungeonsPanel(state) : renderProgressPanel(state);
};

const drawSeal = (ctx, seal) => {
  const x = seal.x * CONFIG.CANVAS.tile;
  const y = seal.y * CONFIG.CANVAS.tile;
  ctx.fillStyle = seal.kind === "resident" ? "#fff3c4" : "#d7f0ff";
  ctx.beginPath(); ctx.ellipse(x, y, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#223"; ctx.beginPath(); ctx.arc(x + 7, y - 3, 2, 0, Math.PI * 2); ctx.fill();
  ctx.font = "12px sans-serif"; ctx.fillText(seal.name, x - 18, y + 30);
};

export const render = (ctx, state) => {
  ctx.clearRect(0, 0, CONFIG.CANVAS.width, CONFIG.CANVAS.height);
  for (const row of state.map.tiles) for (const tile of row) {
    ctx.fillStyle = tile.terrain === "forest" ? "#2f6f49" : "#69a95d";
    ctx.fillRect(tile.x * CONFIG.CANVAS.tile, tile.y * CONFIG.CANVAS.tile, CONFIG.CANVAS.tile, CONFIG.CANVAS.tile);
    ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.strokeRect(tile.x * CONFIG.CANVAS.tile, tile.y * CONFIG.CANVAS.tile, CONFIG.CANVAS.tile, CONFIG.CANVAS.tile);
  }
  for (const building of state.map.buildings || []) {
    const tool = CONFIG.BUILD_TOOLS[building.toolId] || {};
    ctx.fillStyle = tool.color || "#ddd";
    ctx.fillRect(building.x * CONFIG.CANVAS.tile + 5, building.y * CONFIG.CANVAS.tile + 5, building.w * CONFIG.CANVAS.tile - 10, building.h * CONFIG.CANVAS.tile - 10);
    ctx.fillStyle = "#17202a"; ctx.font = "14px sans-serif"; ctx.fillText(building.label, building.x * CONFIG.CANVAS.tile + 9, building.y * CONFIG.CANVAS.tile + 25);
  }
  for (const dungeon of state.dungeons || []) {
    const x = dungeon.x * CONFIG.CANVAS.tile, y = dungeon.y * CONFIG.CANVAS.tile;
    ctx.fillStyle = dungeon.running ? "#ffcf5a" : "#6d4c9c"; ctx.beginPath(); ctx.arc(x, y, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "12px sans-serif"; ctx.fillText(dungeon.name, x - 34, y + 38);
  }
  for (const seal of state.seals || []) drawSeal(ctx, seal);
};
