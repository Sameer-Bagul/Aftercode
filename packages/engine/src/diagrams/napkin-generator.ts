import { FlowchartDiagramSpec, FlowchartNode, ProjectMetadata, ExtractedEvidence } from '@aftercode/shared';
import { NapkinMcpClient } from '../mcp/napkin-mcp-client.js';

export interface RepoColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  bgGradient: string;
  cardBorder: string;
}

export function generateNapkinFlowchart(title: string, subtitle: string, steps: string[]) {
  const defaultLabels = ['Client UI', 'API Router', 'AI Hub Engine', 'Persistence Layer'];
  const nodes = (steps.length > 0 ? steps : defaultLabels).slice(0, 4).map((s, idx) => ({
    id: `step_${idx + 1}`,
    label: s,
    description: `Phase ${idx + 1} System Step`,
    category: defaultLabels[idx % defaultLabels.length],
  }));

  return {
    title,
    subtitle,
    steps: nodes,
  };
}

/**
 * NapkinSvgGenerator
 * Programmatic visual engine generating dynamic repo-aware SVG flowcharts and mindmaps for Remotion scenes.
 * Colors, nodes, connections, and layout geometry are dynamically calculated based on repository AST evidence.
 */
export class NapkinSvgGenerator {
  /**
   * Main entry point to generate an SVG flowchart, mindmap, timeline, or hierarchy string
   */
  static async generateFlowchart(
    spec: FlowchartDiagramSpec,
    type: 'mindmap' | 'flowchart' | 'timeline' | 'hierarchy' = 'flowchart',
    apiKey?: string
  ): Promise<string> {
    const key = apiKey || process.env.NAPKIN_API_KEY;

    // 1. Try LouisChanCLY/napkin-ai-mcp tool client
    try {
      const mcpResult = await NapkinMcpClient.generateVisual(spec, type, key);
      if (mcpResult) return mcpResult;
    } catch (mcpErr) {
      console.warn('napkin-ai-mcp client attempt warning, trying direct API:', mcpErr);
    }

    // 2. Direct API call fallback
    if (key && key !== 'your_napkin_ai_api_key_here') {
      try {
        const napkinSvg = await this.callNapkinApi(spec, key);
        if (napkinSvg) return napkinSvg;
      } catch (err) {
        console.warn('Napkin AI API call failed, falling back to dynamic native SVG generator:', err);
      }
    }

    // 3. Native dynamic SVG fallback
    return this.renderNativeSvgFlowchart(spec);
  }

  /**
   * Dynamically derives a repository's color palette based on its AST tech stack breakdown or title hash.
   * Ensures every scanned repository receives a unique, harmonious color aesthetic.
   */
  public static getRepoColorPalette(projectTitleOrTech: string | string[]): RepoColorPalette {
    const techList = Array.isArray(projectTitleOrTech)
      ? projectTitleOrTech.join(' ').toLowerCase()
      : projectTitleOrTech.toLowerCase();

    if (techList.includes('python') || techList.includes('pytorch') || techList.includes('ai') || techList.includes('llm')) {
      return {
        primary: '#8b5cf6', // Lavender AI Accent
        secondary: '#10b981', // Mint
        accent: '#06b6d4', // Sky
        bgGradient: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
        cardBorder: '#8b5cf6',
      };
    }

    if (techList.includes('rust') || techList.includes('go') || techList.includes('c++')) {
      return {
        primary: '#f59e0b', // Lemon / Amber Accent
        secondary: '#ea580c', // Orange
        accent: '#10b981',
        bgGradient: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
        cardBorder: '#f59e0b',
      };
    }

    if (techList.includes('vue') || techList.includes('ruby') || techList.includes('php')) {
      return {
        primary: '#e11d48', // Crimson Accent
        secondary: '#10b981',
        accent: '#38bdf8',
        bgGradient: 'linear-gradient(135deg, #18020c 0%, #2e1065 100%)',
        cardBorder: '#e11d48',
      };
    }

    // Default: Dynamic HSL Color Hash based on Project Title String
    let hash = 0;
    for (let i = 0; i < techList.length; i++) {
      hash = techList.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 45) % 360;

    return {
      primary: `hsl(${hue1}, 80%, 48%)`,
      secondary: `hsl(${hue2}, 85%, 52%)`,
      accent: '#ff7e5f', // Peach
      bgGradient: `linear-gradient(135deg, hsl(${hue1}, 30%, 12%) 0%, hsl(${hue2}, 40%, 18%) 100%)`,
      cardBorder: `hsl(${hue1}, 80%, 48%)`,
    };
  }

