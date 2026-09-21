import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper to robustly locate the monorepo root directory regardless of whether
 * Next.js process.cwd() is inside apps/web or the root directory.
 */
export function getMonorepoRoot(): string {
  let current = process.cwd();
  while (current !== path.parse(current).root) {
    if (
      fs.existsSync(path.join(current, 'AGENTS.md')) &&
      fs.existsSync(path.join(current, 'schemas', 'project.schema.json'))
    ) {
      return current;
    }
    current = path.dirname(current);
  }
  return process.cwd();
}
