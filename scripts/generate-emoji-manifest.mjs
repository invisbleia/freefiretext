import { readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const emojiDir = join(process.cwd(), 'public', 'emoji', 'emoji');
const outFile = join(process.cwd(), 'public', 'emoji', 'manifest.json');

const entries = await readdir(emojiDir, { withFileTypes: true });
const files = entries
  .filter((e) => e.isFile() && /\.(png|jpg|jpeg|webp|gif)$/i.test(e.name))
  .map((e) => `emoji/${e.name}`)
  .sort();

await writeFile(outFile, JSON.stringify({ files }, null, 2));
console.log(`Wrote ${files.length} emoji paths to public/emoji/manifest.json`);
