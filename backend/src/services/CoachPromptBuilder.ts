import { 
  UserProfile, 
  BehaviorProfile, 
  ForecastProfile, 
  OptimizationPlan, 
  CarbonDNAProfile, 
  PlanetTwinProfile,
  CoachEvidenceBlock 
} from '@carbonsense/shared-types';
import { PromptManager } from '@carbonsense/ai-orchestration';
import CoachContextBuilder from './CoachContextBuilder.js';

/**
 * Constructs the compiled context text and system instructions for the LLM.
 * Hardened to support offline intelligence mode execution.
 */
export class CoachPromptBuilder {
  /**
   * Constructs the compiled context text and system instructions for the LLM.
   */
  public static buildPrompt(
    user: UserProfile,
    behavior: BehaviorProfile,
    forecast: ForecastProfile,
    optimization: OptimizationPlan,
    dna: CarbonDNAProfile,
    twin: PlanetTwinProfile
  ): { systemInstruction: string; contextText: string; evidence: CoachEvidenceBlock[] } {
    // 1. Gather evidence blocks
    const evidence = CoachContextBuilder.buildEvidence(behavior, forecast, optimization, dna, twin);

    // Format evidence blocks into string list
    const evidenceBlocksText = evidence.length > 0
      ? evidence.map((e: CoachEvidenceBlock, i: number) => {
          return `${i + 1}. [${e.source}] ${e.metric}: ${e.value} (Confidence: ${(e.confidence * 100).toFixed(0)}%)`;
        }).join('\n')
      : 'No verified engine logs are currently available.';

    const snapshots = forecast?.baseline?.['30d']?.snapshots || [];
    const baselineEmission = snapshots.length > 0 ? snapshots[snapshots.length - 1].projectedEmission : 0;

    const optSnapshots = forecast?.trendAdjusted?.['30d']?.snapshots || [];
    const optimizedEmission = optSnapshots.length > 0 ? optSnapshots[optSnapshots.length - 1].projectedEmission : 0;

    // 2. Load and compile coach-context template
    const contextVariables = {
      userId: user.id,
      isOnboarded: user.isOnboarded,
      targetReductionGoal: user.targetReductionGoal || 0,
      evidenceBlocks: evidenceBlocksText,
      dnaArchetype: dna?.archetype || 'N/A',
      dnaConfidence: dna?.archetypeConfidence || 0,
      dimEmissions: dna?.dimensions?.emissionIntensity || 0,
      dimVolatility: dna?.dimensions?.behaviorVolatility || 0,
      dimReadiness: dna?.dimensions?.optimizationReadiness || 0,
      dimReliability: dna?.dimensions?.forecastReliability || 0,
      currentWorldPhi: twin?.currentWorld?.healthIndex?.score || 0,
      optimizedWorldPhi: twin?.optimizedWorld?.healthIndex?.score || 0,
      divergenceScore: twin?.worldDivergence?.divergenceScore || 0,
      emissionsGapKg: twin?.worldDivergence?.emissionsGapKg || 0,
      behaviorClassification: behavior?.classification || 'Balanced',
      behaviorRiskScore: behavior?.riskScore || 0,
      behaviorSignals: behavior?.signals?.map(s => s.description).join(', ') || 'None',
      forecast30dBaseline: baselineEmission.toFixed(1),
      forecast30dOptimized: optimizedEmission.toFixed(1),
      emissionsDrivers: forecast?.riskDrivers?.map(d => `${d.driver} (${d.contribution}%)`).join(', ') || 'None'
    };

    const contextCompilation = PromptManager.compilePrompt('coach-context', contextVariables);

    // 3. Load coach-system prompt and coach-rules
    const systemPromptResult = PromptManager.compilePrompt('coach-system', {});
    const rulesResult = PromptManager.compilePrompt('coach-rules', {});

    // Combine system prompt and safety rules into systemInstruction
    const systemInstruction = `${systemPromptResult.template}\n\n${rulesResult.template}`;

    return {
      systemInstruction,
      contextText: contextCompilation.template,
      evidence
    };
  }
}
export default CoachPromptBuilder;
