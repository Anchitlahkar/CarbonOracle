import { ExtractionValidation } from '@carbonsense/shared-types';

export class ReceiptValidationService {
  /**
   * Performs validation checks on raw receipt extractions to compile missing or suspicious fields,
   * determining if a manual review is required.
   */
  public static validate(
    items: Array<{
      name?: string;
      quantity?: number;
      unit?: string;
      category?: string;
      subCategory?: string;
      confidence?: number;
    }>,
    overallConfidence: number
  ): ExtractionValidation {
    const missingFields: string[] = [];
    const suspiciousFields: string[] = [];

    if (!items || items.length === 0) {
      suspiciousFields.push('No items extracted from image');
    }

    items.forEach((item, index) => {
      const identifier = item.name || `Item #${index + 1}`;
      
      if (!item.name) {
        missingFields.push(`Item #${index + 1}: name`);
      }
      if (item.quantity === undefined || item.quantity === null) {
        missingFields.push(`${identifier}: quantity`);
      } else if (item.quantity <= 0) {
        suspiciousFields.push(`${identifier}: quantity is zero or negative (${item.quantity})`);
      }

      if (!item.unit) {
        missingFields.push(`${identifier}: unit`);
      }

      if (!item.category) {
        missingFields.push(`${identifier}: category`);
      } else if (!['transport', 'food', 'energy', 'shopping'].includes(item.category.toLowerCase())) {
        suspiciousFields.push(`${identifier}: invalid category '${item.category}'`);
      }

      if (item.confidence !== undefined && item.confidence < 0.6) {
        suspiciousFields.push(`${identifier}: low extraction confidence (${(item.confidence * 100).toFixed(0)}%)`);
      }
    });

    const isLowConfidence = overallConfidence < 0.7;
    const hasIssues = missingFields.length > 0 || suspiciousFields.length > 0;
    const requiresReview = isLowConfidence || hasIssues || items.length === 0;

    return {
      confidence: overallConfidence,
      missingFields,
      suspiciousFields,
      requiresReview
    };
  }
}
export default ReceiptValidationService;
