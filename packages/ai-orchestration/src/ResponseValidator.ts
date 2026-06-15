import { Result, ok, fail, ValidationError } from '@carbonsense/core';

export class ResponseValidator {
  /**
   * Cleans potential markdown block syntax (like ```json ... ```) from response text.
   */
  public static cleanJsonText(rawText: string): string {
    return rawText
      .replace(/```json\n?|\n?```/g, '')
      .replace(/```\n?|\n?```/g, '')
      .trim();
  }

  /**
   * Parses JSON string, cleans code fences, and validates against an optional schema function.
   */
  public static parseAndValidateJson<T>(
    rawText: string,
    validateFn?: (parsed: unknown) => boolean
  ): Result<T> {
    try {
      const cleanText = this.cleanJsonText(rawText);
      const parsed = JSON.parse(cleanText) as T;

      if (validateFn && !validateFn(parsed)) {
        return fail(new ValidationError('Model response parsed successfully but failed schema validation'));
      }

      return ok(parsed);
    } catch (error: unknown) {
      return fail(new ValidationError(`Failed to parse model response as JSON: ${error.message}`));
    }
  }
}
export default ResponseValidator;