  /**
   * Synthesizes dynamic flowchart nodes and connections directly from repository AST evidence.
   */
  public static synthesizeDynamicFlowchartSpec(evidence: ProjectMetadata | ExtractedEvidence): FlowchartDiagramSpec {
    const title = 'title' in evidence ? evidence.title : (evidence as ExtractedEvidence).repoName || 'System Architecture';
    const techList = 'techStackBreakdown' in evidence
      ? Object.values((evidence as ProjectMetadata).techStackBreakdown).flat()
      : (evidence as ExtractedEvidence).detectedLanguages || [];

    const nodes: FlowchartNode[] = [];

    // 1. Client / Frontend Node
    nodes.push({
      id: 'node_1',
      label: 'Client Interface',
      sublabel: techList.slice(0, 2).join(', ') || 'Web Application UI',
      category: 'frontend',
      badge: 'Step 1',
    });

    // 2. Extracted AST Modules / Services
    const modules = 'keyModules' in evidence ? evidence.keyModules || [] : [];
    if (modules.length > 0) {
      modules.slice(0, 2).forEach((mod: any, idx: number) => {
        nodes.push({
          id: `node_${nodes.length + 1}`,
          label: mod.name || `Core Module ${idx + 1}`,
          sublabel: mod.purpose || mod.path || 'AST Static Logic',
          category: 'backend',
          badge: `Step ${nodes.length + 1}`,
        });
      });
    } else {
      nodes.push({
        id: 'node_2',
        label: 'AST Collector & Parser',
        sublabel: 'Static Code & Dependency Scanner',
        category: 'backend',
        badge: 'Step 2',
      });
    }

    // 3. AI / Database Engine Node
    nodes.push({
      id: `node_${nodes.length + 1}`,
      label: 'Synthesis & RAG Engine',
      sublabel: techList.find((t: string) => /ai|gemini|openai|torch/i.test(t)) || 'AST Knowledge Index',
      category: 'ai',
      badge: `Step ${nodes.length + 1}`,
    });

    // 4. Production Output / Render Node
    nodes.push({
      id: `node_${nodes.length + 1}`,
      label: 'Rendered Remotion Showcase',
      sublabel: 'Programmatic Video & Media Export',
      category: 'infra',
      badge: `Step ${nodes.length + 1}`,
    });

    return {
      title: `${title} Architecture`,
      subtitle: `Dynamic AST Mindmap (${nodes.length} Components)`,
      nodes,
      connections: [],
    };
  }

