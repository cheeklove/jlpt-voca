
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

// 레벨과 최대 챕터 수는 여기서 조절
const levels = [
  { level: 'n2', max: 10 },
  { level: 'n3', max: 10 },
];

function fileExists(p) {
  try { fs.accessSync(p, fs.constants.F_OK); return true; }
  catch { return false; }
}

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function buildJsonForLevel(level, max) {
  const arr = [];
  for (let i = 1; i <= max; i++) {
    const num = String(i).padStart(2, '0');
    const rel = `${level}/ch${num}.html`;
    const abs = path.join(ROOT, rel);
    const exists = fileExists(abs);
    arr.push({
      title: `${level.toUpperCase()} - 챕터 ${num}`,
      path: rel,
      available: exists
    });
  }
  return arr;
}

function main() {
  // 폴더가 없어도 JSON은 만들 수 있게 보장
  ensureDir(path.join(ROOT, 'n2'));
  ensureDir(path.join(ROOT, 'n3'));

  for (const { level, max } of levels) {
    const list = buildJsonForLevel(level, max);
    const out = path.join(ROOT, `chapters-${level}.json`);
    fs.writeFileSync(out, JSON.stringify(list, null, 2), 'utf8');
    console.log(`Generated ${out}`);
  }
}

main();
