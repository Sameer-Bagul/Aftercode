import * as fs from 'fs';
export function formatSlug(repoName) {
    return repoName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
export async function fetchRepositoriesFromGitHub(owner, token) {
    const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Intelligence-Engine',
    };
    const hasValidToken = Boolean(token && !token.includes('your_') && !token.includes('YOUR_'));
    if (hasValidToken) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    const allRepos = [];
    let page = 1;
    const perPage = 100;
    while (page <= 10) {
        const url = hasValidToken
            ? `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&visibility=all&affiliation=owner,collaborator,organization_member`
            : `https://api.github.com/users/${owner}/repos?per_page=${perPage}&page=${page}&sort=updated`;
        const response = await fetch(url, { headers });
        if (!response.ok) {
            if (response.status === 401 && hasValidToken) {
                // Fallback to public endpoint if token is unauthorized
                const publicUrl = `https://api.github.com/users/${owner}/repos?per_page=${perPage}&page=${page}&sort=updated`;
                const pubRes = await fetch(publicUrl, { headers: { 'User-Agent': 'Portfolio-Intelligence-Engine' } });
                if (pubRes.ok) {
                    const pubRepos = (await pubRes.json());
                    if (pubRepos.length === 0)
                        break;
                    allRepos.push(...pubRepos);
                    if (pubRepos.length < perPage)
                        break;
                    page++;
                    continue;
                }
            }
            if (response.status === 404) {
                throw new Error(`GitHub user or organization '${owner}' not found.`);
            }
            throw new Error(`Failed to fetch repositories from GitHub API: ${response.status} ${response.statusText}`);
        }
        const repos = (await response.json());
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
export function buildInventoryState(owner, repos, existingInventoryPath) {
    let existingItemsMap = new Map();
    if (existingInventoryPath && fs.existsSync(existingInventoryPath)) {
        try {
            const raw = fs.readFileSync(existingInventoryPath, 'utf-8');
            const data = JSON.parse(raw);
            for (const item of data.repositories) {
                existingItemsMap.set(item.name, item);
            }
        }
        catch {
            // Ignore corrupt inventory file and re-build
        }
    }
    const items = repos.map((repo) => {
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
