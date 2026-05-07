// src/data/monsters.js
const MONSTERS = [
  { id: 'emberlynx', name: 'Emberlynx', sprite: 'assets/portraits/emberlynx.png', abilityId: 'iron_fist', moves: ['fire_punch', 'tackle'], atk: 30, def: 16 },
  { id: 'frostfang', name: 'Frostfang', sprite: 'assets/portraits/frostfang.png', abilityId: 'hardy', moves: ['tackle', 'aqua_jet'], atk: 26, def: 20 },
  { id: 'momijika', name: 'Momijika', sprite: 'assets/portraits/momijika.png', abilityId: 'battle_cry', moves: ['leaf_slash', 'tackle'], atk: 27, def: 18 },
  { id: 'tododon', name: 'Tododon', sprite: 'assets/portraits/tododon.png', abilityId: 'hardy', moves: ['aqua_jet', 'tackle'], atk: 28, def: 19 }
];


// src/config.js
const CONFIG = {
  PLAYER_TEAM_SIZE: 3,
  ENEMY_TEAM_SIZE: 3,
  STARTING_HP: 120,
  IRON_FIST_MULTIPLIER: 1.5,
  MAX_LOG_LINES: 8,
  BASIC_ATTACK_POWER: 28,
  STATUS_BAR_WIDTH: 220
};


// src/state/gameState.js


function makeUnit(base) {
  return { ...base, hp: CONFIG.STARTING_HP, alive: true, tempAtk: 0 };
}
function createInitialGameState() {
  return {
    phase: 'start',
    playerTeam: MONSTERS.slice(0, CONFIG.PLAYER_TEAM_SIZE).map(makeUnit),
    enemyTeam: MONSTERS.slice(1, 1 + CONFIG.ENEMY_TEAM_SIZE).map(makeUnit),
    activePlayer: 0,
    activeEnemy: 0,
    turn: 1,
    message: 'バトル開始！',
    log: []
  };
}


// src/data/moves.js
const MOVES = {
  tackle: { id: 'tackle', name: 'Tackle', power: 22, tags: [] },
  fire_punch: { id: 'fire_punch', name: 'Fire Punch', power: 26, tags: ['punch'] },
  aqua_jet: { id: 'aqua_jet', name: 'Aqua Jet', power: 24, tags: [] },
  leaf_slash: { id: 'leaf_slash', name: 'Leaf Slash', power: 25, tags: [] }
};


// src/battle/damage.js
function calculateDamage(attacker, defender, move) {
  let power = move.power;
  if (attacker.abilityId === 'iron_fist' && move.tags.includes('punch')) {
    power *= CONFIG.IRON_FIST_MULTIPLIER;
  }
  const raw = Math.round(power + attacker.atk + attacker.tempAtk - defender.def * 0.6);
  return Math.max(1, raw);
}


// src/data/abilities.js
const ABILITIES = {
  iron_fist: { id: 'iron_fist', name: 'Iron Fist', triggerType: 'passive' },
  battle_cry: { id: 'battle_cry', name: 'Battle Cry', triggerType: 'onEnter', atkBoost: 4 },
  hardy: { id: 'hardy', name: 'Hardy', triggerType: 'passive' }
};


// src/battle/abilities.js
function applyOnEnterAbility(unit) {
  const ability = ABILITIES[unit.abilityId];
  if (!ability || ability.triggerType !== 'onEnter') return;
  unit.tempAtk += ability.atkBoost || 0;
}


// src/battle/battleLogic.js



function currentAliveIndex(team) {
  return team.findIndex((m) => m.alive);
}

