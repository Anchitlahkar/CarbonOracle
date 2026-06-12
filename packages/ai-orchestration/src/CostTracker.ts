import { AIUsageMetrics } from '@carbonsense/shared-types';

export class CostTracker {
  // Model pricing rates per 1,000,000 tokens in USD
  private static readonly PRICING_RATES: Record<string, { inputRate: number; outputRate: number }> = {
    'gemini-3.1-flash-lite': { inputRate: 0.25, outputRate: 1.50 },
    'gemini-1.5-flash': { inputRate: 0.075, outputRate: 0.30 },
    'gemini-1.5-pro': { inputRate: 1.25, outputRate: 5.0 },
    'default': { inputRate: 0.25, outputRate: 1.50 }
  };

  /**
   * Generates AIUsageMetrics structure including estimated USD cost based on token counts.
   */
  public static calculateMetrics(
    provider: string,
    model: string,
    promptTokens: number,
    completionTokens: number,
    latencyMs: number
  ): AIUsageMetrics {
    const rateKey = model.toLowerCase().includes('pro') 
      ? 'gemini-1.5-pro' 
      : model.toLowerCase().includes('1.5-flash') 
        ? 'gemini-1.5-flash' 
        : 'gemini-3.1-flash-lite';
    const rate = this.PRICING_RATES[rateKey] || this.PRICING_RATES['default'];

    const inputCost = (promptTokens / 1_000_000) * rate.inputRate;
    const outputCost = (completionTokens / 1_000_000) * rate.outputRate;
    const estimatedCostUsd = parseFloat((inputCost + outputCost).toFixed(8));

    return {
      provider,
      model,
      promptTokens,
      completionTokens,
      estimatedCostUsd,
      latencyMs
    };
  }
}
export default CostTracker;
