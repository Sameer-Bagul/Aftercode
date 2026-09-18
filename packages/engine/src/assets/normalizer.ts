import * as fs from 'fs';
import * as path from 'path';
import { VideoWorkspacePaths } from '../workspace/video-workspace.js';

export type AssetFitStrategy = 'contain_blurred' | 'cover_cinematic' | 'svg_responsive' | 'smart_card';

export interface NormalizedAsset {
  id: string;
  source: string;
  originalWidth?: number;
  originalHeight?: number;
  targetWidth: number;
  targetHeight: number;
  format: string;
  fitStrategy: AssetFitStrategy;
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

/**
 * Calculates the optimal frame fitting strategy for an asset based on resolution & aspect ratio
 */
export function calculateSmartFitStrategy(
  width: number = 1920,
  height: number = 1080,
  format: string = 'png'
): AssetFitStrategy {
  if (format === 'svg') {
    return 'svg_responsive';
  }

  // Small icon / logomark
  if (width <= 256 && height <= 256) {
    return 'smart_card';
  }

  const aspectRatio = width / Math.max(height, 1);
  const targetRatio = 16 / 9; // 1.777

  // Close to 16:9 widescreen landscape photography -> Cover
  if (aspectRatio >= 1.5 && aspectRatio <= 2.1 && width >= 1280) {
    return 'cover_cinematic';
  }

  // Vertical portrait image, square image, or non-widescreen screenshot -> Contain with blurred backdrop
  return 'contain_blurred';
}

export async function normalizeWorkspaceAssets(
  paths: VideoWorkspacePaths,
  slug: string
): Promise<AssetNormalizationResult> {
  const rawAssets = [
    {
      id: 'icon_tech',
      source: 'Iconify API',
      width: 256,
      height: 256,
      format: 'svg',
      filename: 'tech.svg',
    },
    {
      id: 'diagram_architecture',
      source: 'Napkin AI / Mermaid',
      width: 1200,
      height: 650,
      format: 'svg',
      filename: 'architecture.svg',
    },
    {
      id: 'screenshot_ui',
      source: 'Playwright Capture',
      width: 1440,
      height: 900,
      format: 'png',
      filename: 'dashboard.png',
    },
  ];

  const assets: NormalizedAsset[] = rawAssets.map((item) => {
    const fitStrategy = calculateSmartFitStrategy(item.width, item.height, item.format);
    return {
      id: item.id,
      source: item.source,
      originalWidth: item.width,
      originalHeight: item.height,
      targetWidth: 1920,
      targetHeight: 1080,
      format: item.format,
      fitStrategy,
      localPath: path.join(paths.assetsDir, item.filename),
      license: { name: 'Open License', attributionRequired: false },
    };
  });

  const attributionReportPath = path.join(paths.reportsDir, 'attribution.json');
  fs.writeFileSync(attributionReportPath, JSON.stringify(assets, null, 2), 'utf-8');

  return {
    slug,
    normalizedAssets: assets,
    attributionReportPath,
  };
}