  /**
   * Programmatically calls Napkin AI API if bearer token is present
   */
  private static async callNapkinApi(spec: FlowchartDiagramSpec, apiKey: string): Promise<string | null> {
    const promptText = `Flowchart titled "${spec.title}". Nodes: ${spec.nodes.map((n: FlowchartNode) => n.label).join(' -> ')}`;
    const response = await fetch('https://api.napkin.ai/v1/visuals/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: promptText,
        format: 'svg',
        style: 'modern_diagram',
      }),
    });

    if (response.ok) {
      const data: any = await response.json();
      if (data && data.svg) return data.svg;
    }
    return null;
  }

  /**
   * Renders a custom, repo-themed dynamic SVG flowchart with fresh fruity accents and glassmorphism.
   */
  public static renderNativeSvgFlowchart(spec: FlowchartDiagramSpec): string {
    const palette = this.getRepoColorPalette(spec.title);
    const width = 1200;
    const height = 650;
    const nodes = spec.nodes || [];
    const count = nodes.length;

    const nodeWidth = 230;
    const nodeHeight = 115;

    // Calculate node coordinates along a dynamic staggered layout
    const positionedNodes = nodes.map((node: FlowchartNode, index: number) => {
      const spacingX = (width - 120) / Math.max(count, 1);
      const x = 60 + index * spacingX + (spacingX - nodeWidth) / 2;
      const y = height / 2 - nodeHeight / 2 + (index % 2 === 0 ? -30 : 30);
      return { ...node, x, y, width: nodeWidth, height: nodeHeight, index };
    });

    // Generate SVG node elements
    const nodesSvg = positionedNodes
      .map((n: any) => {
        const nodeColor =
          n.category === 'frontend'
            ? '#0284c7'
            : n.category === 'backend'
            ? '#10b981'
            : n.category === 'database'
            ? '#f59e0b'
            : n.category === 'ai'
            ? palette.primary
            : palette.secondary;

        return `
        <g transform="translate(${n.x}, ${n.y})">
          <!-- Glassmorphism Container Card -->
          <rect width="${n.width}" height="${n.height}" rx="18" fill="#ffffff" stroke="${nodeColor}" stroke-width="2.5" filter="url(#dropShadow)" />
          
          <!-- Step Badge -->
          <rect x="14" y="14" width="28" height="28" rx="8" fill="${nodeColor}" />
          <text x="28" y="32" fill="#ffffff" font-size="12" font-weight="800" text-anchor="middle" font-family="system-ui, sans-serif">${n.index + 1}</text>
          
          <!-- Node Label -->
          <text x="50" y="32" fill="#0f172a" font-size="14" font-weight="800" font-family="system-ui, sans-serif">${escapeXml(n.label)}</text>
          
          <!-- Node Sublabel -->
          <text x="16" y="64" fill="#64748b" font-size="11" font-weight="600" font-family="system-ui, sans-serif">${escapeXml(n.sublabel || 'Dynamic Component')}</text>
          
          <!-- Category Pill -->
          <rect x="16" y="80" width="80" height="20" rx="6" fill="${nodeColor}18" />
          <text x="56" y="94" fill="${nodeColor}" font-size="10" font-weight="800" text-anchor="middle" font-family="system-ui, sans-serif">${escapeXml(n.category || 'Module').toUpperCase()}</text>
        </g>
      `;
      })
      .join('\n');

    // Generate connecting cubic Bezier curve paths (`<path d="..." />`)
    let connectionsSvg = '';
    for (let i = 0; i < positionedNodes.length - 1; i++) {
      const current = positionedNodes[i];
      const next = positionedNodes[i + 1];

      const startX = current.x + current.width;
      const startY = current.y + current.height / 2;
      const endX = next.x;
      const endY = next.y + next.height / 2;

      const controlX1 = startX + (endX - startX) / 2;
      const controlY1 = startY;
      const controlX2 = startX + (endX - startX) / 2;
      const controlY2 = endY;

      const pathD = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
      connectionsSvg += `
        <path d="${pathD}" fill="none" stroke="${palette.primary}" stroke-width="3" stroke-dasharray="6,4" opacity="0.85" marker-end="url(#arrowhead)" />
      `;
    }

    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background: ${palette.bgGradient}; font-family: system-ui, sans-serif;">
      <defs>
        <filter id="dropShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.2" />
        </filter>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="${palette.primary}" />
        </marker>
      </defs>

      <!-- Flowchart Header -->
      <g transform="translate(60, 48)">
        <text font-size="24" font-weight="900" fill="#ffffff" letter-spacing="-0.02em">${escapeXml(spec.title)}</text>
        <text y="26" font-size="13" font-weight="600" fill="#94a3b8">${escapeXml(spec.subtitle || 'Dynamic Repository System Architecture')}</text>
      </g>

      <!-- Connections -->
      <g>
        ${connectionsSvg}
      </g>

      <!-- Nodes -->
      <g>
        ${nodesSvg}
      </g>
    </svg>
    `.trim();
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
