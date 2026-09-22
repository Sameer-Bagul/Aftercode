import { ExtractedEvidence } from '../repository/evidence-collector.js';
import { ClassificationResult } from '../repository/classifier.js';
import { normalizeSlug, stripEmojis, sanitizeObjectEmojis } from './normalizer.js';
import {
  runMultiPassSynthesis,
  generateMermaidArchitectureDiagram,
  generateMermaidDataFlowDiagram,
  generateMermaidSequenceDiagram,
  generateMediumDescription,
  generateExhaustiveTechnicalDescription,
  generateArchitectureOverview,
  cleanShortDescription,
  generateTechnicalUserFlow,
  generateTechnicalCodeFlow,
} from './ai-synthesizer.js';
import { generateRemotionVideoScript } from '../video/remotion-script-generator.js';
import { RagSynthesisResult } from '../rag/rag-synthesizer.js';

export async function generateMetadataPayload(
  owner: string,
  repoName: string,
  repoUrl: string,
  isFork: boolean,
  evidence: ExtractedEvidence,
  classification: ClassificationResult,
  ragSynthesis?: RagSynthesisResult
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
  const synthesis = ragSynthesis || (await runMultiPassSynthesis(evidence));
  const mermaidDiagram = generateMermaidArchitectureDiagram(evidence);
  const dataFlowDiagram = generateMermaidDataFlowDiagram(evidence);
  const sequenceDiagram = generateMermaidSequenceDiagram(evidence);

  const mediumDescription = ragSynthesis?.mediumDescription || generateMediumDescription(evidence);
  const longDescription = ragSynthesis?.longDescription || ragSynthesis?.architectureDescription || generateExhaustiveTechnicalDescription(evidence);
  const architectureOverview = synthesis.architectureOverview || generateArchitectureOverview(evidence);
  const userFlow = synthesis.userFlow || generateTechnicalUserFlow(evidence);
  const codeFlow = synthesis.codeFlow || generateTechnicalCodeFlow(evidence);
  const cleanShortDesc = synthesis.shortDescription || cleanShortDescription(evidence.readmeSummary, repoName, category, evidence.detectedLanguages);
  const remotionVideoScript = generateRemotionVideoScript(evidence);

  let combinedDescription = mediumDescription;
  if (cleanShortDesc && mediumDescription && !mediumDescription.includes(cleanShortDesc)) {
    combinedDescription = `${cleanShortDesc}\n\n${mediumDescription}`;
  } else if (cleanShortDesc && !mediumDescription) {
    combinedDescription = cleanShortDesc;
  }

  const rawPayload = {
    _id: `${slug}-id`,
    title: repoName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    slug,
    shortDescription: combinedDescription,
    description: combinedDescription,
    longDescription,
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
    dataFlowDiagram,
    sequenceDiagram,
    liveUrl: null,
    githubUrl: repoUrl,
    apiDocsUrl: null,
    figmaUrl: null,
    videoUrl: null,
    contributors: [owner],
    features: synthesis.features.length > 0 ? synthesis.features : evidence.features,
    challenges: synthesis.challenges,
    learnings: synthesis.learnings,
    architectureOverview,
    userFlow,
    codeFlow,
    apiEndpoints: evidence.apiEndpoints,
    keyModules: evidence.keyModules,
    metrics: null,
    clientTestimonial: null,
    relatedBlogs: [],
    futureRoadmap: synthesis.futureRoadmap,
    remotionVideoScript,
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
