import { NextResponse } from 'next/server';
import * as path from 'path';
import { initVideoWorkspace, buildAndRenderRemotionVideo } from '@aftercode/engine';
import { getMonorepoRoot } from '../../../root-helper';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const projectRoot = getMonorepoRoot();
    const workspaceDir = path.join(projectRoot, 'workspace', 'current');
    const paths = initVideoWorkspace(workspaceDir, slug);

    const scenes = [
      { sceneNumber: 1, name: 'Hero' },
      { sceneNumber: 2, name: 'Topology' },
      { sceneNumber: 3, name: 'Routes' },
      { sceneNumber: 4, name: 'Modules' },
      { sceneNumber: 5, name: 'Features' },
      { sceneNumber: 6, name: 'Outro' },
    ];

    const renderResult = await buildAndRenderRemotionVideo(paths, slug, scenes);
    return NextResponse.json({ success: true, slug, renderResult });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
