import { ExtractedEvidence } from '../repository/evidence-collector.js';
import { ClassificationResult } from '../repository/classifier.js';
import { normalizeSlug, stripEmojis, sanitizeObjectEmojis } from './normalizer.js';
import {
  runMultiPassSynthesis,
  generateMermaidArchitectureDiagram,
  generateExhaustiveTechnicalDescription,
} from './ai-synthesizer.js';

export async function generateMetadataPayload(
  owner: string,
  repoName: string,
  repoUrl: string,
  isFork: boolean,
  evidence: ExtractedEvidence,
  classification: ClassificationResult
): Promise<any> {
  const slug = normalizeSlug(repoName);
  const now = new Date().toISOString();

  let category = 'Practice';
  if (evidence.techStack.aiMl.length > 0) category = 'AI/ML';
  else if (evidence.techStack.frontend.length > 0 && evidence.techStack.backend.length > 0) category = 'Web App';
  else if (evidence.techStack.frontend.length > 0) category = 'Web App';
  else if (evidence.techStack.backend.length > 0) category = 'API Service';
  else if (classification.type === 'portfolio-worthy') category = 'System';

  const isFeatured = classification.portfolioWorthiness === 'high';
  const synthesis = await runMultiPassSynthesis(evidence);
  const mermaidDiagram = generateMermaidArchitectureDiagram(evidence);
  const exhaustiveDescription = generateExhaustiveTechnicalDescription(evidence);

  const cleanShortDesc = stripEmojis(
    evidence.readmeSummary
      ? evidence.readmeSummary.replace(/^#+\s*/g, '').substring(0, 160)
      : `Repository ${repoName} owned by ${owner}.`
  );

  const rawPayload = {
    _id: `${slug}-id`,
    title: repoName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    slug,
    shortDescription: cleanShortDesc,
    description: exhaustiveDescription,
    category,
    isFeatured,
    status: classification.type === 'archived' ? 'Archived' : 'Completed',
    role: 'Sole Developer',
    clientOrCompany: null,
    duration: null,
    targetAudience: null,
    techStackBreakdown: evidence.techStack,
    myContributions: synthesis.contributions,
    image: null,
    gallery: [],
    architectureDiagram: mermaidDiagram,
    liveUrl: null,
    githubUrl: repoUrl,
    apiDocsUrl: null,
    figmaUrl: null,
    videoUrl: null,
    contributors: [owner],
    features: synthesis.features.length > 0 ? synthesis.features : evidence.features,
    challenges: synthesis.challenges,
    learnings: synthesis.learnings,
    architectureOverview: evidence.architectureOverview,
    userFlow: evidence.userFlow,
    codeFlow: evidence.codeFlow,
    apiEndpoints: evidence.apiEndpoints,
    keyModules: evidence.keyModules,
    metrics: null,
    clientTestimonial: null,
    relatedBlogs: [],
    futureRoadmap: synthesis.futureRoadmap,
    repository: {
      owner,
      name: repoName,
      url: repoUrl,
      visibility: 'public',
      fork: isFork,
    },
    classification: {
      type: classification.type,
      portfolioWorthiness: classification.portfolioWorthiness,
    },
    metadata: {
      generatedAt: now,
      lastAnalyzedAt: now,
      sourceCommit: null,
      manuallyVerified: false,
    },
  };

  return sanitizeObjectEmojis(rawPayload);
}
