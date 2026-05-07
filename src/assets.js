export const ASSETS = {
  battleBg: 'assets/backgrounds/background_battle.png',
  placeholder: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="120"><rect width="100%" height="100%" fill="%23333"/><text x="50%" y="50%" fill="white" dominant-baseline="middle" text-anchor="middle" font-size="14">NO IMAGE</text></svg>'
};

export function createSafeImage(src, alt, className = '') {
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
