import { normalizeSlug, stripEmojis, sanitizeObjectEmojis } from './normalizer.js';
import { runMultiPassSynthesis, generateMermaidArchitectureDiagram, generateExhaustiveTechnicalDescription, } from './ai-synthesizer.js';
import { generateRemotionVideoScript } from '../video/remotion-script-generator.js';
export async function generateMetadataPayload(owner, repoName, repoUrl, isFork, evidence, classification, ragSynthesis) {
    const slug = normalizeSlug(repoName);
    const now = new Date().toISOString();
    let category = 'Practice';
    if (evidence.techStack.aiMl.length > 0)
        category = 'AI/ML';
    else if (evidence.techStack.frontend.length > 0 && evidence.techStack.backend.length > 0)
        category = 'Web App';
    else if (evidence.techStack.frontend.length > 0)
        category = 'Web App';
    else if (evidence.techStack.backend.length > 0)
        category = 'API Service';
    else if (classification.type === 'portfolio-worthy')
        category = 'System';
    const isFeatured = classification.portfolioWorthiness === 'high';
    const synthesis = ragSynthesis || (await runMultiPassSynthesis(evidence));
    const mermaidDiagram = generateMermaidArchitectureDiagram(evidence);
    const exhaustiveDescription = ragSynthesis?.architectureDescription || generateExhaustiveTechnicalDescription(evidence);
    const remotionVideoScript = generateRemotionVideoScript(evidence);
    // Clean markdown tags and extract first 180 chars of clean prose
    let cleanShortDesc = (evidence.readmeSummary || '')
        .replace(/#+\s*/g, '')
        .replace(/\*\*|__|\*|_/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/\s+/g, ' ')
        .trim();
    if (!cleanShortDesc || cleanShortDesc.length < 10) {
        cleanShortDesc = `Production-grade ${category} repository implementing ${evidence.detectedLanguages.slice(0, 3).join(', ')}.`;
    }
    else if (cleanShortDesc.length > 180) {
        cleanShortDesc = cleanShortDesc.substring(0, 180) + '...';
    }
    cleanShortDesc = stripEmojis(cleanShortDesc);
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
