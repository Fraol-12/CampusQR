import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dirs = ['data', 'uploads', 'uploads/photos'];

await Promise.all(
  dirs.map(async (dir) => {
    const absolute = path.join(root, dir);
    await mkdir(absolute, { recursive: true });
    await writeFile(path.join(absolute, '.gitkeep'), '', { flag: 'a' });
  })
);
