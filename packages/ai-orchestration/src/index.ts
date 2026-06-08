import { Result } from '@carbonsense/core';

export interface AIModelOptions {
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: string;
  systemInstruction?: string;
}

export interface AIOrchestrationService {
  /**
   * Generates a standard text completion
   */
  generateText(prompt: string, options?: AIModelOptions): Promise<Result<string>>;

  /**
   * Generates structured JSON adhering to a target schema
   */
  generateJson<T>(prompt: string, schema?: any, options?: AIModelOptions): Promise<Result<T>>;

  /**
   * Analyzes multi-modal input (such as an uploaded image of a receipt or utility bill)
   */
  analyzeImage<T>(
    imageBuffer: Buffer,
    mimeType: string,
    prompt: string,
    schema?: any,
    options?: AIModelOptions
  ): Promise<Result<T>>;
}
