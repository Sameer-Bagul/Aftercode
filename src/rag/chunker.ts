import * as fs from 'fs';
import * as path from 'path';

export interface CodeChunk {
  chunkId: string;
  filePath: string;
  relativePath: string;
  chunkType: 'code' | 'manifest' | 'doc' | 'route' | 'config';
  content: string;
  tokenEstimate: number;
}

export function chunkFile(filePath: string, workspaceDir: string, maxChars = 1500, overlapChars = 200): CodeChunk[] {
  if (!fs.existsSync(filePath)) return [];

  const relativePath = path.relative(workspaceDir, filePath);
  const ext = path.extname(filePath).toLowerCase();
  const fileName = path.basename(filePath).toLowerCase();

  let chunkType: CodeChunk['chunkType'] = 'code';
  if (['package.json', 'cargo.toml', 'requirements.txt', 'go.mod', 'pom.xml', 'build.gradle'].includes(fileName)) {
    chunkType = 'manifest';
  } else if (['dockerfile', 'docker-compose.yml', 'vercel.json', 'tsconfig.json'].includes(fileName)) {
    chunkType = 'config';
  } else if (ext === '.md' || ext === '.txt') {
    chunkType = 'doc';
  }

  let text = '';
  try {
    text = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return [];
  }

  if (!text.trim()) return [];

  const chunks: CodeChunk[] = [];
  const lines = text.split('\n');

  let currentChunkLines: string[] = [];
  let currentLength = 0;
  let chunkIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    currentChunkLines.push(line);
    currentLength += line.length + 1;

    // Split at logical code boundaries or max size limit
    const isBoundary =
      line.trim().startsWith('export function') ||
      line.trim().startsWith('function') ||
      line.trim().startsWith('class ') ||
      line.trim().startsWith('export class') ||
      line.trim().startsWith('app.') ||
      line.trim().startsWith('router.') ||
      line.trim().startsWith('@app.') ||
      line.trim().startsWith('@router.') ||
      line.trim().startsWith('# ') ||
      line.trim().startsWith('## ');

    if (currentLength >= maxChars || (isBoundary && currentLength >= maxChars / 2)) {
      const content = currentChunkLines.join('\n');
      chunkIndex++;
      chunks.push({
        chunkId: `${relativePath}:${chunkIndex}`,
        filePath,
        relativePath,
        chunkType,
        content,
        tokenEstimate: Math.ceil(content.length / 4),
      });

      // Keep overlap for continuity
      const overlapLines: string[] = [];
      let overlapCount = 0;
      for (let j = currentChunkLines.length - 1; j >= 0; j--) {
        overlapCount += currentChunkLines[j].length + 1;
        overlapLines.unshift(currentChunkLines[j]);
        if (overlapCount >= overlapChars) break;
      }
      currentChunkLines = overlapLines;
      currentLength = overlapCount;
    }
  }

  if (currentChunkLines.length > 0 && currentChunkLines.join('\n').trim().length > 0) {
    const content = currentChunkLines.join('\n');
    chunkIndex++;
    chunks.push({
      chunkId: `${relativePath}:${chunkIndex}`,
      filePath,
      relativePath,
      chunkType,
      content,
      tokenEstimate: Math.ceil(content.length / 4),
    });
  }

  return chunks;
}

export function chunkWorkspaceDirectory(workspaceDir: string): CodeChunk[] {
  const allChunks: CodeChunk[] = [];
  const IGNORED_DIRS = new Set([
    '.git',
    'node_modules',
    'dist',
    'build',
    'out',
    '.next',
    '.nuxt',
    'target',
    'bin',
    'obj',
    'release',
    'debug',
    'coverage',
    '.cache',
    'vendor',
    '.venv',
    'venv',
    '__pycache__',
    '.idea',
    '.vscode',
  ]);

  const IGNORED_EXTS = new Set([
    '.exe',
    '.dll',
    '.so',
    '.dylib',
    '.bin',
    '.o',
    '.a',
    '.lib',
    '.class',
    '.jar',
    '.war',
    '.zip',
    '.tar',
    '.gz',
    '.7z',
    '.rar',
    '.iso',
    '.dmg',
    '.pkg',
    '.deb',
    '.rpm',
    '.pyc',
    '.pyo',
    '.db',
    '.sqlite',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.ico',
    '.pdf',
    '.woff',
    '.woff2',
    '.ttf',
    '.eot',
    '.mp3',
    '.mp4',
    '.mov',
    '.avi',
  ]);

  function scan(dir: string, depth = 0) {
    if (depth > 10) return;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scan(fullPath, depth + 1);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (IGNORED_EXTS.has(ext)) continue;

        const fileChunks = chunkFile(fullPath, workspaceDir);
        allChunks.push(...fileChunks);
      }
    }
  }

  scan(workspaceDir);
  return allChunks;
}
