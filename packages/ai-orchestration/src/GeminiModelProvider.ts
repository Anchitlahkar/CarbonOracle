import { Result, ok, fail, InfrastructureError } from '@carbonsense/core';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { AIModelOptions, ModelProvider } from './index';
import CostTracker from './CostTracker';
import ResponseValidator from './ResponseValidator';
import { AIUsageMetrics } from '@carbonsense/shared-types';

export class GeminiModelProvider implements ModelProvider {
  public readonly name = 'gemini';
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required to initialize GeminiModelProvider');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private getModel(modelName: string, options?: AIModelOptions) {
    return this.genAI.getGenerativeModel({
      model: modelName,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      ],
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens ?? 1000,
        responseMimeType: options?.responseMimeType,
      },
      systemInstruction: options?.systemInstruction,
    });
  }

  public async generateText(
    prompt: string,
    options?: AIModelOptions
  ): Promise<Result<{ text: string; usageMetrics: AIUsageMetrics }>> {
    const startTime = Date.now();
    const modelName = 'gemini-3.1-flash-lite';
    const model = this.getModel(modelName, options);

    try {
      const promptTokensCount = await model.countTokens(prompt);
      const promptTokens = promptTokensCount.totalTokens;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const completionTokensCount = await model.countTokens(text);
      const completionTokens = completionTokensCount.totalTokens;
      const latencyMs = Date.now() - startTime;

      const usageMetrics = CostTracker.calculateMetrics(
        this.name,
        modelName,
        promptTokens,
        completionTokens,
        latencyMs
      );

      return ok({ text, usageMetrics });
    } catch (error: any) {
      return fail(new InfrastructureError(`Gemini Text execution failed: ${error.message}`));
    }
  }

  public async generateJson<T>(
    prompt: string,
    schema?: any,
    options?: AIModelOptions
  ): Promise<Result<{ data: T; usageMetrics: AIUsageMetrics }>> {
    const startTime = Date.now();
    const modelName = 'gemini-3.1-flash-lite';
    const jsonOptions = { ...options, responseMimeType: 'application/json' };
    const model = this.getModel(modelName, jsonOptions);

    try {
      const promptTokensCount = await model.countTokens(prompt);
      const promptTokens = promptTokensCount.totalTokens;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      const completionTokensCount = await model.countTokens(responseText);
      const completionTokens = completionTokensCount.totalTokens;
      const latencyMs = Date.now() - startTime;

      const usageMetrics = CostTracker.calculateMetrics(
        this.name,
        modelName,
        promptTokens,
        completionTokens,
        latencyMs
      );

      const validation = ResponseValidator.parseAndValidateJson<T>(responseText);
      if (!validation.success) {
        return fail(validation.error);
      }

      return ok({ data: validation.value, usageMetrics });
    } catch (error: any) {
      return fail(new InfrastructureError(`Gemini JSON execution failed: ${error.message}`));
    }
  }

  public async analyzeImage<T>(
    imageBuffer: Buffer,
    mimeType: string,
    prompt: string,
    schema?: any,
    options?: AIModelOptions
  ): Promise<Result<{ data: T; usageMetrics: AIUsageMetrics }>> {
    const startTime = Date.now();
    const modelName = 'gemini-3.1-flash-lite';
    const model = this.getModel(modelName, options);

    try {
      const base64Image = imageBuffer.toString('base64');

      const promptTokensCount = await model.countTokens(prompt);
      let promptTokens = promptTokensCount.totalTokens;
      // standard placeholder cost for visual processing in Gemini 1.5 Flash
      promptTokens += 258;

      const result = await model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType as any,
            data: base64Image
          }
        }
      ]);

      const response = await result.response;
      const responseText = response.text();

      const completionTokensCount = await model.countTokens(responseText);
      const completionTokens = completionTokensCount.totalTokens;
      const latencyMs = Date.now() - startTime;

      const usageMetrics = CostTracker.calculateMetrics(
        this.name,
        modelName,
        promptTokens,
        completionTokens,
        latencyMs
      );

      const validation = ResponseValidator.parseAndValidateJson<T>(responseText);
      if (!validation.success) {
        return fail(validation.error);
      }

      return ok({ data: validation.value, usageMetrics });
    } catch (error: any) {
      return fail(new InfrastructureError(`Gemini Vision execution failed: ${error.message}`));
    }
  }

  public async generateTextStream(
    prompt: string,
    options?: AIModelOptions
  ): Promise<Result<{ stream: AsyncIterable<any>; countTokens: (text: string) => Promise<number> }>> {
    const modelName = 'gemini-3.1-flash-lite';
    const model = this.getModel(modelName, options);

    try {
      const result = await model.generateContentStream(prompt);
      return ok({
        stream: result.stream,
        countTokens: async (text: string) => {
          const res = await model.countTokens(text);
          return res.totalTokens;
        }
      });
    } catch (error: any) {
      return fail(new InfrastructureError(`Gemini stream failed: ${error.message}`));
    }
  }
}
export default GeminiModelProvider;
