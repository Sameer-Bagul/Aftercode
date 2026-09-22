import { AiProvider, AiGenerationOptions, AiGenerationResult } from '../provider-interface.js';

export class GroqProvider implements AiProvider {
  public readonly name = 'Groq AI';

  private customApiKey?: string;

  constructor(apiKey?: string) {
    this.customApiKey = apiKey;
  }

  public isAvailable(): boolean {
    const key = this.customApiKey || process.env.GROQ_API_KEY;
    return Boolean(key && key !== 'your_groq_api_key_here');
  }

  public async generateJson(options: AiGenerationOptions): Promise<AiGenerationResult> {
    const apiKey = this.customApiKey || process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('[GroqProvider] Missing GROQ_API_KEY environment variable.');
    }

    const targetModel =
      process.env.GROQ_MODEL ||
      (options.modelsToTry && options.modelsToTry[0]) ||
      'llama-3.3-70b-versatile';

    const modelsToTry = [
      targetModel,
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ].filter((v, i, a) => a.indexOf(v) === i);

    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        console.log(` 🤖 [GroqProvider] Executing request on model '${model}'...`);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
                content:
                  options.systemInstruction ||
                  'You are an expert software architect synthesizing valid JSON metadata. Output ONLY valid raw JSON with no Markdown wrappers.',
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
            console.log(` ✅ [GroqProvider] Successfully generated response with model '${model}'`);
            return {
              text: content,
              providerName: this.name,
              modelUsed: model,
            };
          }
        } else {
          const errText = await response.text();
          console.warn(` ⚠️ [GroqProvider] Model '${model}' returned HTTP ${response.status}: ${errText}`);
          lastError = new Error(`Groq API error HTTP ${response.status}: ${errText}`);
        }
      } catch (err: any) {
        console.warn(` ⚠️ [GroqProvider] Model '${model}' failed: ${err.message}`);
        lastError = err;
      }
    }

    throw lastError || new Error(`[GroqProvider] All target Groq models failed generation.`);
  }
}
