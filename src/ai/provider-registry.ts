import { AiProvider, AiGenerationOptions, AiGenerationResult } from './provider-interface.js';
import { GeminiProvider } from './providers/gemini-provider.js';
import { OpenRouterProvider } from './providers/openrouter-provider.js';
import { OpenAiProvider } from './providers/openai-provider.js';

export interface AiSynthesisResult<T = any> extends AiGenerationResult {
  data: T;
}

export class AiProviderRegistry {
  private static providers: AiProvider[] = [
    new GeminiProvider(),
    new OpenRouterProvider(),
    new OpenAiProvider(),
  ];

  public static getActiveProviders(): AiProvider[] {
    return this.providers.filter((p) => p.isAvailable());
  }

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
