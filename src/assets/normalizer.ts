import * as fs from 'fs';
import * as path from 'path';
import { VideoWorkspacePaths } from '../workspace/video-workspace.js';

export interface NormalizedAsset {
  id: string;
  source: string;
  targetWidth: number;
  targetHeight: number;
  format: string;
  localPath: string;
  license: {
    name: string;
    attributionRequired: boolean;
  };
}

export interface AssetNormalizationResult {
  slug: string;
  normalizedAssets: NormalizedAsset[];
  attributionReportPath: string;
}

export async function normalizeWorkspaceAssets(
  paths: VideoWorkspacePaths,
  slug: string
): Promise<AssetNormalizationResult> {
  const assets: NormalizedAsset[] = [
    {
      id: 'icon_react',
      source: 'Iconify API',
      targetWidth: 512,
      targetHeight: 512,
      format: 'svg',
      localPath: path.join(paths.assetsDir, 'react.svg'),
      license: { name: 'MIT License', attributionRequired: false },
    },
    {
      id: 'diagram_architecture',
      source: 'Napkin AI / Mermaid',
      targetWidth: 1920,
      targetHeight: 1080,
      format: 'svg',
      localPath: path.join(paths.assetsDir, 'architecture.svg'),
      license: { name: 'CC BY 4.0', attributionRequired: true },
    },
  ];

  const attributionReportPath = path.join(paths.reportsDir, 'attribution.json');
  fs.writeFileSync(attributionReportPath, JSON.stringify(assets, null, 2), 'utf-8');

  return {
    slug,
    normalizedAssets: assets,
    attributionReportPath,
  };
}