function checkVictory(state) {
  const playerAlive = state.playerTeam.some((m) => m.alive);
  const enemyAlive = state.enemyTeam.some((m) => m.alive);
  if (!playerAlive || !enemyAlive) {
    state.phase = 'gameover';
    state.message = playerAlive ? '勝利！' : '敗北…';
    return true;
  }
  return false;
}
function startBattle(state) {
  state.phase = 'playing';
  applyOnEnterAbility(state.playerTeam[state.activePlayer]);
  applyOnEnterAbility(state.enemyTeam[state.activeEnemy]);
}
function performTurn(state, playerMoveId) {
  if (state.phase !== 'playing') return;
  const player = state.playerTeam[state.activePlayer];
  const enemy = state.enemyTeam[state.activeEnemy];
  const playerMove = MOVES[playerMoveId] || MOVES.tackle;
  const enemyMove = MOVES[enemy.moves[0]];

  enemy.hp -= calculateDamage(player, enemy, playerMove);
  if (enemy.hp <= 0) {
    enemy.alive = false;
    enemy.hp = 0;
  }

  if (!checkVictory(state)) {
    if (!enemy.alive) {
      state.activeEnemy = currentAliveIndex(state.enemyTeam);
      applyOnEnterAbility(state.enemyTeam[state.activeEnemy]);
    }
    const nextEnemy = state.enemyTeam[state.activeEnemy];
    const nextPlayer = state.playerTeam[state.activePlayer];
    nextPlayer.hp -= calculateDamage(nextEnemy, nextPlayer, enemyMove);
    if (nextPlayer.hp <= 0) {
      nextPlayer.alive = false;
      nextPlayer.hp = 0;
      state.activePlayer = currentAliveIndex(state.playerTeam);
      if (state.activePlayer >= 0) applyOnEnterAbility(state.playerTeam[state.activePlayer]);
    }
  }

  checkVictory(state);
  state.turn += 1;
  state.message = `${player.name}は${playerMove.name}！`;
  state.log = [`Turn ${state.turn}`, state.message, ...state.log].slice(0, 8);
}


// src/assets.js
const ASSETS = {
  battleBg: 'assets/backgrounds/background_battle.png',
  placeholder: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="120"><rect width="100%" height="100%" fill="%23333"/><text x="50%" y="50%" fill="white" dominant-baseline="middle" text-anchor="middle" font-size="14">NO IMAGE</text></svg>'
};
function createSafeImage(src, alt, className = '') {
  const img = document.createElement('img');
  img.alt = alt;
  img.className = className;
  img.src = src || ASSETS.placeholder;
  img.onerror = () => {
    img.onerror = null;
    img.src = ASSETS.placeholder;
    img.classList.add('image-fallback');
    img.title = `${alt} (fallback)`;
  };
  return img;
}


// src/ui/dom.js
function qs(sel, root = document) { return root.querySelector(sel); }
function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function clear(node) { node.replaceChildren(); }


// src/ui/render.js



function hpText(unit) { return `${unit.hp}/120`; }
function renderBattle(app, state, onCommand, onOpenLog) {
  clear(app);
  app.className = 'battle-root';

  const top = el('section', 'panel top-status');
  top.textContent = `Turn ${state.turn} / Phase: ${state.phase}`;

  const field = el('section', 'panel monster-window');
  field.style.backgroundImage = `url(${ASSETS.battleBg})`;
  const p = state.playerTeam[state.activePlayer];
  const e = state.enemyTeam[state.activeEnemy];
  if (p) { const card = el('div', 'unit'); card.append(createSafeImage(p.sprite, p.name), el('div', '', `${p.name} HP:${hpText(p)}`)); field.append(card); }
  if (e) { const card = el('div', 'unit enemy'); card.append(createSafeImage(e.sprite, e.name), el('div', '', `${e.name} HP:${hpText(e)}`)); field.append(card); }

  const msg = el('section', 'panel message-window', state.message);

  const cmd = el('section', 'panel command-window');
  if (state.phase === 'playing' && p) {
    p.moves.forEach((id) => {
      const move = MOVES[id];
      const b = el('button', 'cmd-btn', move.name);
      b.addEventListener('click', () => onCommand(id));
      cmd.append(b);
    });
  }
  const logBtn = el('button', 'cmd-btn', 'ログ');
  logBtn.addEventListener('click', onOpenLog);
  cmd.append(logBtn);

  app.append(top, field, msg, cmd);
}


