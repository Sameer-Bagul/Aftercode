import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import {
  synthesizeAiRemotionVideoScript,
  collectRepositoryEvidence,
  AiProviderRegistry,
  ExtractedEvidence,
} from '@aftercode/engine';
import { getMonorepoRoot } from '../../../root-helper';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const projectRoot = getMonorepoRoot();
    const metadataPath = path.join(projectRoot, 'output', 'metadata', `${slug}.json`);
    const workspaceDir = path.join(projectRoot, 'workspace', 'current');

    let evidence: ExtractedEvidence;

    if (fs.existsSync(metadataPath)) {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
      const techStack = metadata.techStack || {};
      evidence = {
        repoName: metadata.title || metadata.slug || slug,
        detectedLanguages: metadata.languages || techStack.languages || ['TypeScript', 'JavaScript'],
        detectedManifests: ['package.json'],
        techStack: {
          frontend: techStack.frontend || [],
          backend: techStack.backend || [],
          database: techStack.database || [],
          aiMl: techStack.aiMl || [],
          infrastructure: techStack.infrastructure || [],
          devops: techStack.devops || [],
          testing: techStack.testing || [],
          tools: techStack.tools || [],
          other: [],
        },
        features: metadata.features || [metadata.tagline || 'Technical Showcase'],
        configs: [],
        readmeSummary: metadata.summary || null,
        architectureOverview: metadata.architectureDiagram?.explanation || metadata.systemArchitectureText || null,
        userFlow: metadata.interactiveFlowchart?.steps?.map((s: any) => s.label) || [],
        codeFlow: [],
        apiEndpoints: metadata.apiEndpoints || [],
        keyModules:
          metadata.keyModules ||
          metadata.architectureDiagram?.nodes?.map((n: any) => ({
            name: n.label || n.id,
            path: n.id,
            description: n.description || n.label,
          })) ||
          [],
      };
    } else {
      evidence = collectRepositoryEvidence(workspaceDir, slug);
    }

    const body = await request.json().catch(() => ({}));
    const targetDurationMinutes = Number(body.targetDurationMinutes) || 5;

    const scriptConfig = await synthesizeAiRemotionVideoScript(evidence, targetDurationMinutes);
    const activeProviders = AiProviderRegistry.getActiveProviders();
    const activeProviderName = activeProviders.length > 0 ? activeProviders[0].name : 'Local Synthesizer';

    return NextResponse.json({
      success: true,
      slug,
      scriptConfig,
      aiProvider: activeProviderName,
    });
  } catch (err: any) {
    console.error(` ❌ [Video Script API] Synthesis failed for ${params.slug}:`, err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to synthesize AI Remotion video script.' },
      { status: 500 }
    );
  }
}
