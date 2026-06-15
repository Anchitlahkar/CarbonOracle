import { expect, test, describe } from 'vitest';
import { DefaultReceiptIntelligenceEngine } from '../src/index';
import { CarbonScienceEngine } from '@carbonsense/carbon-science-engine';
import { ModelProvider, AIModelOptions } from '@carbonsense/ai-orchestration';
import { Result, ok, fail } from '@carbonsense/core';
import { AIUsageMetrics } from '@carbonsense/shared-types';

class MockModelProvider implements ModelProvider {
  public name = 'mock-provider';
  
  constructor(private mockResponse: Record<string, unknown>, private mockSuccess = true) {}

  public async generateText(
    prompt: string,
    options?: AIModelOptions
  ): Promise<Result<{ text: string; usageMetrics: AIUsageMetrics }>> {
    return ok({ text: JSON.stringify(this.mockResponse), usageMetrics: this.getMockMetrics() });
  }

  public async generateJson<T>(
    prompt: string,
    schema?: unknown,
    options?: AIModelOptions
  ): Promise<Result<{ data: T; usageMetrics: AIUsageMetrics }>> {
    return ok({ data: this.mockResponse as T, usageMetrics: this.getMockMetrics() });
  }

  public async analyzeImage<T>(
    imageBuffer: Buffer,
    mimeType: string,
    prompt: string,
    schema?: unknown,
    options?: AIModelOptions
  ): Promise<Result<{ data: T; usageMetrics: AIUsageMetrics }>> {
    if (this.mockSuccess) {
      return ok({ data: this.mockResponse as T, usageMetrics: this.getMockMetrics() });
    } else {
      return fail(new Error('Simulated model provider failure'));
    }
  }

  private getMockMetrics(): AIUsageMetrics {
    return {
      provider: this.name,
      model: 'mock-model',
      promptTokens: 100,
      completionTokens: 200,
      estimatedCostUsd: 0.0000675,
      latencyMs: 150
    };
  }
}

describe('DefaultReceiptIntelligenceEngine', () => {
  test('successfully parses a standard food receipt item and computes carbon', async () => {
    const mockResponse = {
      items: [
        {
          name: 'Fresh chicken breast',
          quantity: 2,
          unit: 'kg',
          category: 'food',
          subCategory: 'chicken',
          confidence: 0.95
        }
      ],
      confidence: 0.92
    };

    const mockProvider = new MockModelProvider(mockResponse);
    const carbonEngine = new CarbonScienceEngine();
    const engine = new DefaultReceiptIntelligenceEngine(mockProvider, carbonEngine);

    const result = await engine.analyzeReceipt(Buffer.from(''), 'image/jpeg');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.items).toHaveLength(1);
      expect(result.value.items[0].name).toBe('Fresh chicken breast');
      // Chicken emission factor is 6.9 kg CO2e / kg. 2 kg * 6.9 = 13.8.
      expect(result.value.items[0].estimatedCarbonKg).toBe(13.8);
      expect(result.value.totalCarbonKg).toBe(13.8);
      expect(result.value.confidence).toBe(0.92);
      expect(result.value.validation.requiresReview).toBe(false);
      expect(result.value.audit.extractedItems).toBe(1);
      expect(result.value.audit.validatedItems).toBe(1);
      expect(result.value.audit.flaggedItems).toBe(0);
      expect(result.value.usageMetrics.promptTokens).toBe(100);
    }
  });

  test('flags review when confidence is low or items fail calculation', async () => {
    const mockResponse = {
      items: [
        {
          name: 'Mysterious Item',
          quantity: 1,
          unit: 'kg',
          category: 'food',
          subCategory: 'unknown-subcategory',
          confidence: 0.5
        }
      ],
      confidence: 0.5
    };

    const mockProvider = new MockModelProvider(mockResponse);
    const carbonEngine = new CarbonScienceEngine();
    const engine = new DefaultReceiptIntelligenceEngine(mockProvider, carbonEngine);

    const result = await engine.analyzeReceipt(Buffer.from(''), 'image/jpeg');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.validation.requiresReview).toBe(true);
      expect(result.value.validation.confidence).toBe(0.5);
      expect(result.value.validation.suspiciousFields.length).toBeGreaterThan(0);
      expect(result.value.audit.validatedItems).toBe(0);
      expect(result.value.audit.flaggedItems).toBe(1);
    }
  });

  test('returns fail result when AI model provider analysis fails', async () => {
    const mockProvider = new MockModelProvider({}, false);
    const carbonEngine = new CarbonScienceEngine();
    const engine = new DefaultReceiptIntelligenceEngine(mockProvider, carbonEngine);

    const result = await engine.analyzeReceipt(Buffer.from(''), 'image/jpeg');
    expect(result.success).toBe(false);
  });
});
