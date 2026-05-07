import { createSafeImage, ASSETS } from '../assets.js';
import { el, clear } from './dom.js';
import { MOVES } from '../data/moves.js';

function hpText(unit) { return `${unit.hp}/120`; }

export function renderBattle(app, state, onCommand, onOpenLog) {
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
