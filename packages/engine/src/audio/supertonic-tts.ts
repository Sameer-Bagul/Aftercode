import * as fs from 'fs';
import * as path from 'path';
import { execa } from 'execa';
import { SupertonicVoiceStyle } from '@aftercode/shared';

export interface SupertonicTtsOptions {
  text: string;
  outputPath: string;
  voiceStyle?: SupertonicVoiceStyle;
  language?: string;
}

export interface SupertonicTtsResult {
  success: boolean;
  outputPath?: string;
  durationSeconds?: number;
  error?: string;
}

export class SupertonicTtsSynthesizer {
  private modelDir: string;

  constructor(customModelDir?: string) {
    this.modelDir = customModelDir || path.join(process.cwd(), '.video', 'models', 'supertonic-3');
  }

  /**
   * Synthesize text to speech using Supertonic 3 ONNX model / Python SDK
   */
  async synthesize(options: SupertonicTtsOptions): Promise<SupertonicTtsResult> {
    const { text, outputPath, voiceStyle = 'M1', language = 'en' } = options;

    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'Synthesizer error: Narration text string is empty.',
      };
    }

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      // 1. Check if Python Supertonic package or ONNX model is available locally
      const script = `
import sys
import json
try:
    from supertonic import TTS
    tts = TTS(auto_download=True)
    style = tts.get_voice_style(voice_name="${voiceStyle}")
    wav, duration = tts.synthesize("${text.replace(/"/g, '\\"')}", voice_style=style, lang="${language}")
    tts.save_audio(wav, "${outputPath}")
    print(json.dumps({"success": True, "duration": float(duration)}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`;

      const { stdout } = await execa('python3', ['-c', script], { reject: false });

      if (stdout) {
        try {
          const res = JSON.parse(stdout.trim().split('\n').pop() || '{}');
          if (res.success && fs.existsSync(outputPath)) {
            return {
              success: true,
              outputPath,
              durationSeconds: res.duration || 5.0,
            };
          } else if (res.error) {
            return {
              success: false,
              error: `Supertonic 3 synthesis error: ${res.error}`,
            };
          }
        } catch {
          // Fall through to file verification check below
        }
      }

      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 100) {
        return {
          success: true,
          outputPath,
          durationSeconds: 5.0,
        };
      }

      return {
        success: false,
        error: 'Supertonic 3 ONNX engine unavailable. Install python package via: pip install supertonic',
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Supertonic 3 engine execution failed: ${err?.message || String(err)}`,
      };
    }
  }
}

export const supertonicSynthesizer = new SupertonicTtsSynthesizer();