// src/ui/modal.js
function createModalController() {
  let overlay = null;
  return {
    open(content) {
      this.close();
      overlay = el('div', 'modal-overlay');
      const panel = el('div', 'modal-panel');
      const close = el('button', 'modal-close', '閉じる');
      close.addEventListener('click', () => this.close());
      panel.append(content, close);
      overlay.append(panel);
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });
      const editBtn = createEl("button", "screen-nav-btn primary formation-open-build-btn", "能力設定へ");
      editBtn.dataset.action = "formation-edit-open-monster-detail";
      rightPanel.append(detailTop, traitBox, statGrid, moveSection, editBtn);
    }

    body.append(leftPanel, rightPanel);
    wrap.append(body);
    return wrap;
  };

  const renderBattlePrepareScreen = () => {
    const wrap = createEl("section", "formation-screen battle-prepare-screen");
    wrap.style.setProperty("--formation-list-x", `${CONFIG.UI.FORMATION_LIST_X}px`);
    wrap.style.setProperty("--formation-list-y", `${CONFIG.UI.FORMATION_LIST_Y}px`);
    wrap.style.setProperty("--formation-list-width", `${CONFIG.UI.FORMATION_LIST_WIDTH}px`);
    wrap.style.setProperty("--formation-list-item-height", `${CONFIG.UI.BATTLE_PREPARE_LIST_ITEM_HEIGHT}px`);
    wrap.style.setProperty("--formation-list-spacing-y", `${CONFIG.UI.FORMATION_LIST_SPACING_Y}px`);
    wrap.style.setProperty("--formation-slot-label-height", `${CONFIG.UI.BATTLE_PREPARE_SLOT_LABEL_HEIGHT}px`);
    wrap.style.setProperty("--formation-preview-height", `${CONFIG.UI.BATTLE_PREPARE_PREVIEW_HEIGHT}px`);
    wrap.style.setProperty("--formation-preview-cols", `${CONFIG.UI.BATTLE_PREPARE_GRID_COLUMNS}`);
    wrap.style.setProperty("--formation-preview-rows", `${CONFIG.UI.BATTLE_PREPARE_GRID_ROWS}`);
    wrap.style.setProperty("--formation-summary-height", `${CONFIG.UI.BATTLE_PREPARE_SUMMARY_HEIGHT}px`);
    wrap.appendChild(createEl("h2", "formation-title", "Battle Prepare"));
    const selectedIndex = getSelectableIndex(gameState.ui.battlePrepareIndex, FORMATION_SLOT_COUNT - 1);
    const selectedFormation = selectedIndex >= 0 ? getFormationAt(gameState, selectedIndex) : null;
    const selectedMemberCount = getFormationMembers(selectedFormation).length;
    wrap.appendChild(createEl(
      "div",
      "battle-prepare-status",
      `選択中: Slot ${selectedIndex + 1} / メンバー ${selectedMemberCount}/${FORMATION_MEMBER_COUNT}`
    ));
    const list = createEl("div", "formation-slot-list");
    for (let i = 0; i < FORMATION_SLOT_COUNT; i += 1) {
      const formation = getFormationAt(gameState, i);
      const isSelected = i === gameState.ui.battlePrepareIndex;
      list.appendChild(renderFormationSlotCard({
        formation,
        index: i,
        isSelected,
        action: "battle-prepare-select",
        showSummary: true,
        previewOptions: { emptySubText: "モンスターを編成して出撃" },
        extraClassName: "battle-prepare-slot"
      }));
    }
    const buttons = createEl("div", "screen-button-row");
    buttons.classList.add("battle-prepare-actions");
    const back = createEl("button", "screen-nav-btn", "もどる");
    back.dataset.action = "go-home";
    const start = createEl("button", "screen-nav-btn primary", "勝ちにいく");
    start.dataset.action = "battle-start";
    start.disabled = selectedIndex < 0 || !hasAnyValidFormationMember(selectedFormation);
    buttons.append(back, start);
    wrap.append(list, buttons, createEl("div", "formation-help", "編成を確認して出撃しましょう"));
    return wrap;
  };

  const render = () => {
    ensureUiSafety();
    if (gameState.phase === PHASE.PLAYING) {
      syncPartyUiState();
    }
    clearTempArrays();
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.style.setProperty("--detail-h", `${CONFIG.MOVE_DETAIL_PANEL_HEIGHT}px`);
    app.style.setProperty("--hl-attacker", CONFIG.HIGHLIGHT_COLORS.attackSource);
    app.style.setProperty("--hl-target-single", CONFIG.HIGHLIGHT_COLORS.attackTargetSingle);
    app.style.setProperty("--hl-target-aoe", CONFIG.HIGHLIGHT_COLORS.attackTargetAoe);
    app.style.setProperty("--hl-status-poison", CONFIG.HIGHLIGHT_COLORS.statusPoison);
    app.style.setProperty("--hl-status-default", CONFIG.HIGHLIGHT_COLORS.statusDefault);
    app.style.setProperty("--hl-status-remove", CONFIG.HIGHLIGHT_COLORS.statusRemove);
    app.style.setProperty("--hl-trait-source", CONFIG.HIGHLIGHT_COLORS.traitSource);
    app.style.setProperty("--hl-trait-target", CONFIG.HIGHLIGHT_COLORS.traitTarget);
    if (gameState.systemMessage) {
      const message = createEl("div", "formation-help", gameState.systemMessage);
      app.appendChild(message);
    }

    const main = createEl("div", "main");
    if (gameState.phase === PHASE.PLAYING || gameState.screen === CONFIG.SCREENS.BATTLE) {
      const battleStage = createEl("div", "battle-stage");
      battleStage.appendChild(renderBattleTopHeader());
      battleStage.appendChild(renderBattlefield());
      battleStage.appendChild(renderBattleMessageBox());
      main.appendChild(battleStage);
      main.appendChild(renderCommandArea());
    } else if (gameState.phase === PHASE.GAMEOVER || gameState.screen === CONFIG.SCREENS.RESULT) {
      main.appendChild(renderBattleResultScreen());
    } else if (gameState.screen === CONFIG.SCREENS.HOME) {
      main.appendChild(renderHomeScreen());
    } else if (gameState.screen === CONFIG.SCREENS.FORMATION) {
      if (gameState.phase === PHASE.FORMATION_EDIT) main.appendChild(renderFormationEditScreen());
      else main.appendChild(renderFormationScreen());
    } else if (gameState.screen === CONFIG.SCREENS.MONSTER_LIST) {
      if (gameState.phase === PHASE.MONSTER_DETAIL) main.appendChild(renderMonsterDetailScreen());
      else main.appendChild(renderMonsterListScreen());
    } else if (gameState.phase === PHASE.START) {
      main.appendChild(renderStartPhaseScreen());
    } else if (gameState.phase === PHASE.REWARD) {
      main.appendChild(renderRewardScreen());
    } else if (gameState.phase === PHASE.MONSTER_DETAIL) {
      main.appendChild(renderMonsterDetailScreen());
    } else if (gameState.phase === PHASE.TRAINER_CARD) {
      main.appendChild(renderTrainerCardScreen());
    } else if (gameState.phase === PHASE.SETTINGS) {
      main.appendChild(renderSettingsScreen());
    } else if (gameState.phase === PHASE.BATTLE_PREPARE) {
      main.appendChild(renderBattlePrepareScreen());
    } else if (gameState.phase === PHASE.FORMATION_EDIT) {
      main.appendChild(renderFormationEditScreen());
    } else main.appendChild(renderHomeScreen());
    const headerLayer = renderHeader(app, gameState);
    if (headerLayer) app.appendChild(headerLayer);
    app.append(main);
    const logModal = renderLogModal();
    if (logModal) app.appendChild(logModal);
    const menuModal = renderMenuModal();
    if (menuModal) app.appendChild(menuModal);
  };

  const update = (now) => {
    gameState.input.mouseClicked = false;
    const hasHpAnimations = Object.keys(gameState.displayState.hpAnimations).length > 0;
    const hasDefeatVanish = Object.keys(gameState.displayState.defeatVanish).length > 0;
    const hasPlayback = gameState.phase === PHASE.PLAYING && gameState.battleFlow.mode === "playback";
    const hasCutIn = gameState?.cutIn?.active === true;
    if (!hasHpAnimations && !hasDefeatVanish && !hasPlayback && !hasCutIn) return;
    updateHpAnimations(now);
    updateDefeatVanishAnimations(now);
    if (hasPlayback) updateBattlePlayback(now);
    if (hasCutIn) updateCutIn();
    render();    
  };

  const loop = (now) => {
    update(now);
    requestAnimationFrame(loop);
  };

  const getLocalPointerPosition = (event) => {
    const appRect = document.getElementById("app")?.getBoundingClientRect?.();
    const localX = appRect ? event.clientX - appRect.left : 0;
    const localY = appRect ? event.clientY - appRect.top : 0;
    return {
      x: Number.isFinite(localX) ? localX : 0,
      y: Number.isFinite(localY) ? localY : 0
    };
  };

  const getCanvasPoint = (event) => {
    const app = document.getElementById("app");
    const rect = app?.getBoundingClientRect?.();
    const x = rect ? event.clientX - rect.left : 0;
    const y = rect ? event.clientY - rect.top : 0;
    return {
      x: Number.isFinite(x) ? x : 0,
      y: Number.isFinite(y) ? y : 0
    };
  };

  const getFormationEditLocalPointerPosition = (event) => {
    const leftMain = document.querySelector(".formation-left-main");
    const panelRect = leftMain?.getBoundingClientRect?.();
    if (!panelRect) return { x: -1, y: -1 };
    const localX = event.clientX - panelRect.left;
    const localY = event.clientY - panelRect.top;
    return {
      x: Number.isFinite(localX) ? localX : -1,
      y: Number.isFinite(localY) ? localY : -1
    };
  };

  const getHomeLocalPointerPosition = (event) => {
    const screenRect = document.querySelector(".home-screen")?.getBoundingClientRect?.();
    if (!screenRect) return { x: -1, y: -1 };
    const localX = event.clientX - screenRect.left;
    const localY = event.clientY - screenRect.top;
    return {
      x: Number.isFinite(localX) ? localX : -1,
      y: Number.isFinite(localY) ? localY : -1
    };
  };

  const updateHomeHoverFromPoint = (x, y) => {
    let nextHover = -1;
    const rects = getHomeMenuCardRects();
    for (const rect of rects) {
      if (isPointInRect(x, y, rect)) {
        nextHover = rect.index;
        break;
      }
    }
    if (gameState.ui.homeHoverIndex !== nextHover) {
      gameState.ui.homeHoverIndex = nextHover;
      return true;
    }
    return false;
  };

  const handleHomeCardPointerClick = (x, y) => {
    const rects = getHomeMenuCardRects();
    for (const rect of rects) {
      if (isPointInRect(x, y, rect)) {
        handleHomeMenuConfirm(rect.index);
        return true;
      }
    }
    return false;
  };

  const handleFormationEditPointerClick = (x, y) => {
    const slotRects = getFormationSlotRects();
    for (const rect of slotRects) {
      if (isPointInRect(x, y, rect)) {
        handleFormationSlotSelect(rect.index);
        return true;
      }
    }
    const visibleFormationMonsterCount = getVisibleMonsters("formation", gameState).length;
    const monsterRects = getMonsterGridItemRects(gameState.ui.formationEdit.scrollOffset, visibleFormationMonsterCount);
    for (const rect of monsterRects) {
      if (isPointInRect(x, y, rect)) {
        assignMonsterToSelectedSlot(rect.index);
        return true;
      }
    }
    return false;
  };

  const handleFormationButtonAction = (buttonKey) => {
    if (buttonKey === "back") {
      cancelFormationEdit();
      return true;
    }
    if (buttonKey === "save") {
      const draft = cloneFormation(gameState?.ui?.formationEdit?.draft);
      if (!hasAnyValidFormationMember(draft)) {
        gameState.systemMessage = "保存するには1体以上を編成してください。";
        return true;
      }
      saveFormationEdit();
      return true;
    }
    return false;
  };

  const handleFormationButtonClick = (point) => {
    if (gameState.phase !== PHASE.FORMATION_EDIT) return false;
    const appRect = document.getElementById("app")?.getBoundingClientRect?.();
    const leftMain = document.querySelector(".formation-left-main");
    const panelRect = leftMain?.getBoundingClientRect?.();
    if (!panelRect || !appRect) return false;
    const localPoint = {
      x: point.x - (panelRect.left - appRect.left),
      y: point.y - (panelRect.top - appRect.top)
    };
    if (isPointInRect(localPoint.x, localPoint.y, gameState?.uiRects?.backButton || null)) {
      return handleFormationButtonAction("back");
    }
    if (isPointInRect(localPoint.x, localPoint.y, gameState?.uiRects?.saveButton || null)) {
      return handleFormationButtonAction("save");
    }
  };
}


// src/main.js





const gameState = createInitialGameState();
const app = document.getElementById('app');
const modal = createModalController();

function render() {
  renderBattle(app, gameState, (moveId) => {
    performTurn(gameState, moveId);
    render();
  }, () => {
    const content = el('div');
    gameState.log.forEach((line) => content.append(el('div', '', line)));
    modal.open(content);
  });
}

startBattle(gameState);
render();

