import { GoogleGenAI } from '@google/genai';
import { AiProvider, AiGenerationOptions, AiGenerationResult } from '../provider-interface.js';

export class GeminiProvider implements AiProvider {
  public readonly name = 'Google Gemini AI';

  // Rate Limiting Rules: Free Tier allows 15 Requests Per Minute (RPM) -> 1 request every 4000ms (4s)
  private static lastRequestTimestamp = 0;
  private static readonly MIN_REQUEST_INTERVAL_MS = 4000;

  public isAvailable(): boolean {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
    return Boolean(key && key !== 'your_gemini_api_key_here');
  }

  private async enforceRateLimitPacing(): Promise<void> {
    const now = Date.now();
    const elapsed = now - GeminiProvider.lastRequestTimestamp;
    if (elapsed < GeminiProvider.MIN_REQUEST_INTERVAL_MS) {
      const waitTime = GeminiProvider.MIN_REQUEST_INTERVAL_MS - elapsed;
      console.log(` ⏱️ [GeminiProvider] Enforcing 15 RPM rate limit timer (waiting ${(waitTime / 1000).toFixed(1)}s)...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    GeminiProvider.lastRequestTimestamp = Date.now();
  }

  public async generateJson(options: AiGenerationOptions): Promise<AiGenerationResult> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error('[GeminiProvider] Missing GEMINI_API_KEY environment variable.');
    }

    const ai = new GoogleGenAI({ apiKey });

    // Single target model (default: gemini-3.8-flash, configurable via GEMINI_MODEL)
    const targetModel = process.env.GEMINI_MODEL || (options.modelsToTry && options.modelsToTry[0]) || 'gemini-3.8-flash';

    const maxRetries = 3;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Enforce 15 RPM request pacing timer before calling Gemini API
        await this.enforceRateLimitPacing();

        console.log(` 🤖 [GeminiProvider] Executing request on single model '${targetModel}' (attempt ${attempt}/${maxRetries})...`);
        const response: any = await ai.models.generateContent({
          model: targetModel,
          contents: options.prompt,
          config: {
            responseMimeType: options.responseMimeType || 'application/json',
            temperature: options.temperature ?? 0.2,
          },
        });

        if (response && response.text) {
          console.log(` ✅ [GeminiProvider] Successfully generated response with model '${targetModel}'`);
          return {
            text: response.text,
            providerName: this.name,
            modelUsed: targetModel,
          };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err.message || String(err);
        const isTransient =
          errMsg.includes('503') ||
          errMsg.includes('429') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('high demand');

        if (isTransient && attempt < maxRetries) {
          const backoffMs = attempt * 5000;
          console.warn(` ⚠️ [GeminiProvider] Rate limit / high demand spike detected (${errMsg}). Waiting ${backoffMs / 1000}s before retry...`);
          await new Promise((res) => setTimeout(res, backoffMs));
        } else {
          console.error(` ❌ [GeminiProvider] Single model '${targetModel}' request failed: ${errMsg}`);
          break;
        }
      }
    }

    throw lastError || new Error(`[GeminiProvider] Request to model '${targetModel}' failed.`);
  }
}
