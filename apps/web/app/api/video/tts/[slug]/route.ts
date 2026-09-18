import { NextResponse } from 'next/server';
import * as path from 'path';
import { initVideoWorkspace, synthesizeLocalTtsVoiceover } from '@aftercode/engine';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const projectRoot = process.cwd();
    const workspaceDir = path.join(projectRoot, 'workspace', 'current');
    const paths = initVideoWorkspace(workspaceDir, slug);

    const scenes = [
      { sceneNumber: 1, narration: `Welcome to the technical showcase of ${slug}.` },
      { sceneNumber: 2, narration: `Decoupled architecture powered by clean API gateways.` },
      { sceneNumber: 3, narration: `Exposing validated API endpoints and schemas.` },
      { sceneNumber: 4, narration: `Modular codebase structure separating controllers and logic.` },
      { sceneNumber: 5, narration: `Automated build pipelines and continuous verification.` },
      { sceneNumber: 6, narration: `Explore the full open-source repository on GitHub.` },
    ];

    const ttsResult = await synthesizeLocalTtsVoiceover(paths, slug, scenes);
    return NextResponse.json({ success: true, slug, ttsResult });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
