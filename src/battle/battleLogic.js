import { MOVES } from '../data/moves.js';
import { calculateDamage } from './damage.js';
import { applyOnEnterAbility } from './abilities.js';

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

export function startBattle(state) {
  state.phase = 'playing';
  applyOnEnterAbility(state.playerTeam[state.activePlayer]);
  applyOnEnterAbility(state.enemyTeam[state.activeEnemy]);
}

export function performTurn(state, playerMoveId) {
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
