import { AiProvider, AiGenerationOptions, AiGenerationResult } from '../provider-interface.js';

export class OpenRouterProvider implements AiProvider {
  public readonly name = 'OpenRouter AI';

  public isAvailable(): boolean {
    const key = process.env.OPENROUTER_API_KEY;
    return Boolean(key && key !== 'your_openrouter_api_key_here');
  }

  public async generateJson(options: AiGenerationOptions): Promise<AiGenerationResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('[OpenRouterProvider] Missing OPENROUTER_API_KEY environment variable.');
    }

    const modelsToTry = options.modelsToTry || [
      'google/gemini-flash-1.5',
      'meta-llama/llama-3.1-70b-instruct',
      'anthropic/claude-3.5-sonnet',
    ];

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://aftercode.dev',
            'X-Title': 'Aftercode Engine',
          },
          body: JSON.stringify({
            model,
            messages: [
              {
                role: 'system',
                content: options.systemInstruction || 'You are an expert software metadata JSON generator.',
              },
              {
                role: 'user',
                content: options.prompt,
              },
            ],
            temperature: options.temperature ?? 0.2,
            response_format: { type: 'json_object' },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter HTTP ${response.status}: ${errText}`);
        }

        const data: any = await response.json();
        const text = data?.choices?.[0]?.message?.content;

        if (text) {
          return {
            text,
            providerName: this.name,
            modelUsed: model,
          };
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error(`[OpenRouterProvider] All target OpenRouter models failed generation.`);
  }
}
