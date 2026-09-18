import { GitHubRepository, InventoryState, InventoryItem } from './github-types.js';
import * as fs from 'fs';

export function formatSlug(repoName: string): string {
  return repoName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Fetches all public, private, source, and fork repositories for a given user or PAT.
 * Combines authenticated user repos and user-owned repos across all pages, deduplicating by ID.
 */
export async function fetchRepositoriesFromGitHub(owner: string, token?: string): Promise<GitHubRepository[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Intelligence-Engine',
  };

  const hasValidToken = Boolean(token && !token.includes('your_') && !token.includes('YOUR_'));

  if (hasValidToken) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const reposMap = new Map<number | string, GitHubRepository>();
  const perPage = 100;

  // 1. Fetch authenticated user repos across all pages (covers private, public, sources, forks)
  if (hasValidToken) {
    let page = 1;
    while (page <= 20) {
      try {
        const url = `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&type=all&sort=updated`;
        const res = await fetch(url, { headers });
        if (!res.ok) break;

        const items = (await res.json()) as GitHubRepository[];
        if (!Array.isArray(items) || items.length === 0) break;

        for (const repo of items) {
          const key = repo.id || repo.full_name || repo.name;
          reposMap.set(key, repo);
        }

        if (items.length < perPage) break;
        page++;
      } catch (err) {
        console.warn(`Error fetching user repos page ${page}:`, err);
        break;
      }
    }
  }

  // 2. Fetch user-specific public/org repos across all pages
  let page = 1;
  while (page <= 20) {
    try {
      const url = `https://api.github.com/users/${owner}/repos?per_page=${perPage}&page=${page}&type=all&sort=updated`;
      const res = await fetch(url, { headers });
      if (!res.ok) break;

      const items = (await res.json()) as GitHubRepository[];
      if (!Array.isArray(items) || items.length === 0) break;

      for (const repo of items) {
        const key = repo.id || repo.full_name || repo.name;
        if (!reposMap.has(key)) {
          reposMap.set(key, repo);
        }
      }

      if (items.length < perPage) break;
      page++;
    } catch (err) {
      console.warn(`Error fetching public user repos page ${page}:`, err);
      break;
    }
  }

  return Array.from(reposMap.values());
}

export function buildInventoryState(owner: string, repos: GitHubRepository[], existingInventoryPath?: string): InventoryState {
  let existingItemsMap = new Map<string, InventoryItem>();

  if (existingInventoryPath && fs.existsSync(existingInventoryPath)) {
    try {
      const raw = fs.readFileSync(existingInventoryPath, 'utf-8');
      const data: InventoryState = JSON.parse(raw);
      for (const item of data.repositories) {
        existingItemsMap.set(item.name, item);
      }
    } catch {
      // Ignore corrupt inventory file and re-build
    }
  }

  const items: InventoryItem[] = repos.map((repo) => {
    const existing = existingItemsMap.get(repo.name);
    const slug = formatSlug(repo.name);

    return {
      name: repo.name,
      slug,
      url: repo.html_url,
      status: existing ? existing.status : 'pending',
      classification: existing ? existing.classification : null,
      lastProcessedTime: existing ? existing.lastProcessedTime : null,
      error: existing ? existing.error : null,
      fork: Boolean(repo.fork),
      archived: Boolean(repo.archived),
    };
  });

  return {
    owner,
    totalRepositories: items.length,
    lastUpdated: new Date().toISOString(),
    repositories: items,
  };
}
