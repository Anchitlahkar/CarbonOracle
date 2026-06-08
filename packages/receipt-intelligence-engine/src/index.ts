import { Result } from '@carbonsense/core';
import { CarbonCategory } from '@carbonsense/shared-types';

export interface ReceiptAnalysisResult {
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    estimatedCarbonKg: number;
    category: CarbonCategory;
  }>;
  totalCarbonKg: number;
  confidence: number;
}

export interface ReceiptIntelligenceEngine {
  /**
   * Processes a receipt or utility bill image to extract item details and carbon weights.
   */
  analyzeReceipt(imageBuffer: Buffer, mimeType: string): Promise<Result<ReceiptAnalysisResult>>;
}
