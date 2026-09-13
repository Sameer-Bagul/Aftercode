import * as fs from 'fs';
import * as path from 'path';
import { execa } from 'execa';

export async function prepareWorkspace(workspaceDir: string): Promise<void> {
  console.log(` 🧹 [Step 1/7] Wiping & preparing workspace sandbox directory at: ${workspaceDir}`);
  await wipeWorkspace(workspaceDir);
  fs.mkdirSync(workspaceDir, { recursive: true });
}

export async function cloneRepositoryToWorkspace(repoUrl: string, workspaceDir: string): Promise<void> {
  await prepareWorkspace(workspaceDir);

  let targetUrl = repoUrl;
  const token = process.env.GITHUB_TOKEN;
  if (token && !token.includes('your_') && !token.includes('YOUR_') && targetUrl.startsWith('https://github.com/')) {
    targetUrl = targetUrl.replace('https://github.com/', `https://x-access-token:${token}@github.com/`);
  }

  try {
    console.log(` 📥 [Step 1/7] Executing full shallow clone (git clone --depth 1) for ${repoUrl}...`);
    // Perform standard shallow clone to capture all repository directories and files
    await execa('git', ['clone', '--depth', '1', targetUrl, '.'], {
      cwd: workspaceDir,
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0',
      },
    });
    console.log(` ✅ [Step 1/7] Shallow clone completed successfully into workspace sandbox.`);
  } catch (err) {
    throw new Error(`Failed to clone repository ${repoUrl}: ${(err as Error).message}`);
  }
}

export async function wipeWorkspace(workspaceDir: string): Promise<void> {
  if (fs.existsSync(workspaceDir)) {
    try {
      fs.rmSync(workspaceDir, { recursive: true, force: true });
    } catch {
      // Ignore if directory missing
    }
  }
}
