import { createInitialGameState } from './state/gameState.js';
import { startBattle, performTurn } from './battle/battleLogic.js';
import { renderBattle } from './ui/render.js';
import { createModalController } from './ui/modal.js';
import { el } from './ui/dom.js';

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
