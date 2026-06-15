import { Result, ok, fail, ValidationError } from '@carbonsense/core';
import { 
  CarbonCategory, 
  ReceiptAnalysisResult, 
  ReceiptItem, 
  ExtractionValidation, 
  ReceiptAudit,
  AIUsageMetrics 
} from '@carbonsense/shared-types';
import { ModelProvider, PromptManager } from '@carbonsense/ai-orchestration';
import { CarbonScienceEngine } from '@carbonsense/carbon-science-engine';

export interface ReceiptIntelligenceEngine {
  /**
   * Processes a receipt or utility bill image to extract item details and carbon weights.
   */
  analyzeReceipt(imageBuffer: Buffer, mimeType: string): Promise<Result<ReceiptAnalysisResult>>;
}

export class DefaultReceiptIntelligenceEngine implements ReceiptIntelligenceEngine {
  constructor(
    private provider: ModelProvider,
    private carbonEngine: CarbonScienceEngine
  ) {}

  public async analyzeReceipt(imageBuffer: Buffer, mimeType: string): Promise<Result<ReceiptAnalysisResult>> {
    const startTime = Date.now();

    // 1. Compile the prompt from the Dynamic Prompt Registry
    let compiledPrompt: { template: string; version: string };
    try {
      compiledPrompt = PromptManager.compilePrompt('receipt-analysis', {});
    } catch (error: unknown) {
      return fail(new ValidationError(`Failed to load receipt analysis prompt: ${(error as Error).message}`));
    }

    // 2. Call the AI model provider visual analyzer
    const aiResult = await this.provider.analyzeImage<{
      items: Array<{
        name: string;
        quantity: number;
        unit: string;
        category: string;
        subCategory: string;
        confidence: number;
      }>;
      confidence: number;
    }>(
      imageBuffer,
      mimeType,
      compiledPrompt.template
    );

    if (!aiResult.success) {
      return fail(aiResult.error);
    }

    const { data, usageMetrics } = aiResult.value;

    const extractedItems = data.items || [];
    const receiptItems: ReceiptItem[] = [];
    let validatedItems = 0;
    let flaggedItems = 0;
    let totalCarbonKg = 0;
    const suspiciousFields: string[] = [];
    const missingFields: string[] = [];

    // 3. Process extracted facts and execute Carbon Science Engine calculations
    for (const rawItem of extractedItems) {
      let estimatedCarbonKg = 0;

      // Validate raw items and track missing fields
      if (!rawItem.name) missingFields.push('item name');
      if (rawItem.quantity === undefined || rawItem.quantity === null) {
        missingFields.push(`${rawItem.name || 'item'}: quantity`);
      }
      if (!rawItem.unit) {
        missingFields.push(`${rawItem.name || 'item'}: unit`);
      }

      // Check category and calculate carbon
      const category = rawItem.category?.toLowerCase() as CarbonCategory;
      if (['transport', 'food', 'energy', 'shopping'].includes(category)) {
        const qty = typeof rawItem.quantity === 'number' ? rawItem.quantity : 1;
        
        const calcResult = this.carbonEngine.calculate({
          category,
          subCategory: rawItem.subCategory || '',
          amount: qty,
          unit: rawItem.unit || '',
        });

        if (calcResult.success) {
          estimatedCarbonKg = calcResult.value.value;
          validatedItems++;
        } else {
          flaggedItems++;
          suspiciousFields.push(`${rawItem.name || 'item'}: carbon calculation failed (${calcResult.error.message})`);
        }
      } else {
        flaggedItems++;
        suspiciousFields.push(`${rawItem.name || 'item'}: invalid category '${rawItem.category}'`);
      }

      receiptItems.push({
        name: rawItem.name || 'Unknown Item',
        quantity: typeof rawItem.quantity === 'number' ? rawItem.quantity : 1,
        unit: rawItem.unit || 'item',
        category: category || 'shopping',
        subCategory: rawItem.subCategory || 'unknown',
        estimatedCarbonKg,
        confidence: typeof rawItem.confidence === 'number' ? rawItem.confidence : 0.5,
      });

      totalCarbonKg += estimatedCarbonKg;
    }

    // Round total carbon
    totalCarbonKg = parseFloat(totalCarbonKg.toFixed(4));

    // 4. Hallucination Protection and review assessment
    const extractionConfidence = typeof data.confidence === 'number' ? data.confidence : 0.5;
    const isLowConfidence = extractionConfidence < 0.7;
    const hasIssues = missingFields.length > 0 || suspiciousFields.length > 0;
    const requiresReview = isLowConfidence || hasIssues || extractedItems.length === 0;

    const validation: ExtractionValidation = {
      confidence: extractionConfidence,
      missingFields,
      suspiciousFields,
      requiresReview,
    };

    // 5. Build Receipt Audit Trail
    const processingTimeMs = Date.now() - startTime;
    const audit: ReceiptAudit = {
      extractedItems: extractedItems.length,
      validatedItems,
      flaggedItems,
      modelUsed: this.provider.name,
      processingTimeMs,
    };

    return ok({
      items: receiptItems,
      totalCarbonKg,
      confidence: extractionConfidence,
      validation,
      audit,
      usageMetrics,
    });
  }
}

