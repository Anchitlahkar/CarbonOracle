import express from 'express';
import { providerRegistry } from '@carbonsense/ai-orchestration';
import { authMiddleware } from '../middleware/auth.js';
import { coachRateLimiter } from '../middleware/rateLimit.js';
import { getUserContextProfiles, getUserProfile } from '../services/profileService.js';
import CoachPromptBuilder from '../services/CoachPromptBuilder.js';
import CoachContextBuilder from '../services/CoachContextBuilder.js';
import { CostTracker } from '@carbonsense/ai-orchestration';
import { isApiKeyConfigured } from '../services/geminiService.js';

const router = express.Router();

interface Message {
  role: 'user' | 'model';
  content: string;
}

/**
 * Streams the offline intelligence mode response deterministically.
 */
async function streamOfflineMode(res: any, contexts: any) {
  const dna = contexts?.carbonDNAProfile;
  const optimization = contexts?.optimizationPlan;
  const twin = contexts?.planetTwinProfile;

  const category = dna?.primaryCategory || 'transport';
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  const ratio = Math.round((dna?.primaryEmissionsRatio || 0.50) * 100);

  let analysisSummary = `Your profile indicates transportation is a major contributor to emissions (contributing ${ratio}% of your footprint).`;
  let recommendedAction = 'Reduce weekly vehicle usage and prioritize lower-emission alternatives.';
  let expectedOutcome = 'Lower projected annual emissions and improved sustainability score.';

  if (category === 'food') {
    analysisSummary = `Your profile indicates food and dietary choices are a major contributor to emissions (contributing ${ratio}% of your footprint).`;
    recommendedAction = 'Transition to a plant-forward diet and reduce beef/meat consumption frequency.';
    expectedOutcome = 'Reduced daily food intensity and improved dietary health index.';
  } else if (category === 'energy') {
    analysisSummary = `Your profile indicates home energy consumption and utilities are a major contributor to emissions (contributing ${ratio}% of your footprint).`;
    recommendedAction = 'Improve residential energy usage, optimize heating/cooling, and use energy-efficient appliances.';
    expectedOutcome = 'Lower utility footprint and optimized home health score.';
  } else if (category === 'shopping') {
    analysisSummary = `Your profile indicates consumer product acquisitions are a major contributor to emissions (contributing ${ratio}% of your footprint).`;
    recommendedAction = 'Select sustainable, circular products and reduce single-use goods purchases.';
    expectedOutcome = 'Lower product lifecycle footprint and minimized waste.';
  }

  // Override with top candidate if present
  const candidates = optimization?.candidates || [];
  if (candidates.length > 0) {
    const topOpportunity = candidates[0];
    recommendedAction = `${topOpportunity.title}: ${topOpportunity.description}`;
    expectedOutcome = `Achieve an estimated savings of ${topOpportunity.estimatedSavingsKg} kg CO₂e through optimized behavioral changes.`;
  }

  const offlineText = `- **Recommendation**: ${recommendedAction}
- **Reasoning**: ${analysisSummary}
- **Expected impact**: ${expectedOutcome}
- **Next step**: Set up transport or energy limits in your cockpit cockpit actions and track changes daily.`;

  // Write text chunk to response
  res.write(`data: ${JSON.stringify({ text: offlineText })}\n\n`);

  // Build evidence blocks
  const evidence = contexts ? CoachContextBuilder.buildEvidence(
    contexts.behaviorProfile,
    contexts.forecastProfile,
    contexts.optimizationPlan,
    contexts.carbonDNAProfile,
    contexts.planetTwinProfile
  ) : [];

  res.write(`data: ${JSON.stringify({
    text: '',
    done: true,
    usageMetrics: {
      provider: 'local',
      model: 'offline',
      promptTokens: 0,
      completionTokens: 0,
      estimatedCostUsd: 0,
      latencyMs: 0
    },
    evidence
  })}\n\n`);
  res.end();
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
    const contexts = getUserContextProfiles(userId);

    // Setup SSE response headers immediately
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    try {
      const { message, conversationHistory = [] } = req.body as {
        message: string;
        conversationHistory?: Message[];
      };

      if (!message) {
        res.write(`data: ${JSON.stringify({ error: 'Message is required' })}\n\n`);
        res.end();
        return;
      }

      // Check if API key is missing or mock placeholder
      if (!isApiKeyConfigured()) {
        console.log('[CoachRoute] Gemini API key not configured. Fallback to Offline Mode.');
        await streamOfflineMode(res, contexts);
        return;
      }

      // 1. Fetch user profile and engine outputs
      const user = getUserProfile(userId);

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

      let provider;
      try {
        provider = providerRegistry.get();
      } catch (err) {
        console.error('[CoachRoute] Provider registry lookup failed:', err);
        await streamOfflineMode(res, contexts);
        return;
      }

      if (provider.generateTextStream) {
        const streamResult = await provider.generateTextStream(prompt);

        if (!streamResult.success) {
          console.error('[CoachRoute] generateTextStream failed:', streamResult.error.message);
          await streamOfflineMode(res, contexts);
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
          'gemini-3.1-flash-lite',
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
          console.error('[CoachRoute] generateText failed:', result.error.message);
          await streamOfflineMode(res, contexts);
          return;
        }
        
        const { text, usageMetrics } = result.value;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
        res.write(`data: ${JSON.stringify({ text: '', done: true, usageMetrics, evidence })}\n\n`);
        res.end();
      }
    } catch (err: any) {
      console.error('[CoachRoute] Unexpected runtime error in chat, falling back to Offline Mode:', err);
      try {
        await streamOfflineMode(res, contexts);
      } catch (innerErr) {
        console.error('[CoachRoute] Double fault inside offline mode fallback:', innerErr);
        if (!res.writableEnded) {
          res.end();
        }
      }
    }
  }
);

export default router;
