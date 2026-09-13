import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fetchRepositoriesFromGitHub, buildInventoryState } from '../github/discover-repositories.js';
import { processSingleRepository } from '../processing/runner.js';
import { loadInventoryState, saveInventoryState } from '../processing/status.js';
import { createMetadataValidator } from '../validation/schema-validator.js';
import { InventoryItem } from '../github/github-types.js';

export function createAftercodeMcpServer(): Server {
  const server = new Server(
    {
      name: 'aftercode',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'aftercode_discover_repositories',
          description: 'Discover all public and private GitHub repositories for a given username or organization.',
          inputSchema: {
            type: 'object',
            properties: {
              username: { type: 'string', description: 'GitHub username or organization' },
            },
            required: ['username'],
          },
        },
        {
          name: 'aftercode_analyze_repository',
          description: 'Perform deep AST evidence collection, tech stack detection, multi-tier subgraph Mermaid diagram synthesis, and portfolio metadata generation for a GitHub repository.',
          inputSchema: {
            type: 'object',
            properties: {
              owner: { type: 'string', description: 'Repository owner' },
              name: { type: 'string', description: 'Repository name' },
              url: { type: 'string', description: 'GitHub repository HTTP URL' },
            },
            required: ['owner', 'name'],
          },
        },
        {
          name: 'aftercode_validate_metadata',
          description: 'Validate a portfolio metadata JSON file against the official Aftercode AJV project schema.',
          inputSchema: {
            type: 'object',
            properties: {
              slug: { type: 'string', description: 'Repository slug ID' },
            },
            required: ['slug'],
          },
        },
        {
          name: 'aftercode_get_catalog_summary',
          description: 'Get an aggregated summary of all processed portfolio repositories and catalog statistics.',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'aftercode_discover_repositories') {
        const username = String((args as any).username || 'Sameer-Bagul');
        const token = process.env.GITHUB_TOKEN;
        const repos = await fetchRepositoriesFromGitHub(username, token);
        const projectRoot = process.cwd();
        const inventoryPath = path.join(projectRoot, 'processing', 'repository-inventory.json');
        const state = buildInventoryState(username, repos, inventoryPath);
        saveInventoryState(inventoryPath, state);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'success',
                  username,
                  discoveredCount: repos.length,
                  inventoryPath,
                  repositories: state.repositories.map((r) => ({ name: r.name, slug: r.slug, url: r.url, fork: r.fork })),
                },
                null,
                2
              ),
            },
          ],
        };
      }

      if (name === 'aftercode_analyze_repository') {
        const owner = String((args as any).owner || 'Sameer-Bagul');
        const repoName = String((args as any).name);
        const url = String((args as any).url || `https://github.com/${owner}/${repoName}`);

        const projectRoot = process.cwd();
        const inventoryPath = path.join(projectRoot, 'processing', 'repository-inventory.json');
        const workspaceDir = path.join(projectRoot, 'workspace', 'current');
        const outputMetadataDir = path.join(projectRoot, 'output', 'metadata');
        const schemaPath = path.join(projectRoot, 'schemas', 'project.schema.json');

        const item: InventoryItem = {
          name: repoName,
          slug: repoName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          url,
          status: 'pending',
          classification: null,
          lastProcessedTime: null,
          error: null,
          fork: false,
          archived: false,
        };

        const state = loadInventoryState(inventoryPath) || {
          owner,
          totalRepositories: 1,
          lastUpdated: new Date().toISOString(),
          repositories: [item],
        };

        const success = await processSingleRepository(item, state, {
          owner,
          inventoryPath,
          workspaceDir,
          outputMetadataDir,
          schemaPath,
        });

        const outputPath = path.join(outputMetadataDir, `${item.slug}.json`);
        const generated = fs.existsSync(outputPath) ? JSON.parse(fs.readFileSync(outputPath, 'utf-8')) : null;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success, metadata: generated }, null, 2),
            },
          ],
        };
      }

      if (name === 'aftercode_validate_metadata') {
        const slug = String((args as any).slug);
        const projectRoot = process.cwd();
        const filePath = path.join(projectRoot, 'output', 'metadata', `${slug}.json`);
        const schemaPath = path.join(projectRoot, 'schemas', 'project.schema.json');

        if (!fs.existsSync(filePath)) {
          return {
            content: [{ type: 'text', text: `Error: Metadata file not found at ${filePath}` }],
            isError: true,
          };
        }

        const validator = createMetadataValidator(schemaPath);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const validation = validator(data);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  slug,
                  isValid: validation.valid,
                  errors: validation.errors,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      if (name === 'aftercode_get_catalog_summary') {
        const projectRoot = process.cwd();
        const inventoryPath = path.join(projectRoot, 'processing', 'repository-inventory.json');
        const inventory = loadInventoryState(inventoryPath);
        const metadataFiles = fs.existsSync(path.join(projectRoot, 'output', 'metadata'))
          ? fs.readdirSync(path.join(projectRoot, 'output', 'metadata')).filter((f) => f.endsWith('.json'))
          : [];

        const totalRepos = inventory ? inventory.repositories.length : 0;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  engine: 'Aftercode',
                  discoveredRepositories: totalRepos,
                  processedMetadataFiles: metadataFiles.length,
                  coveragePercentage: totalRepos > 0 ? ((metadataFiles.length / totalRepos) * 100).toFixed(1) + '%' : '0%',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Aftercode MCP Error: ${(err as Error).message}` }],
        isError: true,
      };
    }
  });

  return server;
}

export async function runAftercodeMcpServer(): Promise<void> {
  const server = createAftercodeMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Aftercode MCP Server running on stdio transport');
}
