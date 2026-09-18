import { execa } from 'execa';
import { FlowchartDiagramSpec } from '@aftercode/shared';

/**
 * NapkinMcpClient
 * Stdio JSON-RPC client wrapper communicating with the LouisChanCLY/napkin-ai-mcp server.
 * Enables programmatically generating mindmaps, flowcharts, timelines, and hierarchies.
 */
export class NapkinMcpClient {
  /**
   * Executes napkin-ai-mcp server tool call via stdio JSON-RPC
   */
  static async generateVisual(
    spec: FlowchartDiagramSpec,
    type: 'mindmap' | 'flowchart' | 'timeline' | 'hierarchy' = 'flowchart',
    apiKey?: string
  ): Promise<string | null> {
    const key = apiKey || process.env.NAPKIN_API_KEY;
    if (!key || key === 'your_napkin_ai_api_key_here') {
      return null;
    }

    try {
      const promptText = `Generate a ${type} titled "${spec.title}". Nodes: ${spec.nodes.map((n) => `${n.label} (${n.sublabel || ''})`).join(' -> ')}`;

      // Execute npx napkin-ai-mcp in dry-run / stdin JSON-RPC mode
      const { stdout } = await execa('npx', ['-y', 'napkin-ai-mcp'], {
        env: {
          ...process.env,
          NAPKIN_API_KEY: key,
        },
        input: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: `generate_${type}`,
            arguments: {
              prompt: promptText,
              format: 'svg',
            },
          },
        }),
        timeout: 12000,
      });

      if (stdout) {
        const parsed = JSON.parse(stdout);
        const result = parsed.result?.content?.[0]?.text;
        if (result && (result.includes('<svg') || result.startsWith('http'))) {
          return result;
        }
      }
      return null;
    } catch (error) {
      console.warn(`napkin-ai-mcp client warning for type "${type}":`, error);
      return null;
    }
  }
}
