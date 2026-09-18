import * as fs from 'fs';
import * as path from 'path';

export function safeMergeMetadata(existing: any, generated: any): any {
  if (existing?.metadata?.manuallyVerified) {
    return {
      ...generated,
      ...existing,
      metadata: {
        ...generated.metadata,
        lastAnalyzedAt: new Date().toISOString(),
        manuallyVerified: true,
      },
    };
  }

  return {
    ...generated,
    clientOrCompany: existing?.clientOrCompany ?? generated.clientOrCompany,
    duration: existing?.duration ?? generated.duration,
    targetAudience: existing?.targetAudience ?? generated.targetAudience,
    clientTestimonial: existing?.clientTestimonial ?? generated.clientTestimonial,
    metrics: existing?.metrics ?? generated.metrics,
    image: existing?.image ?? generated.image,
    gallery: (existing?.gallery && existing.gallery.length > 0) ? existing.gallery : generated.gallery,
    architectureDiagram: generated.architectureDiagram || existing?.architectureDiagram,
    architectureOverview: generated.architectureOverview || existing?.architectureOverview,
    userFlow: (existing?.userFlow && existing.userFlow.length > 0) ? existing.userFlow : generated.userFlow,
    codeFlow: (existing?.codeFlow && existing.codeFlow.length > 0) ? existing.codeFlow : generated.codeFlow,
    apiEndpoints: (existing?.apiEndpoints && existing.apiEndpoints.length > 0) ? existing.apiEndpoints : generated.apiEndpoints,
    keyModules: (existing?.keyModules && existing.keyModules.length > 0) ? existing.keyModules : generated.keyModules,
    myContributions: Array.from(new Set([...(existing?.myContributions || []), ...(generated.myContributions || [])])),
    features: Array.from(new Set([...(existing?.features || []), ...(generated.features || [])])),
    learnings: Array.from(new Set([...(existing?.learnings || []), ...(generated.learnings || [])])),
  };
}

export function readExistingMetadata(outputDir: string, slug: string): any | null {
  const filePath = path.join(outputDir, `${slug}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  return null;
}
