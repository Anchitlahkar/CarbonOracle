import express from 'express';
import { providerRegistry } from '@carbonsense/ai-orchestration';
import { authMiddleware } from '../middleware/auth.js';
import { coachRateLimiter } from '../middleware/rateLimit.js';
import { getUserContextProfiles, getUserProfile } from '../services/profileService.js';
import CoachPromptBuilder from '../services/CoachPromptBuilder.js';
import { CostTracker } from '@carbonsense/ai-orchestration';
import '../services/geminiService.js'; // Force service registration

const router = express.Router();

interface Message {
  role: 'user' | 'model';
  content: string;
}

/**
 * GET /api/coach/context
 * Returns aggregated context profiles for debugging or custom UI renders.
 */
router.get('/context', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id || 'test-user-id';
    const context = getUserContextProfiles(userId);
    return res.status(200).json({ data: context, error: null });
  } catch (err: any) {
    console.error('[CoachRoute] Error fetching context:', err);
    return res.status(500).json({ data: null, error: 'Failed to retrieve coach context' });
  }
});

/**
 * POST /api/coach/chat
 * Streams coach advice with evidence tracing and API token metrics.
 */
router.post('/chat',
  authMiddleware,
  coachRateLimiter,
  async (req, res) => {
    const startTime = Date.now();
    const userId = req.user?.id || 'test-user-id';

    try {
      const { message, conversationHistory = [] } = req.body as {
        message: string;
        conversationHistory?: Message[];
      };

      if (!message) {
        return res.status(400).json({ data: null, error: 'Message is required' });
      }

      // 1. Fetch user profile and engine outputs
      const user = getUserProfile(userId);
      const contexts = getUserContextProfiles(userId);

      // 2. Build the system instruction, dynamic context, and evidence tracing lists
      const { systemInstruction, contextText, evidence } = CoachPromptBuilder.buildPrompt(
        user,
        contexts.behaviorProfile,
        contexts.forecastProfile,
        contexts.optimizationPlan,
        contexts.carbonDNAProfile,
        contexts.planetTwinProfile
      );

      // 3. Map conversation history
      const historyText = conversationHistory.map(m => {
        const roleName = m.role === 'user' ? 'User' : 'TERRA';
        return `${roleName}: ${m.content}`;
      }).join('\n');

      // 4. Construct final prompt
      const prompt = `System Instruction:\n${systemInstruction}\n\nContext:\n${contextText}\n\nHistory:\n${historyText}\n\nUser: ${message}\nTERRA:`;

      const provider = providerRegistry.get();

      // Configure SSE response headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      if (provider.generateTextStream) {
        const streamResult = await provider.generateTextStream(prompt);

        if (!streamResult.success) {
          res.write(`data: ${JSON.stringify({ error: streamResult.error.message })}\n\n`);
          res.end();
          return;
        }

        const { stream, countTokens } = streamResult.value;
        const promptTokens = await countTokens(prompt);
        let aggregatedText = '';

        for await (const chunk of stream) {
          const text = chunk.text();
          if (text) {
            aggregatedText += text;
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
          }
        }

        const completionTokens = await countTokens(aggregatedText);
        const latencyMs = Date.now() - startTime;

        const usageMetrics = CostTracker.calculateMetrics(
          provider.name,
          'gemini-1.5-flash',
          promptTokens,
          completionTokens,
          latencyMs
        );

        res.write(`data: ${JSON.stringify({ text: '', done: true, usageMetrics, evidence })}\n\n`);
        res.end();
      } else {
        // Fallback standard response for non-streaming providers
        const result = await provider.generateText(prompt);
        if (!result.success) {
          res.write(`data: ${JSON.stringify({ error: result.error.message })}\n\n`);
          res.end();
          return;
        }
        
        const { text, usageMetrics } = result.value;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        res.write(`data: ${JSON.stringify({ text: '', done: true, usageMetrics, evidence })}\n\n`);
        res.end();
      }
    } catch (err: any) {
      console.error('[CoachRoute] Chat error:', err);
      res.write(`data: ${JSON.stringify({ error: 'TERRA is temporarily overloaded. Please try again.' })}\n\n`);
      res.end();
    }
  }
);

export default router;
