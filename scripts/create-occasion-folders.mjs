import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { OCCASIONS } from '../src/features/message/occasions/index.ts';

const publicRoot = fileURLToPath(new URL('../public/', import.meta.url));
const roots = ['themes', 'avatars/male', 'avatars/female'];
const ids = [...new Set(OCCASIONS.map((occasion) => occasion.id))];
for (const id of ids) {
  if (!/^[a-z]+(?:-[a-z]+)*$/.test(id)) throw new Error('Invalid occasion folder name: ' + id);
}
for (const root of roots) {
  for (const id of ids) {
    const directory = join(publicRoot, root, id);
    await mkdir(directory, { recursive: true });
    // Keep empty folders in source control; never overwrite an existing file.
    try { await writeFile(join(directory, '.gitkeep'), '', { flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
  }
}
console.log('Ready: ' + ids.length + ' occasion folders in each of ' + roots.map((root) => 'public/' + root).join(', ') + ' (' + ids.length * roots.length + ' total).');