import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execa } from 'execa';

export function isSafeSandboxPath(targetPath: string): boolean {
  const resolved = path.resolve(targetPath);
  const cwd = path.resolve(process.cwd());

  // NEVER wipe cwd, parent of cwd, user home directory (~), or system root /
  if (resolved === cwd || cwd.startsWith(resolved) || resolved === path.resolve(os.homedir()) || resolved === '/') {
    return false;
  }

  // Explicitly allow dedicated workspace sandboxes and temp paths
  const normalized = resolved.toLowerCase();
  const isInsideTemp = normalized.startsWith(path.resolve(os.tmpdir()).toLowerCase());
  const isWorkspaceSubdir = normalized.includes('/workspace') || normalized.includes('.workspace');

  if (isWorkspaceSubdir || isInsideTemp) {
    return true;
  }

  // For arbitrary outside paths, protect against wiping project roots
  if (fs.existsSync(path.join(resolved, 'AGENTS.md')) && fs.existsSync(path.join(resolved, 'package.json'))) {
    return false;
  }

  return true;
}

export async function prepareWorkspace(workspaceDir: string): Promise<void> {
  const resolved = path.resolve(workspaceDir);
  if (!isSafeSandboxPath(resolved)) {
    throw new Error(`[Safety Guard] Blocked prepareWorkspace on unsafe path: ${resolved}`);
  }
  console.log(` 🧹 [Step 1/7] Wiping & preparing workspace sandbox directory at: ${resolved}`);
  await wipeWorkspace(resolved);
  fs.mkdirSync(resolved, { recursive: true });
}

export async function cloneRepositoryToWorkspace(repoUrl: string, workspaceDir: string): Promise<void> {
  const resolved = path.resolve(workspaceDir);
  await prepareWorkspace(resolved);

  const token = process.env.GITHUB_TOKEN;
  const hasValidToken = token && !token.includes('your_') && !token.includes('YOUR_');
  const authHeaderValue = hasValidToken
    ? `AUTHORIZATION: basic ${Buffer.from(`x-access-token:${token}`).toString('base64')}`
    : '';

  try {
    console.log(` 📥 [Step 1/7] Executing full shallow clone (git clone --depth 1) for ${repoUrl}...`);
    const extraEnv: Record<string, string> = {
      GIT_TERMINAL_PROMPT: '0',
      GIT_LFS_SKIP_SMUDGE: '1',
    };
    if (authHeaderValue) {
      extraEnv.GIT_CONFIG_COUNT = '1';
      extraEnv.GIT_CONFIG_KEY_0 = 'http.extraheader';
      extraEnv.GIT_CONFIG_VALUE_0 = authHeaderValue;
    }

    await execa('git', ['clone', '--depth', '1', '--single-branch', '--no-tags', repoUrl, '.'], {
      cwd: resolved,
      timeout: 30000,
      env: {
        ...process.env,
        ...extraEnv,
      },
    });
    console.log(` ✅ [Step 1/7] Shallow clone completed successfully into workspace sandbox.`);
  } catch (err) {
    const rawErrMsg = (err as Error).message || '';
    const safeErrMsg = token ? rawErrMsg.replaceAll(token, '[REDACTED_TOKEN]') : rawErrMsg;
    console.warn(` ⚠️ [Step 1/7] Git clone encountered error (${safeErrMsg}). Switching to GitHub API Tarball Streaming Fallback...`);
    try {
      await prepareWorkspace(resolved);
      const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
      if (!match) throw err;
      const owner = match[1];
      const repo = match[2].replace(/\.git$/, '');
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/tarball`;
      const authHeader = token ? `-H "Authorization: Bearer ${token}"` : '';
      const archivePath = path.join(path.dirname(resolved), `${repo}-archive.tar.gz`);

      await execa('sh', ['-c', `curl -L -s ${authHeader} "${apiUrl}" -o "${archivePath}"`]);
      await execa('tar', ['-xzf', archivePath, '-C', resolved, '--strip-components=1']);
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
  const resolved = path.resolve(workspaceDir);
  if (!isSafeSandboxPath(resolved)) {
    console.warn(` 🛡️ [Safety Guard] Refusing to wipe protected directory: ${resolved}`);
    return;
  }

  if (fs.existsSync(resolved)) {
    try {
      const items = fs.readdirSync(resolved);
      for (const item of items) {
        fs.rmSync(path.join(resolved, item), { recursive: true, force: true });
      }
      fs.rmSync(resolved, { recursive: true, force: true });
    } catch {
      // Ignore if directory missing or locked
    }
  }
}

