import * as fs from 'fs';
import * as path from 'path';

function syncUiData() {
  const projectRoot = process.cwd();
  const metadataDir = path.join(projectRoot, 'output', 'metadata');
  const targetDir = path.join(projectRoot, 'ui', 'src', 'data');
  const targetFile = path.join(targetDir, 'projects.json');

  if (!fs.existsSync(metadataDir)) {
    console.warn(` ⚠️ Metadata directory missing at ${metadataDir}`);
    return;
  }

  fs.mkdirSync(targetDir, { recursive: true });

  const files = fs.readdirSync(metadataDir).filter((f) => f.endsWith('.json'));
  const projects = files.map((file) => {
    const raw = fs.readFileSync(path.join(metadataDir, file), 'utf-8');
    return JSON.parse(raw);
  });

  fs.writeFileSync(targetFile, JSON.stringify(projects, null, 2));
  console.log(` ✅ Successfully synced ${projects.length} project metadata files into ${targetFile}`);
}

syncUiData();
