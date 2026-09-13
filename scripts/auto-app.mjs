import { execa } from 'execa';
import * as path from 'path';
import * as fs from 'fs';
import 'dotenv/config';

async function main() {
  console.log(`
┌────────────────────────────────────────────────────────────────────────┐
│  🚀 Aftercode - Unified End-to-End Hybrid RAG & Video Engine           │
└────────────────────────────────────────────────────────────────────────┘
`);

  const root = process.cwd();
  const inventoryPath = path.join(root, 'processing', 'repository-inventory.json');
  const metadataDir = path.join(root, 'output', 'metadata');
  const uiProjectsPath = path.join(root, 'ui', 'src', 'data', 'projects.json');

  // 1. Build TypeScript Backend
  console.log(' 🔨 [1/4] Compiling TypeScript backend modules...');
  await execa('npm', ['run', 'build'], { stdio: 'inherit' });

  // 2. Auto-Discover if inventory is missing
  if (!fs.existsSync(inventoryPath)) {
    console.log(' 🔍 [2/4] Repository inventory missing. Auto-running GitHub discovery...');
    await execa('npm', ['run', 'discover'], { stdio: 'inherit' });
  } else {
    console.log(' ✅ [2/4] Repository inventory active.');
  }

  // 3. Auto-Sync UI metadata
  console.log(' 🔄 [3/4] Auto-syncing project metadata to UI dataset...');
  await execa('npm', ['run', 'ui:sync'], { stdio: 'inherit' });

  // 4. Start Unified Backend Server & Vite Frontend
  console.log('\n 🚀 [4/4] Launching End-to-End App Server & Vite Frontend Dashboard...\n');

  // Import compiled backend server
  const { startAftercodeServer } = await import('../dist/server/server.js');
  startAftercodeServer();

  // Launch Vite dev server
  const viteProcess = execa('npm', ['--prefix', 'ui', 'run', 'dev'], { stdio: 'inherit' });

  console.log(`
✨ ==================================================================== ✨
  🎉 Aftercode End-to-End Application Ready!
  🌐 Open Dashboard UI: http://localhost:5173
  ⚡ Live Backend Server: http://localhost:3001
✨ ==================================================================== ✨
`);

  await viteProcess;
}

main().catch((err) => {
  console.error('Fatal Application Error:', err);
  process.exit(1);
});
