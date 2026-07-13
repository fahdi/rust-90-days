// Validate that every lesson is fully authored: no template placeholders,
// all required sections present, and a reasonable amount of content.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.join(__dirname, '..', 'docs');

const PLACEHOLDERS = [
  '[Learning objective for',
  '[Conceptual explanation goes here]',
  '[Important concept to remember]',
  '// Code example goes here',
  '// More advanced example',
  'Expected output here',
  '[Key point 1]',
  '[Key point 2]',
  '[Key point 3]',
  '[Key point 4]',
  '[Common mistake 1]',
  '[Common mistake 2]',
  '[Practice exercise description]',
  '[Helpful hint for the challenge]',
  '// Solution code',
];

const REQUIRED_SECTIONS = [
  "## 🎯 Today's Goal",
  '## 📚 The Concept',
  '## 💻 Hands-On Code',
  '## 🎓 Key Takeaways',
  '## ⚠️ Common Pitfalls',
  '## ✅ Quick Challenge',
  '<ProgressTracker />',
];

const MIN_LENGTH = 2000;

let failures = 0;
let checked = 0;

const weekDirs = fs.readdirSync(docsDir).filter(d => /^week-\d{2}$/.test(d)).sort();

for (const weekDir of weekDirs) {
  const dayFiles = fs.readdirSync(path.join(docsDir, weekDir))
    .filter(f => /^day-\d{2}\.md$/.test(f)).sort();

  for (const dayFile of dayFiles) {
    const rel = `${weekDir}/${dayFile}`;
    const content = fs.readFileSync(path.join(docsDir, weekDir, dayFile), 'utf8');
    const problems = [];

    for (const p of PLACEHOLDERS) {
      if (content.includes(p)) problems.push(`placeholder remains: ${p}`);
    }
    for (const s of REQUIRED_SECTIONS) {
      if (!content.includes(s)) problems.push(`missing section: ${s}`);
    }
    if (content.length < MIN_LENGTH) {
      problems.push(`too short: ${content.length} chars (min ${MIN_LENGTH})`);
    }

    checked++;
    if (problems.length) {
      failures++;
      console.log(`❌ ${rel}`);
      problems.forEach(p => console.log(`   - ${p}`));
    }
  }
}

console.log(`\nChecked ${checked} lessons: ${checked - failures} passed, ${failures} failed.`);
process.exit(failures ? 1 : 0);
