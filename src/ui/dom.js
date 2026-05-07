export function qs(sel, root = document) { return root.querySelector(sel); }
export function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
export function clear(node) { node.replaceChildren(); }
