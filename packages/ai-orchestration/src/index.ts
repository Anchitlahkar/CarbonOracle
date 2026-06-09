import { Result } from '@carbonsense/core';
import { AIUsageMetrics } from '@carbonsense/shared-types';

export interface AIModelOptions {
  temperature?: number;
  maxTokens?: number;
  responseMimeType?: string;
  systemInstruction?: string;
}

export interface ModelProvider {
  name: string;
  generateText(
    prompt: string,
    options?: AIModelOptions
  ): Promise<Result<{ text: string; usageMetrics: AIUsageMetrics }>>;

  generateJson<T>(
    prompt: string,
    schema?: any,
    options?: AIModelOptions
  ): Promise<Result<{ data: T; usageMetrics: AIUsageMetrics }>>;

  analyzeImage<T>(
    imageBuffer: Buffer,
    mimeType: string,
    prompt: string,
    schema?: any,
    options?: AIModelOptions
  ): Promise<Result<{ data: T; usageMetrics: AIUsageMetrics }>>;

  generateTextStream?(
    prompt: string,
    options?: AIModelOptions
  ): Promise<Result<{ stream: AsyncIterable<any>; countTokens: (text: string) => Promise<number> }>>;
}

export class ProviderRegistry {
  private providers = new Map<string, ModelProvider>();
  private defaultProviderName: string = '';

  public register(provider: ModelProvider, isDefault = false): void {
    this.providers.set(provider.name.toLowerCase(), provider);
    if (isDefault || !this.defaultProviderName) {
      this.defaultProviderName = provider.name.toLowerCase();
    }
  }

  public get(name?: string): ModelProvider {
    const key = (name || this.defaultProviderName).toLowerCase();
    const provider = this.providers.get(key);
    if (!provider) {
      throw new Error(`AI Model Provider '${key}' is not registered`);
    }
    return provider;
  }

  public list(): string[] {
    return Array.from(this.providers.keys());
  }
}

// Global registry instance
export const providerRegistry = new ProviderRegistry();

export { GeminiModelProvider } from './GeminiModelProvider';
export { PromptManager } from './PromptManager';
export { CostTracker } from './CostTracker';
export { ResponseValidator } from './ResponseValidator';

