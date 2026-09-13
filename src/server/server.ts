import * as http from 'http';
import * as path from 'path';
import * as fs from 'fs';
import { fetchRepositoriesFromGitHub, buildInventoryState } from '../github/discover-repositories.js';
import { loadInventoryState, saveInventoryState } from '../processing/status.js';
import { processSingleRepository } from '../processing/runner.js';
import { wipeWorkspace } from '../repository/workspace-manager.js';

const PORT = Number(process.env.PORT) || 3001;

export function syncUiData(): number {
  const root = process.cwd();
  const metadataDir = path.join(root, 'output', 'metadata');
  const uiProjectsPath = path.join(root, 'ui', 'src', 'data', 'projects.json');

  if (!fs.existsSync(metadataDir)) return 0;
  const files = fs.readdirSync(metadataDir).filter((f) => f.endsWith('.json'));
  const projects = files.map((f) => JSON.parse(fs.readFileSync(path.join(metadataDir, f), 'utf-8')));

  fs.mkdirSync(path.dirname(uiProjectsPath), { recursive: true });
  fs.writeFileSync(uiProjectsPath, JSON.stringify(projects, null, 2), 'utf-8');
  return projects.length;
}

export function startAftercodeServer(): http.Server {
  const projectRoot = process.cwd();
  const inventoryPath = path.join(projectRoot, 'processing', 'repository-inventory.json');
  const outputMetadataDir = path.join(projectRoot, 'output', 'metadata');
  const workspaceDir = path.join(projectRoot, 'workspace', 'current');
  const schemaPath = path.join(projectRoot, 'schemas', 'project.schema.json');
  const owner = process.env.GITHUB_OWNER || 'Sameer-Bagul';

  const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

    // GET /api/health
    if (url.pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', engine: 'Aftercode Hybrid RAG Server', time: new Date().toISOString() }));
      return;
    }

    // GET /api/projects
    if (url.pathname === '/api/projects' && req.method === 'GET') {
      const uiProjectsPath = path.join(projectRoot, 'ui', 'src', 'data', 'projects.json');
      let projects = [];
      if (fs.existsSync(uiProjectsPath)) {
        projects = JSON.parse(fs.readFileSync(uiProjectsPath, 'utf-8'));
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(projects));
      return;
    }

    // POST /api/discover
    if (url.pathname === '/api/discover' && req.method === 'POST') {
      try {
        console.log(`🚀 [Server API] Triggering GitHub Discovery for owner: ${owner}...`);
        const token = process.env.GITHUB_TOKEN;
        const repos = await fetchRepositoriesFromGitHub(owner, token);
        const state = buildInventoryState(owner, repos, inventoryPath);
        saveInventoryState(inventoryPath, state);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, totalRepositories: state.totalRepositories, repos }));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    // POST /api/analyze/:slug
    if (url.pathname.startsWith('/api/analyze/') && req.method === 'POST') {
      const slug = url.pathname.replace('/api/analyze/', '').trim();
      try {
        console.log(`🚀 [Server API] End-to-End Hybrid RAG Analysis for slug: '${slug}'...`);
        const state = loadInventoryState(inventoryPath);
        if (!state) {
          throw new Error('Inventory state missing. Run discovery first.');
        }

        const item = state.repositories.find((r) => r.slug === slug || r.name === slug);
        if (!item) {
          throw new Error(`Repository '${slug}' not found in inventory.`);
        }

        const config = {
          owner,
          inventoryPath,
          workspaceDir,
          outputMetadataDir,
          schemaPath,
        };

        const success = await processSingleRepository(item, state, config);
        if (!success) {
          throw new Error(`Processing failed for repository '${slug}'.`);
        }

        // Auto-sync UI data in real time
        const syncedCount = syncUiData();
        console.log(` 🔄 [Server API] Auto-synced ${syncedCount} metadata items to UI projects.json`);

        const outputPath = path.join(outputMetadataDir, `${item.slug}.json`);
        let metadata = null;
        if (fs.existsSync(outputPath)) {
          metadata = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, slug: item.slug, metadata, syncedCount }));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      } finally {
        await wipeWorkspace(workspaceDir);
      }
      return;
    }

    // POST /api/sync
    if (url.pathname === '/api/sync' && req.method === 'POST') {
      const syncedCount = syncUiData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, syncedCount }));
      return;
    }

    // DELETE /api/metadata/:slug
    if (url.pathname.startsWith('/api/metadata/') && req.method === 'DELETE') {
      const slug = url.pathname.replace('/api/metadata/', '').trim();
      try {
        console.log(` 🗑️ [Server API] Deleting metadata for slug: '${slug}'...`);
        const filePath = path.join(outputMetadataDir, `${slug}.json`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        const syncedCount = syncUiData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, slug, syncedCount }));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    // DELETE /api/metadata
    if (url.pathname === '/api/metadata' && req.method === 'DELETE') {
      try {
        console.log(` 🗑️ [Server API] Wiping all metadata files in output/metadata...`);
        let deletedCount = 0;
        if (fs.existsSync(outputMetadataDir)) {
          const files = fs.readdirSync(outputMetadataDir);
          for (const file of files) {
            if (file.endsWith('.json')) {
              fs.unlinkSync(path.join(outputMetadataDir, file));
              deletedCount++;
            }
          }
        }
        const syncedCount = syncUiData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, deletedCount, syncedCount }));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  });

  server.listen(PORT, () => {
    console.log(`\n⚡ [Aftercode End-to-End Server] Running on http://localhost:${PORT}`);
    console.log(` └─ API Endpoints: /api/health, /api/discover, /api/analyze/:slug, /api/projects, /api/sync\n`);
  });

  return server;
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  startAftercodeServer();
}
