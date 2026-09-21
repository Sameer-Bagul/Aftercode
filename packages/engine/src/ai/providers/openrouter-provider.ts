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
      'google/gemini-2.5-flash',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.3-70b-instruct',
      'mistralai/mistral-large',
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
                content: options.systemInstruction || 'You are an expert software architect synthesizing valid JSON metadata. Output ONLY valid raw JSON with no Markdown wrappers.',
              },
              {
                role: 'user',
                content: options.prompt,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: options.temperature ?? 0.2,
          }),
        });

        if (response.ok) {
          const data: any = await response.json();
          const content = data?.choices?.[0]?.message?.content;
          if (content) {
            return {
              text: content,
              providerName: this.name,
              modelUsed: model,
            };
          }
        } else {
          const errText = await response.text();
          lastError = new Error(`OpenRouter API error HTTP ${response.status}: ${errText}`);
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error(`[OpenRouterProvider] All target OpenRouter models failed generation.`);
  }
}
