import * as fs from 'fs';
import * as path from 'path';
export function getVideoWorkspacePaths(targetDir) {
    const videoDir = path.join(targetDir, '.video');
    return {
        rootDir: targetDir,
        videoDir,
        configPath: path.join(videoDir, 'config.json'),
        knowledgeDir: path.join(videoDir, 'knowledge'),
        scriptDir: path.join(videoDir, 'script'),
        storyboardDir: path.join(videoDir, 'storyboard'),
        assetsDir: path.join(videoDir, 'assets'),
        audioDir: path.join(videoDir, 'audio'),
        narrationAudioDir: path.join(videoDir, 'audio', 'narration'),
        rendersDir: path.join(videoDir, 'renders'),
        reportsDir: path.join(videoDir, 'reports'),
    };
}
export function initVideoWorkspace(targetDir, slug, template = 'technical-saas') {
    const paths = getVideoWorkspacePaths(targetDir);
    // Ensure all .video subdirectories exist
    const dirs = [
        paths.videoDir,
        paths.knowledgeDir,
        paths.scriptDir,
        paths.storyboardDir,
        paths.assetsDir,
        paths.audioDir,
        paths.narrationAudioDir,
        paths.rendersDir,
        paths.reportsDir,
    ];
    for (const dir of dirs) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }
    const config = {
        slug,
        resolution: { width: 1920, height: 1080 },
        fps: 30,
        template,
        voiceProvider: 'local-tts',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(paths.configPath, JSON.stringify(config, null, 2), 'utf-8');
    return paths;
}
export function saveWorkspaceArtifact(paths, relativePath, content) {
    const fullPath = path.join(paths.videoDir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    const data = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    fs.writeFileSync(fullPath, data, 'utf-8');
    return fullPath;
}
export function readWorkspaceArtifact(paths, relativePath) {
    const fullPath = path.join(paths.videoDir, relativePath);
    if (!fs.existsSync(fullPath))
        return null;
    try {
        const text = fs.readFileSync(fullPath, 'utf-8');
        if (relativePath.endsWith('.json')) {
            return JSON.parse(text);
        }
        return text;
    }
    catch {
        return null;
    }
}
