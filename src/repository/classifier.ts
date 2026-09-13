import * as fs from 'fs';
import * as path from 'path';

export interface ClassificationResult {
  type: 'portfolio-worthy' | 'secondary' | 'practice' | 'fork' | 'archived' | 'empty' | 'unknown';
  portfolioWorthiness: 'high' | 'medium' | 'low' | 'unknown';
  reasons: string[];
}

export function classifyRepository(
  workspaceDir: string,
  isFork: boolean,
  isArchived: boolean
): ClassificationResult {
  const reasons: string[] = [];

  if (isArchived) {
    return {
      type: 'archived',
      portfolioWorthiness: 'low',
      reasons: ['Repository marked as archived'],
    };
  }

  if (isFork) {
    return {
      type: 'fork',
      portfolioWorthiness: 'low',
      reasons: ['Repository is a fork'],
    };
  }

  if (!fs.existsSync(workspaceDir)) {
    return {
      type: 'empty',
      portfolioWorthiness: 'low',
      reasons: ['Workspace directory empty or missing'],
    };
  }

  let fileCount = 0;
  let hasManifest = false;
  let hasDocker = false;
  let hasDatabase = false;
  let hasAi = false;
  let hasReadme = false;

  function scan(dir: string, depth = 0) {
    if (depth > 5) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath, depth + 1);
      } else if (entry.isFile()) {
        fileCount++;
        const lower = entry.name.toLowerCase();
        if (lower === 'readme.md') hasReadme = true;
        if (['package.json', 'cargo.toml', 'requirements.txt', 'go.mod', 'pom.xml', 'build.gradle'].includes(lower)) {
          hasManifest = true;
        }
        if (['dockerfile', 'docker-compose.yml', 'vercel.json'].includes(lower)) {
          hasDocker = true;
        }
        if (lower.includes('schema.prisma') || lower.includes('schema.sql')) {
          hasDatabase = true;
        }
      }
    }
  }

  try {
    scan(workspaceDir);
  } catch (err) {
    reasons.push(`Scanning error: ${(err as Error).message}`);
  }

  if (fileCount <= 2 && !hasManifest) {
    return {
      type: 'empty',
      portfolioWorthiness: 'low',
      reasons: ['Minimal to no source files detected'],
    };
  }

  if (hasManifest && (hasDocker || hasDatabase || fileCount > 20) && hasReadme) {
    return {
      type: 'portfolio-worthy',
      portfolioWorthiness: 'high',
      reasons: ['High file count', 'Manifest detected', 'Infrastructure/Database features present'],
    };
  }

  if (hasManifest || fileCount > 8) {
    return {
      type: 'secondary',
      portfolioWorthiness: 'medium',
      reasons: ['Functional codebase detected with standard dependencies'],
    };
  }

  return {
    type: 'practice',
    portfolioWorthiness: 'low',
    reasons: ['Small learning exercise or experiment'],
  };
}
