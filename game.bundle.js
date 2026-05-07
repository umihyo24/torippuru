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
      document.body.append(overlay);
    },
    close() {
      if (overlay) overlay.remove();
      overlay = null;
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

