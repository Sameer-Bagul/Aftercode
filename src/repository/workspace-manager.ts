import * as fs from 'fs';
import * as path from 'path';
import { execa } from 'execa';

export async function prepareWorkspace(workspaceDir: string): Promise<void> {
  await wipeWorkspace(workspaceDir);
  fs.mkdirSync(workspaceDir, { recursive: true });
}

export async function cloneRepositoryToWorkspace(repoUrl: string, workspaceDir: string): Promise<void> {
  await prepareWorkspace(workspaceDir);

  let targetUrl = repoUrl;
  const token = process.env.GITHUB_TOKEN;
  if (token && targetUrl.startsWith('https://github.com/')) {
    targetUrl = targetUrl.replace('https://github.com/', `https://x-access-token:${token}@github.com/`);
  }

  try {
    // 1. Shallow clone with blob:none filter to skip heavy binary blobs
    await execa('git', ['clone', '--depth', '1', '--filter=blob:none', '--sparse', targetUrl, '.'], {
      cwd: workspaceDir,
      env: {
        ...process.env,
        GIT_TERMINAL_PROMPT: '0',
      },
    });

    // 2. Set sparse-checkout paths for code, documentation, and manifest files
    await execa(
      'git',
      [
        'sparse-checkout',
        'set',
        'src',
        'lib',
        'app',
        'components',
        'pages',
        'server',
        'routes',
        'models',
        'controllers',
        'services',
        'utils',
        'scripts',
        'tests',
        'docs',
        'README.md',
        '*.json',
        '*.toml',
        '*.txt',
        '*.mod',
        '*.prisma',
        '*.sql',
        'Dockerfile',
        'docker-compose.yml',
        'vercel.json',
      ],
      {
        cwd: workspaceDir,
        env: {
          ...process.env,
          GIT_TERMINAL_PROMPT: '0',
        },
      }
    );
  } catch (err) {
    // Fallback to standard shallow clone if sparse checkout fails
    try {
      await prepareWorkspace(workspaceDir);
      await execa('git', ['clone', '--depth', '1', targetUrl, '.'], {
        cwd: workspaceDir,
        env: { ...process.env, GIT_TERMINAL_PROMPT: '0' },
      });
    } catch (fallbackErr) {
      throw new Error(`Failed to clone repository ${repoUrl}: ${(fallbackErr as Error).message}`);
    }
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
