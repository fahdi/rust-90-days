// Extract ```rust code blocks from all lessons and compile each with rustc.
// Only blocks containing `fn main` are compiled (fragments can't stand alone).
// Blocks within 3 lines of a "does NOT compile" marker are skipped.
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, '..', 'docs');
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rust-blocks-'));

let compiled = 0, failed = 0, skipped = 0;
const failures = [];

const weekDirs = fs.readdirSync(docsDir).filter(d => /^week-\d{2}$/.test(d)).sort();
for (const weekDir of weekDirs) {
  const dayFiles = fs.readdirSync(path.join(docsDir, weekDir)).filter(f => /^day-\d{2}\.md$/.test(f)).sort();
  for (const dayFile of dayFiles) {
    const rel = `${weekDir}/${dayFile}`;
    const lines = fs.readFileSync(path.join(docsDir, weekDir, dayFile), 'utf8').split('\n');
    let inBlock = false, block = [], blockStart = 0, idx = 0;
    for (let i = 0; i < lines.length; i++) {
      if (!inBlock && /^```rust\s*$/.test(lines[i])) { inBlock = true; block = []; blockStart = i; continue; }
      if (inBlock && /^```\s*$/.test(lines[i])) {
        inBlock = false; idx++;
        const code = block.join('\n');
        const context = lines.slice(Math.max(0, blockStart - 3), blockStart).join('\n');
        if (!/fn\s+main/.test(code) || /does NOT compile/i.test(context) || /does NOT compile/i.test(code)) { skipped++; continue; }
        const src = path.join(tmpDir, `b${compiled + failed}.rs`);
        fs.writeFileSync(src, code);
        try {
          execFileSync('rustc', ['--edition', '2021', '-A', 'warnings', '-o', path.join(tmpDir, 'out'), src], { stdio: 'pipe' });
          compiled++;
        } catch (e) {
          failed++;
          failures.push({ file: rel, block: idx, line: blockStart + 1, error: e.stderr.toString().split('\n').slice(0, 6).join('\n') });
        }
        continue;
      }
      if (inBlock) block.push(lines[i]);
    }
  }
}

for (const f of failures) {
  console.log(`❌ ${f.file} block #${f.block} (line ${f.line})\n${f.error}\n`);
}
console.log(`Compiled ${compiled} blocks OK, ${failed} failed, ${skipped} skipped (fragments or intentional non-compiling).`);
fs.rmSync(tmpDir, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
