import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const entry = path.join(root, 'src/main.js');
const out = path.join(root, 'game.bundle.js');
const importRe = /^\s*import\s+(?:[^"']+?\s+from\s+)?["'](.+?)["']\s*;?\s*$/gm;

function resolveImport(from, spec) {
  const base = path.resolve(path.dirname(from), spec);
  for (const p of [base, `${base}.js`, path.join(base, 'index.js')]) {
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  throw new Error(`Cannot resolve ${spec} from ${from}`);
}

function strip(code) {
  return code.replace(importRe, '').replace(/^\s*export\s+(?=(const|function|class)\b)/gm, '');
}

const visited = new Set();
const order = [];
function visit(file) {
  if (visited.has(file)) return;
  visited.add(file);
  const src = fs.readFileSync(file, 'utf8');
  importRe.lastIndex = 0;
  let m;
  while ((m = importRe.exec(src))) visit(resolveImport(file, m[1]));
  order.push(file);
}
visit(entry);
const bundle = order.map((f) => `// ${path.relative(root, f)}\n${strip(fs.readFileSync(f, 'utf8'))}\n`).join('\n');
fs.writeFileSync(out, bundle, 'utf8');
console.log('Built game.bundle.js');
