import { el } from './dom.js';

export function createModalController() {
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
