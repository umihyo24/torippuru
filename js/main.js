import { gameState } from "./state.js";
import { update, clearContextSelectionIfInvalid } from "./update.js";
import { createUI, render, renderUI } from "./render.js";
import { bindUIEvents } from "./input.js";

const root = document.querySelector("#app");
const { canvas } = createUI(root);
const ctx = canvas.getContext("2d");

bindUIEvents(root, canvas);
renderUI(gameState);

let lastTime = performance.now();
const frame = (now) => {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  update(gameState, dt);
  clearContextSelectionIfInvalid(gameState);
  render(ctx, gameState);
  renderUI(gameState);
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);
