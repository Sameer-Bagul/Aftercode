import { NextResponse } from 'next/server';
import { NapkinSvgGenerator } from '@aftercode/engine';
import { FlowchartDiagramSpec } from '@aftercode/shared';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let spec: FlowchartDiagramSpec;

    if (body.project) {
      // Dynamically synthesize nodes and connections directly from repository AST evidence
      spec = NapkinSvgGenerator.synthesizeDynamicFlowchartSpec(body.project);
    } else if (body.spec) {
      spec = body.spec;
    } else {
      // Synthesize dynamic spec from title / tech stack
      const title = body.title || 'Repository Architecture';
      const techStack = body.techStack || ['TypeScript', 'Next.js', 'Tree-sitter', 'Supertonic 3', 'Remotion'];
      
      spec = {
        title: `${title} Flowchart`,
        subtitle: `Dynamic AST Topology (${techStack.slice(0, 3).join(', ')})`,
        nodes: techStack.map((tech: string, idx: number) => ({
          id: `node_${idx + 1}`,
          label: tech,
          sublabel: idx === 0 ? 'Primary Framework' : idx === 1 ? 'Core Engine' : 'Module Component',
          category: idx === 0 ? 'frontend' : idx % 2 === 0 ? 'ai' : 'backend',
          badge: `Step ${idx + 1}`,
        })),
        connections: [],
      };
    }

    const diagramType = (body.type || 'flowchart') as 'mindmap' | 'flowchart' | 'timeline' | 'hierarchy';
    const svgContent = await NapkinSvgGenerator.generateFlowchart(spec, diagramType);

    return NextResponse.json({
      success: true,
      spec,
      diagramType,
      svgContent,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate flowchart' },
      { status: 500 }
    );
  }
}
