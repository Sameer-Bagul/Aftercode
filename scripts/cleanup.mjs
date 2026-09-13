import * as fs from 'fs';
import * as path from 'path';

function main() {
  const workspaceDir = path.resolve('workspace/current');
  console.log(`🧹 [Cleanup] Force wiping workspace sandbox: ${workspaceDir}...`);
  if (fs.existsSync(workspaceDir)) {
    fs.rmSync(workspaceDir, { recursive: true, force: true });
    fs.mkdirSync(workspaceDir, { recursive: true });
    console.log(` ✅ Workspace sandbox reset successfully.`);
  } else {
    fs.mkdirSync(workspaceDir, { recursive: true });
    console.log(` ✅ Created clean workspace directory.`);
  }
}

main();
