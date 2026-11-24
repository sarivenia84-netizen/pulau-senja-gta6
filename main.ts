import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repositoryRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDirectory = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const gameDirectory = join(repositoryRoot, 'game');
const screenshotDirectory = join(repositoryRoot, 'screenshots');

mkdirSync(outputDirectory, { recursive: true });
cpSync(gameDirectory, join(outputDirectory, 'game'), { recursive: true });

const outputScreenshots = join(outputDirectory, 'screenshots');
mkdirSync(outputScreenshots, { recursive: true });
if (existsSync(screenshotDirectory)) {
  cpSync(screenshotDirectory, outputScreenshots, { recursive: true });
}

const dossier = buildDossier(outputDirectory, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDirectory, 'dossier.json'), dossier);
