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
    await execa('git', ['clone', '--depth', '1', '--single-branch', '--no-tags', targetUrl, '.'], {
      cwd: workspaceDir,
      timeout: 10000,
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0',
        GIT_LFS_SKIP_SMUDGE: '1',
      },
    });
    console.log(` ✅ [Step 1/7] Shallow clone completed successfully into workspace sandbox.`);
  } catch (err) {
    console.warn(` ⚠️ [Step 1/7] Git clone encountered error (${(err as Error).message}). Switching to GitHub API Tarball Streaming Fallback...`);
    try {
      await prepareWorkspace(workspaceDir);
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw err;
      const owner = match[1];
      const repo = match[2].replace(/\.git$/, '');
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/tarball`;
      const authHeader = token ? `-H "Authorization: Bearer ${token}"` : '';
      const archivePath = path.join(path.dirname(workspaceDir), `${repo}-archive.tar.gz`);

      await execa('sh', ['-c', `curl -L -s ${authHeader} "${apiUrl}" -o "${archivePath}"`]);
      await execa('tar', ['-xzf', archivePath, '-C', workspaceDir, '--strip-components=1']);
      if (fs.existsSync(archivePath)) {
        fs.unlinkSync(archivePath);
      }
      console.log(` ✅ [Step 1/7] GitHub API Tarball archive extracted successfully into workspace sandbox.`);
    } catch (fallbackErr) {
      throw new Error(`Failed to extract repository ${repoUrl}: ${(fallbackErr as Error).message}`);
    }
  }
}

export async function wipeWorkspace(workspaceDir: string): Promise<void> {
  if (fs.existsSync(workspaceDir)) {
    try {
      const items = fs.readdirSync(workspaceDir);
      for (const item of items) {
        fs.rmSync(path.join(workspaceDir, item), { recursive: true, force: true });
      }
      fs.rmSync(workspaceDir, { recursive: true, force: true });
    } catch {
      // Ignore if directory missing or locked
    }
  }
}
