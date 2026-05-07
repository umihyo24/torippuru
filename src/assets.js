export { ASSETS, getAssetPath } from './data/assets.js';

export const applyImageFallback = (imgEl, fallbackText = 'NO IMAGE') => {
  if (!imgEl) return;
  imgEl.addEventListener('error', () => {
    imgEl.style.display = 'none';
    const parent = imgEl.parentElement;
    if (!parent) return;
    if (parent.querySelector('.img-fallback')) return;
    const fallback = document.createElement('div');
    fallback.className = 'img-fallback';
    fallback.textContent = fallbackText;
    parent.appendChild(fallback);
  }, { once: true });
};
