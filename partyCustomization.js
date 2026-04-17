(function () {
  'use strict';

  const CONFIG = {
    CANVAS: {
      WIDTH: 1200,
      HEIGHT: 700,
      BG: '#111822',
      PANEL_BG: '#1c2533',
      PANEL_BORDER: '#4a5b77',
      TEXT: '#ecf2ff',
      SUBTEXT: '#aebbd3',
      HIGHLIGHT: '#6ad2ff',
      DANGER: '#ff7a7a',
      GOOD: '#83f4a3',
      DISABLED: '#5e6573'
    },
    LAYOUT: {
      PADDING: 16,
      GAP: 12,
      LEFT_W: 250,
      CENTER_W: 390,
      RIGHT_W: 516,
      TOP_H: 580,
      BOTTOM_H: 76
    },
    PARTY: {
      SLOT_COUNT: 3,
      SLOT_H: 164,
      SLOT_GAP: 10
    },
    STORAGE: {
      COLS: 6,
      CELL_W: 78,
      CELL_H: 98,
      CELL_GAP: 6
    },
    MOVES: {
      MAX_EQUIPPED: 2
    },
    BATTLE: {
      TURN_INTERVAL_MS: 700,
      ENEMY_LEVEL_HP: 90,
      ENEMY_LEVEL_ATK: 14,
      BASIC_FALLBACK_DAMAGE: 6
    },
    REWARD: {
      WIN_POINTS: 40,
      LOSE_POINTS: 5,
      ITEM_KEY: 'core_shard',
      ITEM_COUNT_WIN: 1,
      ITEM_COUNT_LOSE: 0
    },
    FONT: {
      TITLE: 22,
      NORMAL: 16,
      SMALL: 13
    },
    DATA: {
      MONSTERS: [
        {
          id: 'm_001',
          name: 'Ember Lynx',
          stats: { hp: 88, atk: 18 },
          knownMoves: ['mv_fire_tap', 'mv_claw_swipe', 'mv_focus_bite'],
          learnableMoves: ['mv_fire_tap', 'mv_claw_swipe', 'mv_focus_bite'],
          equippedMoves: ['mv_fire_tap']
        },
        {
          id: 'm_002',
          name: 'Frost Fang',
          stats: { hp: 96, atk: 16 },
          knownMoves: ['mv_ice_shot', 'mv_claw_swipe'],
          learnableMoves: ['mv_ice_shot', 'mv_claw_swipe', 'mv_guard_howl'],
          equippedMoves: ['mv_ice_shot']
        },
        {
          id: 'm_003',
          name: 'Stone Golem',
          stats: { hp: 120, atk: 12 },
          knownMoves: ['mv_rock_crush', 'mv_guard_howl'],
          learnableMoves: ['mv_rock_crush', 'mv_guard_howl'],
          equippedMoves: ['mv_rock_crush']
        },
        {
          id: 'm_004',
          name: 'Sky Wyvern',
          stats: { hp: 84, atk: 20 },
          knownMoves: ['mv_wind_slice', 'mv_focus_bite'],
          learnableMoves: ['mv_wind_slice', 'mv_focus_bite'],
          equippedMoves: ['mv_wind_slice']
        }
      ],
      MOVES: [
        { id: 'mv_fire_tap', name: 'Fire Tap', power: 14 },
        { id: 'mv_claw_swipe', name: 'Claw Swipe', power: 12 },
        { id: 'mv_focus_bite', name: 'Focus Bite', power: 18 },
        { id: 'mv_ice_shot', name: 'Ice Shot', power: 15 },
        { id: 'mv_guard_howl', name: 'Guard Howl', power: 9 },
        { id: 'mv_rock_crush', name: 'Rock Crush', power: 16 },
        { id: 'mv_wind_slice', name: 'Wind Slice', power: 17 }
      ]
    }
  };

  const gameState = {
    phase: 'start',
    ui: {
      selectedMonsterId: null,
      selectedPartySlotIndex: null,
      clickQueue: []
    },
    player: {
      points: 0,
      items: {}
    },
    party: [],
    storage: [],
    monsters: {},
    moves: {},
    battle: {
      enemy: null,
      result: null,
      reward: {},
      playerHP: 0,
      enemyHP: 0,
      turnTimer: 0,
      log: ''
    }
  };

  const runtime = {
    canvas: null,
    ctx: null,
    lastTs: 0,
    images: {},
    uiRects: {
      partySlots: [],
      storageCells: [],
      knownMoveRows: [],
      equippedMoveRows: [],
      buttons: {}
    }
  };

  function createImage(pathKey) {
    if (typeof pathKey !== 'string' || pathKey.length === 0) return null;
    const parts = pathKey.split('.');
    const category = parts[0] || '';
    const name = parts.slice(1).join('_');
    if (!category || !name) return null;
    const img = new Image();
    img.src = '/assets/' + category + '/' + name + '.png';
    return img;
  }

  function safeDrawImage(ctx, img, x, y, w, h) {
    if (!ctx) return false;
    if (!img || typeof img !== 'object') return false;
    if (!img.complete || !img.naturalWidth) return false;
    ctx.drawImage(img, x, y, w, h);
    return true;
  }

  function cloneArray(arr) {
    return Array.isArray(arr) ? arr.slice() : [];
  }

  function isValidSlotIndex(index) {
    return Number.isInteger(index) && index >= 0 && index < CONFIG.PARTY.SLOT_COUNT;
  }

  function getMonsterById(monsterId) {
    if (!monsterId || !gameState.monsters) return null;
    const m = gameState.monsters[monsterId];
    return m && typeof m === 'object' ? m : null;
  }

  function getMoveById(moveId) {
    if (!moveId || !gameState.moves) return null;
    const mv = gameState.moves[moveId];
    return mv && typeof mv === 'object' ? mv : null;
  }

  function getSelectedMonster() {
    return getMonsterById(gameState.ui.selectedMonsterId);
  }

  function isMonsterInParty(monsterId) {
    if (!monsterId) return false;
    return gameState.party.some(function (id) {
      return id === monsterId;
    });
  }

  function isMonsterInStorage(monsterId) {
    if (!monsterId) return false;
    return gameState.storage.some(function (id) {
      return id === monsterId;
    });
  }

  function assignMonsterToParty(monsterId, slotIndex) {
    if (!isValidSlotIndex(slotIndex)) return false;
    const monster = getMonsterById(monsterId);
    if (!monster) return false;
    if (isMonsterInParty(monsterId)) return false;

    const storageIndex = gameState.storage.indexOf(monsterId);
    if (storageIndex < 0) return false;

    const currentId = gameState.party[slotIndex];
    if (currentId) {
      gameState.storage.push(currentId);
    }

    gameState.storage.splice(storageIndex, 1);
    gameState.party[slotIndex] = monsterId;
    return true;
  }

  function removeMonsterFromParty(slotIndex) {
    if (!isValidSlotIndex(slotIndex)) return false;
    const currentId = gameState.party[slotIndex];
    if (!currentId) return false;
    if (!isMonsterInStorage(currentId)) {
      gameState.storage.push(currentId);
    }
    gameState.party[slotIndex] = null;

    if (gameState.ui.selectedMonsterId === currentId) {
      gameState.ui.selectedMonsterId = null;
    }
    return true;
  }

  function canEquipMove(monster, moveId) {
    if (!monster || !moveId) return false;
    const known = Array.isArray(monster.knownMoves) ? monster.knownMoves : [];
    const learnable = Array.isArray(monster.learnableMoves) ? monster.learnableMoves : [];
    return known.indexOf(moveId) >= 0 && learnable.indexOf(moveId) >= 0;
  }

  function equipMove(monsterId, moveId) {
    const monster = getMonsterById(monsterId);
    const move = getMoveById(moveId);
    if (!monster || !move) return false;
    if (!canEquipMove(monster, moveId)) return false;

    if (!Array.isArray(monster.equippedMoves)) {
      monster.equippedMoves = [];
    }
    if (monster.equippedMoves.indexOf(moveId) >= 0) return false;
    if (monster.equippedMoves.length >= CONFIG.MOVES.MAX_EQUIPPED) return false;

    monster.equippedMoves.push(moveId);
    return true;
  }

  function unequipMove(monsterId, moveId) {
    const monster = getMonsterById(monsterId);
    if (!monster || !Array.isArray(monster.equippedMoves)) return false;
    const idx = monster.equippedMoves.indexOf(moveId);
    if (idx < 0) return false;
    monster.equippedMoves.splice(idx, 1);
    return true;
  }

  function getFirstPartyMonster() {
    for (let i = 0; i < gameState.party.length; i += 1) {
      const id = gameState.party[i];
      const m = getMonsterById(id);
      if (m) return m;
    }
    return null;
  }

  function createEnemy() {
    return {
      id: 'enemy_001',
      name: 'Wild Slime',
      stats: {
        hp: CONFIG.BATTLE.ENEMY_LEVEL_HP,
        atk: CONFIG.BATTLE.ENEMY_LEVEL_ATK
      },
      equippedMoves: ['mv_claw_swipe']
    };
  }

  function makeRect(x, y, w, h) {
    return { x: x, y: y, w: w, h: h };
  }

  function isPointInRect(px, py, rect) {
    if (!rect) return false;
    return px >= rect.x && py >= rect.y && px <= rect.x + rect.w && py <= rect.y + rect.h;
  }

  function initData() {
    gameState.party = new Array(CONFIG.PARTY.SLOT_COUNT).fill(null);
    gameState.storage = [];
    gameState.monsters = {};
    gameState.moves = {};

    for (let i = 0; i < CONFIG.DATA.MOVES.length; i += 1) {
      const move = CONFIG.DATA.MOVES[i];
      gameState.moves[move.id] = {
        id: move.id,
        name: move.name,
        power: move.power
      };
    }

    for (let j = 0; j < CONFIG.DATA.MONSTERS.length; j += 1) {
      const m = CONFIG.DATA.MONSTERS[j];
      gameState.monsters[m.id] = {
        id: m.id,
        name: m.name,
        stats: { hp: m.stats.hp, atk: m.stats.atk },
        knownMoves: cloneArray(m.knownMoves),
        learnableMoves: cloneArray(m.learnableMoves),
        equippedMoves: cloneArray(m.equippedMoves)
      };
      gameState.storage.push(m.id);
    }

    gameState.battle.reward = {};
    gameState.battle.result = null;
    gameState.battle.enemy = null;
    gameState.battle.playerHP = 0;
    gameState.battle.enemyHP = 0;
    gameState.battle.turnTimer = 0;
    gameState.battle.log = '';
  }

  function initAssets() {
    runtime.images.cardPanel = createImage('cards.cards_ui_panel_idle');
    runtime.images.cardButton = createImage('cards.cards_ui_button_idle');
    runtime.images.monsterDefault = createImage('monsters.monsters_neutral_profile_idle');
  }

  function getOrCreateCanvas() {
    let canvas = document.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      document.body.appendChild(canvas);
    }
    canvas.width = CONFIG.CANVAS.WIDTH;
    canvas.height = CONFIG.CANVAS.HEIGHT;
    canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.background = CONFIG.CANVAS.BG;
    return canvas;
  }

  function startBattle() {
    const playerMonster = getFirstPartyMonster();
    if (!playerMonster) return false;
    gameState.phase = 'playing';
    gameState.battle.enemy = createEnemy();
    gameState.battle.result = null;
    gameState.battle.reward = {};
    gameState.battle.playerHP = playerMonster.stats.hp;
    gameState.battle.enemyHP = gameState.battle.enemy.stats.hp;
    gameState.battle.turnTimer = CONFIG.BATTLE.TURN_INTERVAL_MS;
    gameState.battle.log = 'Battle started!';
    return true;
  }

  function applyReward(win) {
    const points = win ? CONFIG.REWARD.WIN_POINTS : CONFIG.REWARD.LOSE_POINTS;
    const itemCount = win ? CONFIG.REWARD.ITEM_COUNT_WIN : CONFIG.REWARD.ITEM_COUNT_LOSE;

    gameState.player.points += points;
    if (!gameState.player.items[CONFIG.REWARD.ITEM_KEY]) {
      gameState.player.items[CONFIG.REWARD.ITEM_KEY] = 0;
    }
    gameState.player.items[CONFIG.REWARD.ITEM_KEY] += itemCount;

    gameState.battle.reward = {
      points: points,
      items: {}
    };
    gameState.battle.reward.items[CONFIG.REWARD.ITEM_KEY] = itemCount;
  }

  function endBattle(win) {
    gameState.battle.result = win ? 'win' : 'lose';
    applyReward(win);
    gameState.phase = 'gameover';
  }

  function getMonsterActiveMove(monster) {
    if (!monster) return null;
    const equipped = Array.isArray(monster.equippedMoves) ? monster.equippedMoves : [];
    const moveId = equipped.length > 0 ? equipped[0] : null;
    return getMoveById(moveId);
  }

  function computeDamage(attacker, move) {
    const atk = attacker && attacker.stats && Number.isFinite(attacker.stats.atk) ? attacker.stats.atk : 0;
    const power = move && Number.isFinite(move.power) ? move.power : CONFIG.BATTLE.BASIC_FALLBACK_DAMAGE;
    const damage = atk + power;
    return damage > 0 ? damage : CONFIG.BATTLE.BASIC_FALLBACK_DAMAGE;
  }

  function processBattleTurn() {
    const player = getFirstPartyMonster();
    const enemy = gameState.battle.enemy;
    if (!player || !enemy) {
      endBattle(false);
      return;
    }

    const playerMove = getMonsterActiveMove(player);
    const enemyMove = getMonsterActiveMove(enemy);

    const playerDamage = computeDamage(player, playerMove);
    gameState.battle.enemyHP -= playerDamage;

    if (gameState.battle.enemyHP <= 0) {
      gameState.battle.enemyHP = 0;
      gameState.battle.log = player.name + ' defeated ' + enemy.name + '!';
      endBattle(true);
      return;
    }

    const enemyDamage = computeDamage(enemy, enemyMove);
    gameState.battle.playerHP -= enemyDamage;

    if (gameState.battle.playerHP <= 0) {
      gameState.battle.playerHP = 0;
      gameState.battle.log = enemy.name + ' defeated ' + player.name + '!';
      endBattle(false);
      return;
    }

    gameState.battle.log =
      player.name + ' used ' + (playerMove ? playerMove.name : 'Struggle') +
      ' / ' + enemy.name + ' used ' + (enemyMove ? enemyMove.name : 'Struggle');
  }

  function validateSelection() {
    if (gameState.ui.selectedMonsterId && !getMonsterById(gameState.ui.selectedMonsterId)) {
      gameState.ui.selectedMonsterId = null;
    }
    if (!isValidSlotIndex(gameState.ui.selectedPartySlotIndex)) {
      gameState.ui.selectedPartySlotIndex = null;
    }
  }

  function onCanvasClick(ev) {
    if (!runtime.canvas) return;
    const rect = runtime.canvas.getBoundingClientRect();
    const scaleX = runtime.canvas.width / rect.width;
    const scaleY = runtime.canvas.height / rect.height;
    const x = (ev.clientX - rect.left) * scaleX;
    const y = (ev.clientY - rect.top) * scaleY;
    gameState.ui.clickQueue.push({ x: x, y: y });
  }

  function handleStartClick(click) {
    const b = runtime.uiRects.buttons;
    if (!click || !b) return;

    if (isPointInRect(click.x, click.y, b.startBattle)) {
      startBattle();
      return;
    }
    if (isPointInRect(click.x, click.y, b.assign)) {
      assignMonsterToParty(gameState.ui.selectedMonsterId, gameState.ui.selectedPartySlotIndex);
      return;
    }
    if (isPointInRect(click.x, click.y, b.remove)) {
      removeMonsterFromParty(gameState.ui.selectedPartySlotIndex);
      return;
    }

    for (let i = 0; i < runtime.uiRects.partySlots.length; i += 1) {
      const slotRect = runtime.uiRects.partySlots[i];
      if (isPointInRect(click.x, click.y, slotRect)) {
        gameState.ui.selectedPartySlotIndex = i;
        const monsterId = gameState.party[i];
        gameState.ui.selectedMonsterId = monsterId || null;
        return;
      }
    }

    for (let j = 0; j < runtime.uiRects.storageCells.length; j += 1) {
      const cell = runtime.uiRects.storageCells[j];
      if (isPointInRect(click.x, click.y, cell.rect)) {
        gameState.ui.selectedMonsterId = cell.monsterId;
        return;
      }
    }

    for (let k = 0; k < runtime.uiRects.knownMoveRows.length; k += 1) {
      const row = runtime.uiRects.knownMoveRows[k];
      if (isPointInRect(click.x, click.y, row.rect)) {
        equipMove(row.monsterId, row.moveId);
        return;
      }
    }

    for (let q = 0; q < runtime.uiRects.equippedMoveRows.length; q += 1) {
      const erow = runtime.uiRects.equippedMoveRows[q];
      if (isPointInRect(click.x, click.y, erow.rect)) {
        unequipMove(erow.monsterId, erow.moveId);
        return;
      }
    }
  }

  function handleGameOverClick(click) {
    const btn = runtime.uiRects.buttons && runtime.uiRects.buttons.backToStart;
    if (btn && isPointInRect(click.x, click.y, btn)) {
      gameState.phase = 'start';
      gameState.battle.enemy = null;
      gameState.battle.result = null;
      gameState.battle.log = '';
    }
  }

  function consumeInput() {
    const queue = gameState.ui.clickQueue;
    if (!Array.isArray(queue) || queue.length === 0) return;
    while (queue.length > 0) {
      const click = queue.shift();
      if (!click) continue;
      if (gameState.phase === 'start') {
        handleStartClick(click);
      } else if (gameState.phase === 'gameover') {
        handleGameOverClick(click);
      }
    }
  }

  function update(deltaMs) {
    validateSelection();
    consumeInput();

    if (gameState.phase === 'playing') {
      gameState.battle.turnTimer -= deltaMs;
      if (gameState.battle.turnTimer <= 0) {
        processBattleTurn();
        gameState.battle.turnTimer = CONFIG.BATTLE.TURN_INTERVAL_MS;
      }
    }
  }

  function drawPanel(ctx, rect, title) {
    const usedImage = safeDrawImage(ctx, runtime.images.cardPanel, rect.x, rect.y, rect.w, rect.h);
    if (!usedImage) {
      ctx.fillStyle = CONFIG.CANVAS.PANEL_BG;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.strokeStyle = CONFIG.CANVAS.PANEL_BORDER;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = CONFIG.CANVAS.TEXT;
    ctx.font = 'bold ' + CONFIG.FONT.NORMAL + 'px sans-serif';
    ctx.fillText(title, rect.x + CONFIG.LAYOUT.GAP, rect.y + CONFIG.FONT.TITLE);
  }

  function drawButton(ctx, rect, label, enabled) {
    const usedImage = safeDrawImage(ctx, runtime.images.cardButton, rect.x, rect.y, rect.w, rect.h);
    if (!usedImage) {
      ctx.fillStyle = enabled ? '#274866' : CONFIG.CANVAS.DISABLED;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    ctx.strokeStyle = enabled ? CONFIG.CANVAS.HIGHLIGHT : CONFIG.CANVAS.DISABLED;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = CONFIG.CANVAS.TEXT;
    ctx.font = 'bold ' + CONFIG.FONT.NORMAL + 'px sans-serif';
    ctx.fillText(label, rect.x + CONFIG.LAYOUT.GAP, rect.y + rect.h / 2 + CONFIG.FONT.SMALL / 2);
  }

  function drawMonsterCard(ctx, monster, rect, selected) {
    ctx.fillStyle = '#243247';
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.strokeStyle = selected ? CONFIG.CANVAS.HIGHLIGHT : CONFIG.CANVAS.PANEL_BORDER;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);

    const portraitRect = makeRect(rect.x + CONFIG.LAYOUT.GAP, rect.y + CONFIG.LAYOUT.GAP, rect.w - CONFIG.LAYOUT.GAP * 2, rect.h * 0.45);
    const usedPortrait = safeDrawImage(ctx, runtime.images.monsterDefault, portraitRect.x, portraitRect.y, portraitRect.w, portraitRect.h);
    if (!usedPortrait) {
      ctx.fillStyle = '#2f3f58';
      ctx.fillRect(portraitRect.x, portraitRect.y, portraitRect.w, portraitRect.h);
      ctx.fillStyle = CONFIG.CANVAS.SUBTEXT;
      ctx.font = CONFIG.FONT.SMALL + 'px sans-serif';
      ctx.fillText('NO IMAGE', portraitRect.x + CONFIG.LAYOUT.GAP, portraitRect.y + portraitRect.h / 2);
    }

    if (!monster) {
      ctx.fillStyle = CONFIG.CANVAS.SUBTEXT;
      ctx.font = CONFIG.FONT.NORMAL + 'px sans-serif';
      ctx.fillText('Empty', rect.x + CONFIG.LAYOUT.GAP, rect.y + rect.h - CONFIG.LAYOUT.GAP);
      return;
    }

    ctx.fillStyle = CONFIG.CANVAS.TEXT;
    ctx.font = 'bold ' + CONFIG.FONT.NORMAL + 'px sans-serif';
    ctx.fillText(monster.name, rect.x + CONFIG.LAYOUT.GAP, rect.y + rect.h * 0.62);
    ctx.font = CONFIG.FONT.SMALL + 'px sans-serif';
    ctx.fillStyle = CONFIG.CANVAS.SUBTEXT;
    ctx.fillText('HP: ' + monster.stats.hp + '  ATK: ' + monster.stats.atk, rect.x + CONFIG.LAYOUT.GAP, rect.y + rect.h * 0.78);
    const eq = Array.isArray(monster.equippedMoves) ? monster.equippedMoves.length : 0;
    ctx.fillText('Equipped: ' + eq + '/' + CONFIG.MOVES.MAX_EQUIPPED, rect.x + CONFIG.LAYOUT.GAP, rect.y + rect.h * 0.92);
  }

  function buildStartLayout() {
    runtime.uiRects.partySlots = [];
    runtime.uiRects.storageCells = [];
    runtime.uiRects.knownMoveRows = [];
    runtime.uiRects.equippedMoveRows = [];
    runtime.uiRects.buttons = {};

    const pad = CONFIG.LAYOUT.PADDING;
    const gap = CONFIG.LAYOUT.GAP;
    const topH = CONFIG.LAYOUT.TOP_H;
    const bottomY = pad + topH + gap;
    const leftX = pad;
    const centerX = leftX + CONFIG.LAYOUT.LEFT_W + gap;
    const rightX = centerX + CONFIG.LAYOUT.CENTER_W + gap;

    const partyPanel = makeRect(leftX, pad, CONFIG.LAYOUT.LEFT_W, topH);
    const centerPanel = makeRect(centerX, pad, CONFIG.LAYOUT.CENTER_W, topH);
    const storagePanel = makeRect(rightX, pad, CONFIG.LAYOUT.RIGHT_W, topH);
    const actionsPanel = makeRect(pad, bottomY, CONFIG.CANVAS.WIDTH - pad * 2, CONFIG.LAYOUT.BOTTOM_H);

    const slotX = partyPanel.x + gap;
    let slotY = partyPanel.y + CONFIG.FONT.TITLE + gap;
    for (let i = 0; i < CONFIG.PARTY.SLOT_COUNT; i += 1) {
      const slotRect = makeRect(slotX, slotY, partyPanel.w - gap * 2, CONFIG.PARTY.SLOT_H);
      runtime.uiRects.partySlots.push(slotRect);
      slotY += CONFIG.PARTY.SLOT_H + CONFIG.PARTY.SLOT_GAP;
    }

    const storageStartX = storagePanel.x + gap;
    const storageStartY = storagePanel.y + CONFIG.FONT.TITLE + gap;
    for (let i = 0; i < gameState.storage.length; i += 1) {
      const col = i % CONFIG.STORAGE.COLS;
      const row = Math.floor(i / CONFIG.STORAGE.COLS);
      const cellRect = makeRect(
        storageStartX + col * (CONFIG.STORAGE.CELL_W + CONFIG.STORAGE.CELL_GAP),
        storageStartY + row * (CONFIG.STORAGE.CELL_H + CONFIG.STORAGE.CELL_GAP),
        CONFIG.STORAGE.CELL_W,
        CONFIG.STORAGE.CELL_H
      );
      runtime.uiRects.storageCells.push({ rect: cellRect, monsterId: gameState.storage[i] });
    }

    const detailX = centerPanel.x + gap;
    const detailY = centerPanel.y + CONFIG.FONT.TITLE + gap;
    const rowW = centerPanel.w - gap * 2;
    const rowH = 28;

    const selected = getSelectedMonster();
    const known = selected && Array.isArray(selected.knownMoves) ? selected.knownMoves : [];
    const equipped = selected && Array.isArray(selected.equippedMoves) ? selected.equippedMoves : [];

    for (let k = 0; k < known.length; k += 1) {
      runtime.uiRects.knownMoveRows.push({
        rect: makeRect(detailX, detailY + 220 + k * (rowH + 4), rowW, rowH),
        monsterId: selected ? selected.id : null,
        moveId: known[k]
      });
    }

    for (let j = 0; j < equipped.length; j += 1) {
      runtime.uiRects.equippedMoveRows.push({
        rect: makeRect(detailX, detailY + 380 + j * (rowH + 4), rowW, rowH),
        monsterId: selected ? selected.id : null,
        moveId: equipped[j]
      });
    }

    const btnW = 220;
    const btnH = 48;
    runtime.uiRects.buttons.assign = makeRect(actionsPanel.x + gap, actionsPanel.y + (actionsPanel.h - btnH) / 2, btnW, btnH);
    runtime.uiRects.buttons.remove = makeRect(actionsPanel.x + gap + btnW + gap, actionsPanel.y + (actionsPanel.h - btnH) / 2, btnW, btnH);
    runtime.uiRects.buttons.startBattle = makeRect(actionsPanel.x + actionsPanel.w - btnW - gap, actionsPanel.y + (actionsPanel.h - btnH) / 2, btnW, btnH);

    return {
      partyPanel: partyPanel,
      centerPanel: centerPanel,
      storagePanel: storagePanel,
      actionsPanel: actionsPanel
    };
  }

  function renderStart(ctx) {
    const layout = buildStartLayout();
    drawPanel(ctx, layout.partyPanel, 'Party');
    drawPanel(ctx, layout.centerPanel, 'Monster Detail / Move Setup');
    drawPanel(ctx, layout.storagePanel, 'Storage');
    drawPanel(ctx, layout.actionsPanel, 'Actions');

    for (let i = 0; i < runtime.uiRects.partySlots.length; i += 1) {
      const monsterId = gameState.party[i];
      const monster = getMonsterById(monsterId);
      const selected = gameState.ui.selectedPartySlotIndex === i;
      drawMonsterCard(ctx, monster, runtime.uiRects.partySlots[i], selected);
      ctx.fillStyle = CONFIG.CANVAS.SUBTEXT;
      ctx.font = CONFIG.FONT.SMALL + 'px sans-serif';
      ctx.fillText('Slot ' + (i + 1), runtime.uiRects.partySlots[i].x + CONFIG.LAYOUT.GAP, runtime.uiRects.partySlots[i].y + CONFIG.FONT.SMALL + 2);
    }

    if (runtime.uiRects.storageCells.length === 0) {
      ctx.fillStyle = CONFIG.CANVAS.SUBTEXT;
      ctx.font = CONFIG.FONT.NORMAL + 'px sans-serif';
      ctx.fillText('Storage is empty.', layout.storagePanel.x + CONFIG.LAYOUT.GAP, layout.storagePanel.y + CONFIG.FONT.TITLE + CONFIG.LAYOUT.GAP + CONFIG.FONT.NORMAL);
    }

    for (let i = 0; i < runtime.uiRects.storageCells.length; i += 1) {
      const cell = runtime.uiRects.storageCells[i];
      const monster = getMonsterById(cell.monsterId);
      const isSel = gameState.ui.selectedMonsterId === cell.monsterId;
      drawMonsterCard(ctx, monster, cell.rect, isSel);
    }

    const selectedMonster = getSelectedMonster();
    const detailRect = makeRect(layout.centerPanel.x + CONFIG.LAYOUT.GAP, layout.centerPanel.y + CONFIG.FONT.TITLE + CONFIG.LAYOUT.GAP, layout.centerPanel.w - CONFIG.LAYOUT.GAP * 2, 190);
    drawMonsterCard(ctx, selectedMonster, detailRect, true);

    const knownTitleY = detailRect.y + detailRect.h + CONFIG.LAYOUT.GAP;
    ctx.fillStyle = CONFIG.CANVAS.TEXT;
    ctx.font = 'bold ' + CONFIG.FONT.NORMAL + 'px sans-serif';
    ctx.fillText('Known moves (click to equip)', detailRect.x, knownTitleY);

    for (let k = 0; k < runtime.uiRects.knownMoveRows.length; k += 1) {
      const row = runtime.uiRects.knownMoveRows[k];
      const mv = getMoveById(row.moveId);
      const canEquip = selectedMonster && canEquipMove(selectedMonster, row.moveId) && selectedMonster.equippedMoves.indexOf(row.moveId) < 0 && selectedMonster.equippedMoves.length < CONFIG.MOVES.MAX_EQUIPPED;
      ctx.fillStyle = canEquip ? '#264a35' : '#3e3e3e';
      ctx.fillRect(row.rect.x, row.rect.y, row.rect.w, row.rect.h);
      ctx.strokeStyle = canEquip ? CONFIG.CANVAS.GOOD : CONFIG.CANVAS.DISABLED;
      ctx.strokeRect(row.rect.x, row.rect.y, row.rect.w, row.rect.h);
      ctx.fillStyle = CONFIG.CANVAS.TEXT;
      ctx.font = CONFIG.FONT.SMALL + 'px sans-serif';
      ctx.fillText((mv ? mv.name : 'Unknown') + ' (PWR ' + (mv ? mv.power : 0) + ')', row.rect.x + CONFIG.LAYOUT.GAP, row.rect.y + CONFIG.FONT.NORMAL + 2);
    }

    const eqTitleY = detailRect.y + 370;
    ctx.fillStyle = CONFIG.CANVAS.TEXT;
    ctx.font = 'bold ' + CONFIG.FONT.NORMAL + 'px sans-serif';
    ctx.fillText('Equipped moves (click to unequip)', detailRect.x, eqTitleY);

    for (let j = 0; j < runtime.uiRects.equippedMoveRows.length; j += 1) {
      const row = runtime.uiRects.equippedMoveRows[j];
      const mv = getMoveById(row.moveId);
      ctx.fillStyle = '#4a2f2f';
      ctx.fillRect(row.rect.x, row.rect.y, row.rect.w, row.rect.h);
      ctx.strokeStyle = CONFIG.CANVAS.DANGER;
      ctx.strokeRect(row.rect.x, row.rect.y, row.rect.w, row.rect.h);
      ctx.fillStyle = CONFIG.CANVAS.TEXT;
      ctx.font = CONFIG.FONT.SMALL + 'px sans-serif';
      ctx.fillText((mv ? mv.name : 'Unknown') + ' (PWR ' + (mv ? mv.power : 0) + ')', row.rect.x + CONFIG.LAYOUT.GAP, row.rect.y + CONFIG.FONT.NORMAL + 2);
    }

    const hasSelection = !!selectedMonster;
    const canAssign = hasSelection && isValidSlotIndex(gameState.ui.selectedPartySlotIndex) && isMonsterInStorage(selectedMonster.id) && !isMonsterInParty(selectedMonster.id);
    const selectedSlotMonster = isValidSlotIndex(gameState.ui.selectedPartySlotIndex) ? getMonsterById(gameState.party[gameState.ui.selectedPartySlotIndex]) : null;
    const canRemove = !!selectedSlotMonster;
    const canStart = !!getFirstPartyMonster();

    drawButton(ctx, runtime.uiRects.buttons.assign, 'Assign to Slot', canAssign);
    drawButton(ctx, runtime.uiRects.buttons.remove, 'Remove from Slot', canRemove);
    drawButton(ctx, runtime.uiRects.buttons.startBattle, 'Start Battle', canStart);

    ctx.fillStyle = CONFIG.CANVAS.SUBTEXT;
    ctx.font = CONFIG.FONT.NORMAL + 'px sans-serif';
    ctx.fillText('Points: ' + gameState.player.points, layout.actionsPanel.x + 700, layout.actionsPanel.y + 28);
    ctx.fillText('Item ' + CONFIG.REWARD.ITEM_KEY + ': ' + (gameState.player.items[CONFIG.REWARD.ITEM_KEY] || 0), layout.actionsPanel.x + 700, layout.actionsPanel.y + 52);
  }

  function buildGameOverLayout() {
    const panel = makeRect(220, 140, 760, 420);
    runtime.uiRects.buttons = {
      backToStart: makeRect(panel.x + 250, panel.y + 320, 260, 56)
    };
    return { panel: panel };
  }

  function renderPlaying(ctx) {
    const panel = makeRect(120, 90, CONFIG.CANVAS.WIDTH - 240, CONFIG.CANVAS.HEIGHT - 180);
    drawPanel(ctx, panel, 'Battle');

    const player = getFirstPartyMonster();
    const enemy = gameState.battle.enemy;

    const leftCard = makeRect(panel.x + 50, panel.y + 80, 320, 360);
    const rightCard = makeRect(panel.x + panel.w - 370, panel.y + 80, 320, 360);
    drawMonsterCard(ctx, player, leftCard, true);
    drawMonsterCard(ctx, enemy, rightCard, false);

    ctx.fillStyle = CONFIG.CANVAS.TEXT;
    ctx.font = 'bold ' + CONFIG.FONT.NORMAL + 'px sans-serif';
    ctx.fillText('Player HP: ' + gameState.battle.playerHP, leftCard.x, leftCard.y + leftCard.h + 26);
    ctx.fillText('Enemy HP: ' + gameState.battle.enemyHP, rightCard.x, rightCard.y + rightCard.h + 26);

    ctx.fillStyle = CONFIG.CANVAS.SUBTEXT;
    ctx.font = CONFIG.FONT.NORMAL + 'px sans-serif';
    ctx.fillText(gameState.battle.log || '', panel.x + 50, panel.y + panel.h - 40);
  }

  function renderGameOver(ctx) {
    const layout = buildGameOverLayout();
    drawPanel(ctx, layout.panel, 'Result');

    const win = gameState.battle.result === 'win';
    const headline = win ? 'Victory!' : 'Defeat';
    ctx.fillStyle = win ? CONFIG.CANVAS.GOOD : CONFIG.CANVAS.DANGER;
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(headline, layout.panel.x + 280, layout.panel.y + 90);

    const reward = gameState.battle.reward || {};
    const points = Number.isFinite(reward.points) ? reward.points : 0;
    const items = reward.items && reward.items[CONFIG.REWARD.ITEM_KEY] ? reward.items[CONFIG.REWARD.ITEM_KEY] : 0;

    ctx.fillStyle = CONFIG.CANVAS.TEXT;
    ctx.font = CONFIG.FONT.TITLE + 'px sans-serif';
    ctx.fillText('Points gained: ' + points, layout.panel.x + 170, layout.panel.y + 170);
    ctx.fillText('Items gained: ' + CONFIG.REWARD.ITEM_KEY + ' x' + items, layout.panel.x + 170, layout.panel.y + 220);
    ctx.fillText('Total Points: ' + gameState.player.points, layout.panel.x + 170, layout.panel.y + 270);

    drawButton(ctx, runtime.uiRects.buttons.backToStart, 'Back to Customization', true);
  }

  function render() {
    const ctx = runtime.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    ctx.fillStyle = CONFIG.CANVAS.BG;
    ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    if (gameState.phase === 'start') {
      renderStart(ctx);
    } else if (gameState.phase === 'playing') {
      renderPlaying(ctx);
    } else if (gameState.phase === 'gameover') {
      renderGameOver(ctx);
    }
  }

  function loop(ts) {
    if (!runtime.lastTs) {
      runtime.lastTs = ts;
    }
    const delta = ts - runtime.lastTs;
    runtime.lastTs = ts;

    update(delta);
    render();
    window.requestAnimationFrame(loop);
  }

  function init() {
    runtime.canvas = getOrCreateCanvas();
    runtime.ctx = runtime.canvas.getContext('2d');
    initAssets();
    initData();
    runtime.canvas.addEventListener('click', onCanvasClick);
    window.requestAnimationFrame(loop);
  }

  init();
})();
