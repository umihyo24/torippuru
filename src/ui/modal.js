export const closeModalOverlay = (overlayEl) => {
  if (!overlayEl) return;
  overlayEl.style.pointerEvents = 'none';
};
