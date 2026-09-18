import * as fs from 'fs';
import * as path from 'path';
import { execa } from 'execa';
import { VideoWorkspacePaths } from '../workspace/video-workspace.js';
import { supertonicSynthesizer } from './supertonic-tts.js';
import { SupertonicVoiceStyle, AudioSynthesisStatus } from '@aftercode/shared';

export interface LocalTtsSceneAudio {
  sceneNumber: number;
  narrationText: string;
  audioPath: string;
  durationSeconds: number;
  normalized: boolean;
}

export interface LocalTtsSynthesisResult {
  slug: string;
  status: AudioSynthesisStatus;
  voiceProvider: string;
  sceneAudios: LocalTtsSceneAudio[];
  combinedAudioPath: string;
  totalDurationSeconds: number;
  error?: string | null;
}

/**
 * Synthesizes voice narration offline using dedicated Supertonic 3 TTS engine
 * and normalizes audio levels using FFmpeg loudnorm filter.
 */
export async function synthesizeLocalTtsVoiceover(
  paths: VideoWorkspacePaths,
  slug: string,
  scenes: { sceneNumber: number; narration: string }[],
  options?: { voiceStyle?: SupertonicVoiceStyle; language?: string }
): Promise<LocalTtsSynthesisResult> {
  const narrationDir = paths.narrationAudioDir;
  if (!fs.existsSync(narrationDir)) {
    fs.mkdirSync(narrationDir, { recursive: true });
  }

  const voiceStyle = options?.voiceStyle || 'M1';
  const language = options?.language || 'en';
  const sceneAudios: LocalTtsSceneAudio[] = [];
  let hasFailure = false;
  let lastError: string | undefined = undefined;

  for (const scene of scenes) {
    const rawFileName = `scene-${scene.sceneNumber}-raw.wav`;
    const normFileName = `scene-${scene.sceneNumber}.wav`;
    const rawFilePath = path.join(narrationDir, rawFileName);
    const normFilePath = path.join(narrationDir, normFileName);

    console.log(` 🎙️ [Supertonic 3 TTS Engine] Synthesizing Scene ${scene.sceneNumber} (${voiceStyle}, ${language})...`);

    // Dedicated Supertonic 3 synthesis execution
    const res = await supertonicSynthesizer.synthesize({
      text: scene.narration,
      outputPath: rawFilePath,
      voiceStyle,
      language,
    });

    if (!res.success) {
      hasFailure = true;
      lastError = res.error || 'Supertonic 3 synthesis failed.';
      console.warn(` ⚠️ [Supertonic 3 TTS Engine] Scene ${scene.sceneNumber} failed: ${lastError}`);
      break;
    }

    // Normalize audio levels via FFmpeg loudnorm filter
    let finalPath = rawFilePath;
    let normalized = false;
    try {
      await execa('ffmpeg', [
        '-y',
        '-i',
        rawFilePath,
        '-af',
        'loudnorm=I=-16:TP=-1.5:LRA=11',
        '-ar',
        '44100',
        normFilePath,
      ]);
      finalPath = normFilePath;
      normalized = true;
    } catch {
      finalPath = rawFilePath;
    }

    const durationSeconds = res.durationSeconds || Math.max(3, Math.ceil(scene.narration.split(/\s+/).length / 2.5));

    sceneAudios.push({
      sceneNumber: scene.sceneNumber,
      narrationText: scene.narration,
      audioPath: finalPath,
      durationSeconds,
      normalized,
    });
  }

  const combinedAudioPath = path.join(paths.audioDir, 'full-narration.wav');
  const totalDuration = sceneAudios.reduce((acc, s) => acc + s.durationSeconds, 0);

  if (hasFailure || sceneAudios.length === 0) {
    return {
      slug,
      status: 'failed',
      voiceProvider: 'Supertonic 3 ONNX Engine',
      sceneAudios: [],
      combinedAudioPath: '',
      totalDurationSeconds: 0,
      error: lastError || 'Supertonic 3 engine unavailable or model uninitialized.',
    };
  }

  return {
    slug,
    status: 'ready',
    voiceProvider: 'Supertonic 3 ONNX Engine',
    sceneAudios,
    combinedAudioPath,
    totalDurationSeconds: totalDuration,
    error: null,
  };
}
