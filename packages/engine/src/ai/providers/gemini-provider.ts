import { GoogleGenAI } from '@google/genai';
import { AiProvider, AiGenerationOptions, AiGenerationResult } from '../provider-interface.js';

export class GeminiProvider implements AiProvider {
  public readonly name = 'Google Gemini AI';

  public isAvailable(): boolean {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
    return Boolean(key && key !== 'your_gemini_api_key_here');
  }

  public async generateJson(options: AiGenerationOptions): Promise<AiGenerationResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('[GeminiProvider] Missing GEMINI_API_KEY environment variable.');
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelsToTry = options.modelsToTry || [
      'gemini-3.6-flash',
      'gemini-flash-latest',
      'gemini-2.5-flash',
    ];

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(` 🤖 [GeminiProvider] Trying model '${model}'...`);
        const response: any = await ai.models.generateContent({
          model,
          contents: options.prompt,
          config: {
            responseMimeType: options.responseMimeType || 'application/json',
            temperature: options.temperature ?? 0.2,
          },
        });

        if (response && response.text) {
          console.log(` ✅ [GeminiProvider] Successfully generated response with model '${model}'`);
          return {
            text: response.text,
            providerName: this.name,
            modelUsed: model,
          };
        }
      } catch (err: any) {
        console.warn(` ⚠️ [GeminiProvider] Model '${model}' failed: ${err.message}`);
        lastError = err;
      }
    }

    throw lastError || new Error(`[GeminiProvider] All target Gemini models failed generation.`);
  }
}
