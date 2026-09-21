import { NextResponse } from 'next/server';
import * as path from 'path';
import { processSingleRepository, formatSlug } from '@aftercode/engine';
import { getMonorepoRoot } from '../root-helper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const repoName = body.name || body.repoName || 'my-repo';
    const owner = body.owner || process.env.GITHUB_OWNER || 'Sameer-Bagul';
    const repoUrl = body.url || body.html_url || `https://github.com/${owner}/${repoName}`;
    const fork = Boolean(body.fork);
    const archived = Boolean(body.archived);

    const slug = formatSlug(repoName);
    const projectRoot = getMonorepoRoot();
    const inventoryPath = path.join(projectRoot, 'processing', 'repository-inventory.json');
    const workspaceDir = path.join(projectRoot, 'workspace', 'current');
    const outputMetadataDir = path.join(projectRoot, 'output', 'metadata');
    const schemaPath = path.join(projectRoot, 'schemas', 'project.schema.json');

    const item = {
      name: repoName,
      slug,
      url: repoUrl,
      status: 'pending' as const,
      classification: null,
      lastProcessedTime: null,
      error: null,
      fork,
      archived,
    };

    const state = {
      owner,
      totalRepositories: 1,
      lastUpdated: new Date().toISOString(),
      repositories: [item],
    };

    const config = {
      owner,
      inventoryPath,
      workspaceDir,
      outputMetadataDir,
      schemaPath,
    };

    const success = await processSingleRepository(item, state, config);

    if (success) {
      return NextResponse.json({
        success: true,
        slug,
        repoName,
        message: `Successfully analyzed repository ${repoName} and generated metadata payload + video script in output/metadata/${slug}.json!`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: item.error || 'Failed to analyze repository AST' },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('❌ [API /api/analyze Error]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

