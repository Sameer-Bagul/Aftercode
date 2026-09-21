import { AiProvider, AiGenerationOptions, AiGenerationResult } from '../provider-interface.js';

export class OpenAiProvider implements AiProvider {
  public readonly name = 'OpenAI';

  public isAvailable(): boolean {
    const key = process.env.OPENAI_API_KEY;
    return Boolean(key && key !== 'your_openai_api_key_here');
  }

  public async generateJson(options: AiGenerationOptions): Promise<AiGenerationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('[OpenAiProvider] Missing OPENAI_API_KEY environment variable.');
    }

    const modelsToTry = options.modelsToTry || ['gpt-4o-mini', 'gpt-4o'];

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
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
          throw new Error(`OpenAI HTTP ${response.status}: ${errText}`);
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

    throw lastError || new Error(`[OpenAiProvider] All target OpenAI models failed generation.`);
  }
}
