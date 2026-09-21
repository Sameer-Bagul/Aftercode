import { NextResponse } from 'next/server';
import * as path from 'path';
import { initVideoWorkspace, synthesizeLocalTtsVoiceover } from '@aftercode/engine';
import { getMonorepoRoot } from '../../../root-helper';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Body is optional
    }

    const voiceStyle = body?.voiceStyle || 'M1';
    const language = body?.language || 'en';

    const projectRoot = getMonorepoRoot();
    const workspaceDir = path.join(projectRoot, 'workspace', 'current');
    const paths = initVideoWorkspace(workspaceDir, slug);

    const scenes = body?.scenes || [
      { sceneNumber: 1, narration: `Welcome to the technical showcase of ${slug}.` },
      { sceneNumber: 2, narration: `Decoupled architecture powered by clean API gateways.` },
      { sceneNumber: 3, narration: `Exposing validated API endpoints and schemas.` },
      { sceneNumber: 4, narration: `Modular codebase structure separating controllers and logic.` },
      { sceneNumber: 5, narration: `Automated build pipelines and continuous verification.` },
      { sceneNumber: 6, narration: `Explore the full open-source repository on GitHub.` },
    ];

    const ttsResult = await synthesizeLocalTtsVoiceover(paths, slug, scenes, { voiceStyle, language });

    const isSuccess = ttsResult.status === 'ready';
    return NextResponse.json({
      success: isSuccess,
      status: ttsResult.status,
      slug,
      ttsResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        status: 'failed',
        error: err.message || 'Supertonic 3 voiceover synthesis error.',
      },
      { status: 500 }
    );
  }
}
