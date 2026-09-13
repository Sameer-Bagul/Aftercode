import { GitHubRepository, InventoryState, InventoryItem } from './github-types.js';
import * as fs from 'fs';
import * as path from 'path';

export function formatSlug(repoName: string): string {
  return repoName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function fetchRepositoriesFromGitHub(owner: string, token?: string): Promise<GitHubRepository[]> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Portfolio-Intelligence-Engine',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const allRepos: GitHubRepository[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const url = `https://api.github.com/users/${owner}/repos?per_page=${perPage}&page=${page}&sort=updated`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`GitHub user or organization '${owner}' not found.`);
      }
      throw new Error(`Failed to fetch repositories from GitHub API: ${response.status} ${response.statusText}`);
    }

    const repos = (await response.json()) as GitHubRepository[];
    if (repos.length === 0) {
      break;
    }

    allRepos.push(...repos);
    if (repos.length < perPage) {
      break;
    }
    page++;
  }

  return allRepos;
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
      fork: repo.fork,
      archived: repo.archived,
    };
  });

  return {
    owner,
    totalRepositories: items.length,
    lastUpdated: new Date().toISOString(),
    repositories: items,
  };
}
