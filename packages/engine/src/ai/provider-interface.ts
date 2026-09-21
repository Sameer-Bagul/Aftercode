/**
 * AiGenerationOptions
 * Universal options passed to any AI provider driver for JSON metadata synthesis.
 */
export interface AiGenerationOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  modelsToTry?: string[];
  responseMimeType?: string;
}

/**
 * AiGenerationResult
 * Unified response returned by an active AI provider driver.
 */
export interface AiGenerationResult {
  text: string;
  providerName: string;
  modelUsed: string;
}

/**
 * AiProvider
 * Pluggable interface for AI LLM providers (Gemini, OpenRouter, OpenAI, etc.).
 */
export interface AiProvider {
  readonly name: string;
  isAvailable(): boolean;
  generateJson(options: AiGenerationOptions): Promise<AiGenerationResult>;
}
