import { MONSTERS } from '../data/monsters.js';
import { CONFIG } from '../config.js';

function makeUnit(base) {
  return { ...base, hp: CONFIG.STARTING_HP, alive: true, tempAtk: 0 };
}

export function createInitialGameState() {
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
