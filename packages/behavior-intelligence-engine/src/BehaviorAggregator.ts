import { 
  CarbonEntry, 
  BehaviorProfile, 
  BehaviorFeatureVector, 
  CarbonCategory 
} from '@carbonsense/shared-types';
import PatternDetector from './PatternDetector.js';
import TrendAnalyzer from './TrendAnalyzer.js';
import RiskScorer from './RiskScorer.js';
import BehaviorClassifier from './BehaviorClassifier.js';

export class BehaviorAggregator {
  private detector: PatternDetector;
  private analyzer: TrendAnalyzer;
  private scorer: RiskScorer;
  private classifier: BehaviorClassifier;

  constructor() {
    this.detector = new PatternDetector();
    this.analyzer = new TrendAnalyzer();
    this.scorer = new RiskScorer();
    this.classifier = new BehaviorClassifier();
  }

  /**
   * Assembles a comprehensive BehaviorProfile summarizing historical logs.
   */
  public aggregate(userId: string, entries: CarbonEntry[]): BehaviorProfile {
    const now = new Date();

    // 1. Calculate Feature Vector over 30-day sliding window
    const vector = this.computeFeatureVector(userId, entries, now);

    // 2. Detect Patterns (Signals)
    const signals = this.detector.detect(entries);

    // 3. Analyze Trends
    const trends = this.analyzer.analyze(entries);

    // 4. Calculate Risk Score
    const riskScoreResult = this.scorer.score(vector, signals, trends);

    // 5. Determine Classification
    const classResult = this.classifier.classify(vector);

    // 6. Map Dominant Behavior details
    const dominantBehavior = classResult.reasoning;

    return {
      userId,
      signals,
      trends,
      classification: classResult.classification,
      riskScore: riskScoreResult.score,
      featureVector: vector,
      generatedAt: now,
    };
  }

  private computeFeatureVector(userId: string, entries: CarbonEntry[], now: Date): BehaviorFeatureVector {
    // 30 days sliding window
    const cutoff30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const entries30d = entries.filter((e) => new Date(e.loggedAt) >= cutoff30d);

    // Group emissions by date string
    const dailyEmissions: Record<string, number> = {};
    const dailyCatEmissions: Record<CarbonCategory, number> = {
      transport: 0,
      food: 0,
      energy: 0,
      shopping: 0,
    };

    entries30d.forEach((e) => {
      const dateStr = new Date(e.loggedAt).toISOString().split('T')[0];
      dailyEmissions[dateStr] = (dailyEmissions[dateStr] || 0) + e.amountKg;
      if (dailyCatEmissions[e.category] !== undefined) {
        dailyCatEmissions[e.category] += e.amountKg;
      }
    });

    // We assume a full 30-day timeframe for the mean & std dev calculations
    const daysArray: number[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      daysArray.push(dailyEmissions[dateStr] || 0);
    }

    const totalEmissions30d = Object.values(dailyEmissions).reduce((sum, v) => sum + v, 0);

    // Daily Mean
    const dailyEmissionsMean = totalEmissions30d / 30;

    // Daily Standard Deviation
    const variance = daysArray.reduce((sum, val) => sum + Math.pow(val - dailyEmissionsMean, 2), 0) / 30;
    const dailyEmissionsStdDev = Math.sqrt(variance);

    // Category ratios
    const transportRatio = totalEmissions30d > 0 ? dailyCatEmissions.transport / totalEmissions30d : 0;
    const foodRatio = totalEmissions30d > 0 ? dailyCatEmissions.food / totalEmissions30d : 0;
    const energyRatio = totalEmissions30d > 0 ? dailyCatEmissions.energy / totalEmissions30d : 0;
    const shoppingRatio = totalEmissions30d > 0 ? dailyCatEmissions.shopping / totalEmissions30d : 0;

    // Weekly beef count (7 days)
    const cutoff7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyBeefCount = entries
      .filter((e) => new Date(e.loggedAt) >= cutoff7d && e.category === 'food' && e.subCategory.toLowerCase() === 'beef')
      .length;

    // Monthly flight count (30 days)
    const monthlyFlightCount = entries30d.filter(
      (e) => e.category === 'transport' && (e.subCategory.toLowerCase().includes('flight') || e.subCategory.toLowerCase() === 'flight_domestic' || e.subCategory.toLowerCase() === 'flight_intl')
    ).length;

    // Weekend multiplier
    const dailyWeekendEmissions: Record<string, number> = {};
    const dailyWeekdayEmissions: Record<string, number> = {};

    entries30d.forEach((e) => {
      const dateStr = new Date(e.loggedAt).toISOString().split('T')[0];
      const day = new Date(e.loggedAt).getDay();
      const isWeekend = day === 0 || day === 6;

      if (isWeekend) {
        dailyWeekendEmissions[dateStr] = (dailyWeekendEmissions[dateStr] || 0) + e.amountKg;
      } else {
        dailyWeekdayEmissions[dateStr] = (dailyWeekdayEmissions[dateStr] || 0) + e.amountKg;
      }
    });

    const weekendDays = Object.keys(dailyWeekendEmissions);
    const weekdayDays = Object.keys(dailyWeekdayEmissions);

    const weekendSum = Object.values(dailyWeekendEmissions).reduce((sum, v) => sum + v, 0);
    const weekdaySum = Object.values(dailyWeekdayEmissions).reduce((sum, v) => sum + v, 0);

    const weekendAvg = weekendDays.length > 0 ? weekendSum / weekendDays.length : 0;
    const weekdayAvg = weekdayDays.length > 0 ? weekdaySum / weekdayDays.length : 0;

    const weekendMultiplier = weekdayAvg > 0 ? weekendAvg / weekdayAvg : 1.0;

    return {
      userId,
      dailyEmissionsMean: parseFloat(dailyEmissionsMean.toFixed(4)),
      dailyEmissionsStdDev: parseFloat(dailyEmissionsStdDev.toFixed(4)),
      transportRatio: parseFloat(transportRatio.toFixed(4)),
      foodRatio: parseFloat(foodRatio.toFixed(4)),
      energyRatio: parseFloat(energyRatio.toFixed(4)),
      shoppingRatio: parseFloat(shoppingRatio.toFixed(4)),
      weeklyBeefCount,
      monthlyFlightCount,
      weekendMultiplier: parseFloat(weekendMultiplier.toFixed(4)),
    };
  }
}
export default BehaviorAggregator;
