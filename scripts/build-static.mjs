import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(projectRoot, 'dist');
const files = [
  'index.html',
  'article.html',
  'library.html',
  'category.html',
  'note.html',
  'app.js',
  'home.js',
  'agent-notes.js',
  'library-home.js',
  'directory.js',
  'note.js',
  'notes.js',
  'deep-in-embedded.js',
  'taxonomy.js',
  'styles.css',
  'robots.txt',
  'sitemap.xml',
];
const directories = ['assets', 'notes'];

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(projectRoot, file), path.join(outputDir, file));
}

for (const directory of directories) {
  const sourceDir = path.join(projectRoot, directory);
  if (fs.existsSync(sourceDir)) fs.cpSync(sourceDir, path.join(outputDir, directory), { recursive: true });
}

console.log(`Built ${files.length} files and ${directories.length} directories into ${outputDir}`);
