import * as fs from 'fs';
import * as path from 'path';
export function classifyRepository(workspaceDir, isFork, isArchived) {
    console.log(` 🔍 [Step 2/7] Classifying repository structural complexity and portfolio worthiness...`);
    const reasons = [];
    if (isArchived) {
        console.log(` ⚠️ [Step 2/7] Repository classified as 'archived'`);
        return {
            type: 'archived',
            portfolioWorthiness: 'low',
            reasons: ['Repository marked as archived'],
        };
    }
    if (isFork) {
        console.log(` ⚠️ [Step 2/7] Repository classified as 'fork'`);
        return {
            type: 'fork',
            portfolioWorthiness: 'low',
            reasons: ['Repository is a fork'],
        };
    }
    if (!fs.existsSync(workspaceDir)) {
        console.log(` ⚠️ [Step 2/7] Repository classified as 'empty' (Workspace directory missing)`);
        return {
            type: 'empty',
            portfolioWorthiness: 'low',
            reasons: ['Workspace directory empty or missing'],
        };
    }
    let fileCount = 0;
    let hasManifest = false;
    let hasDocker = false;
    let hasDatabase = false;
    let hasAi = false;
    let hasReadme = false;
    const IGNORED_DIRS = new Set([
        '.git',
        'node_modules',
        'dist',
        'build',
        'out',
        '.next',
        '.nuxt',
        'target',
        'bin',
        'obj',
        'release',
        'debug',
        'coverage',
        '.cache',
        'vendor',
        '.venv',
        'venv',
        '__pycache__',
    ]);
    function scan(dir, depth = 0) {
        if (depth > 10)
            return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (IGNORED_DIRS.has(entry.name))
                continue;
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                scan(fullPath, depth + 1);
            }
            else if (entry.isFile()) {
                fileCount++;
                const lower = entry.name.toLowerCase();
                if (lower === 'readme.md')
                    hasReadme = true;
                if (['package.json', 'cargo.toml', 'requirements.txt', 'go.mod', 'pom.xml', 'build.gradle'].includes(lower)) {
                    hasManifest = true;
                }
                if (['dockerfile', 'docker-compose.yml', 'vercel.json'].includes(lower)) {
                    hasDocker = true;
                }
                if (lower.includes('schema.prisma') || lower.includes('schema.sql')) {
                    hasDatabase = true;
                }
            }
        }
    }
    try {
        scan(workspaceDir);
    }
    catch (err) {
        reasons.push(`Scanning error: ${err.message}`);
    }
    console.log(` 📊 [Step 2/7] Scanned ${fileCount} source files up to depth 10. Manifest: ${hasManifest ? 'YES' : 'NO'}, Docker/IaC: ${hasDocker ? 'YES' : 'NO'}, Database Schema: ${hasDatabase ? 'YES' : 'NO'}, README: ${hasReadme ? 'YES' : 'NO'}`);
    if (fileCount <= 2 && !hasManifest) {
        console.log(` 📌 [Step 2/7] Classification: 'empty' (Low worthiness)`);
        return {
            type: 'empty',
            portfolioWorthiness: 'low',
            reasons: ['Minimal to no source files detected'],
        };
    }
    if (hasManifest && (hasDocker || hasDatabase || fileCount > 20) && hasReadme) {
        console.log(` 🌟 [Step 2/7] Classification: 'portfolio-worthy' (High worthiness)`);
        return {
            type: 'portfolio-worthy',
            portfolioWorthiness: 'high',
            reasons: ['High file count', 'Manifest detected', 'Infrastructure/Database features present'],
        };
    }
    if (hasManifest || fileCount > 8) {
        console.log(` 📌 [Step 2/7] Classification: 'secondary' (Medium worthiness)`);
        return {
            type: 'secondary',
            portfolioWorthiness: 'medium',
            reasons: ['Functional codebase detected with standard dependencies'],
        };
    }
    console.log(` 📌 [Step 2/7] Classification: 'practice' (Low worthiness)`);
    return {
        type: 'practice',
        portfolioWorthiness: 'low',
        reasons: ['Small learning exercise or experiment'],
    };
}
