import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { AiProvider, AiGenerationOptions, AiGenerationResult } from './provider-interface.js';
import { GeminiProvider } from './providers/gemini-provider.js';
import { GroqProvider } from './providers/groq-provider.js';
import { OpenRouterProvider } from './providers/openrouter-provider.js';
import { OpenAiProvider } from './providers/openai-provider.js';

export interface AiSynthesisResult<T = any> extends AiGenerationResult {
  data: T;
}

function ensureEnvLoaded() {
  let current = process.cwd();
  while (current !== path.parse(current).root) {
    const envPath = path.join(current, '.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: false });
      break;
    }
    current = path.dirname(current);
  }
}

export class AiProviderRegistry {
  private static providers: AiProvider[] = [
    new GeminiProvider(),
    new GroqProvider(),
    new OpenRouterProvider(),
    new OpenAiProvider(),
  ];

  /**
   * Returns list of currently active & configured AI providers.
   * If PRIMARY_AI_PROVIDER is set in .env, exclusively uses that selected provider.
   */
  public static getActiveProviders(): AiProvider[] {
    ensureEnvLoaded();
    const available = this.providers.filter((p) => p.isAvailable());

    const selectedId = (process.env.PRIMARY_AI_PROVIDER || process.env.ACTIVE_AI_PROVIDER || '').toLowerCase();

    if (selectedId) {
      const selectedProvider = available.find((p) => {
        const pName = p.name.toLowerCase();
        if (selectedId === 'groq' && pName.includes('groq')) return true;
        if (selectedId === 'gemini' && pName.includes('gemini')) return true;
        if (selectedId === 'openrouter' && pName.includes('openrouter')) return true;
        if (selectedId === 'openai' && pName.includes('openai') && !pName.includes('openrouter')) return true;
        return false;
      });

      if (selectedProvider) {
        console.log(` 🎯 [AiProviderRegistry] Using exclusively selected provider '${selectedProvider.name}'.`);
        return [selectedProvider];
      }
    }

    return available;
  }

  /**
   * Synthesizes JSON payload by iterating through configured AI providers.
   * If the primary provider fails or rate-limits, it falls back to the next active provider.
   */
  public static async synthesizeJson<T = any>(
    promptOrOptions: string | AiGenerationOptions
  ): Promise<AiSynthesisResult<T>> {
    const options: AiGenerationOptions =
      typeof promptOrOptions === 'string'
        ? { prompt: promptOrOptions }
        : promptOrOptions;

    const active = this.getActiveProviders();

    if (active.length === 0) {
      throw new Error('[AiProviderRegistry] No active AI provider credentials found in .env.');
    }

    let lastError: any = null;

    for (const provider of active) {
      try {
        console.log(` 🤖 [AI Layer] Invoking ${provider.name} provider...`);
        const result = await provider.generateJson(options);
        
        // Extract JSON from response text safely
        const jsonText = result.text.replace(/```json\s*|\s*```/g, '').trim();
        const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        const dataToParse = jsonMatch ? jsonMatch[0] : jsonText;
        const parsed = JSON.parse(dataToParse);

        console.log(` ✅ [AI Layer] ${result.providerName} generation successful (Model: ${result.modelUsed}).`);
        return {
          ...result,
          data: parsed as T,
        };
      } catch (err: any) {
        console.warn(` ⚠️ [AI Layer] ${provider.name} failed (${err.message}). Trying next available provider...`);
        lastError = err;
      }
    }

    throw lastError || new Error('[AiProviderRegistry] All active AI providers failed generation.');
  }
}
