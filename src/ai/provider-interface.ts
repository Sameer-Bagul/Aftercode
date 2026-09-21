export interface AiGenerationOptions {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  modelsToTry?: string[];
  responseMimeType?: string;
}

export interface AiGenerationResult {
  text: string;
  providerName: string;
  modelUsed: string;
}

export interface AiProvider {
  readonly name: string;
  isAvailable(): boolean;
  generateJson(options: AiGenerationOptions): Promise<AiGenerationResult>;
}
