import { GeminiModelProvider, providerRegistry } from '@carbonsense/ai-orchestration';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || 'mock-api-key-for-development';
export const geminiProvider = new GeminiModelProvider(apiKey);

// Register Gemini as default model provider in our Provider Registry
providerRegistry.register(geminiProvider, true);

export default geminiProvider;
