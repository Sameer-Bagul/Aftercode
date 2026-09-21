import { NextResponse } from 'next/server';
import * as path from 'path';
import { ImageProviders, ExtractedEvidence, collectRepositoryEvidence, generateNapkinFlowchart } from '@aftercode/engine';
import { getMonorepoRoot } from '../../../root-helper';

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = params.slug;
    const body = await request.json().catch(() => ({}));
    const projectRoot = getMonorepoRoot();
    const workspaceDir = path.join(projectRoot, 'workspace', 'current');

    console.log(` 🎨 [Asset Pipeline] Mining multi-source assets for repository '${slug}'...`);

    const evidence: ExtractedEvidence = collectRepositoryEvidence(workspaceDir, slug);
    const techStackList = [
      ...evidence.detectedLanguages,
      ...evidence.techStack.frontend,
      ...evidence.techStack.backend,
      ...evidence.techStack.database,
      ...evidence.techStack.aiMl,
      ...evidence.techStack.infrastructure,
    ];

    // 1. Mine Tech Stack Brand Logos via Iconify API
    const logoPromises = techStackList.slice(0, 8).map((tech) => ImageProviders.searchIconify(tech, 2));
    const logoResultsNested = await Promise.all(logoPromises);
    const techLogos = logoResultsNested.flat();

    // 2. Mine Reference Diagrams & Images via Wikimedia Commons
    const wikiQueries = [slug, evidence.detectedLanguages[0] || 'software architecture', 'microservice topology'];
    const wikiPromises = wikiQueries.map((q) => ImageProviders.searchWikimedia(q, 3));
    const wikiResultsNested = await Promise.all(wikiPromises);
    const wikiImages = wikiResultsNested.flat();

    // 3. Generate Napkin AI Vector Flowcharts
    const napkinFlow = generateNapkinFlowchart(
      evidence.repoName,
      evidence.readmeSummary || `${evidence.repoName} Technical Architecture`,
      evidence.detectedLanguages.concat(evidence.techStack.frontend)
    );

    // 4. Generate Mermaid Architecture Diagram
    const mermaidDiagram = `graph TD
    subgraph Presentation ["Client Interface"]
      UI["${evidence.techStack.frontend.join(' / ') || 'React UI'}"]
    end
    subgraph Network ["API Routing Layer"]
      Router["${evidence.techStack.backend.join(' / ') || 'Express Router'}"]
    end
    subgraph Intelligence ["AI Inference Engine"]
      Engine["${evidence.techStack.aiMl.join(' / ') || 'Local ONNX Engine'}"]
    end
    subgraph Persistence ["Model & Database"]
      DB["${evidence.techStack.database.join(' / ') || 'PostgreSQL'}"]
    end
    UI --> Router
    Router --> Engine
    Engine --> DB`;

    const assetLibrary = {
      slug,
      minedAt: new Date().toISOString(),
      techLogos,
      wikiImages,
      napkinFlow,
      mermaidDiagram,
      totalAssetCount: techLogos.length + wikiImages.length + 2,
    };

    return NextResponse.json({
      success: true,
      slug,
      assetLibrary,
    });
  } catch (err: any) {
    console.error(` ❌ [Asset API Error] Failed to mine assets for ${params.slug}:`, err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to mine multi-source assets.' },
      { status: 500 }
    );
  }
}
