import { CarbonEntry, BehaviorSignal, BehaviorEvidence } from '@carbonsense/shared-types';
import { getBehaviorThresholds } from '@carbonsense/knowledge-base';

export class PatternDetector {
  private thresholds: Record<string, unknown>;

  constructor() {
    this.thresholds = getBehaviorThresholds();
  }

  /**
   * Evaluates a list of CarbonEntry objects to identify behavioral patterns.
   */
  public detect(entries: CarbonEntry[]): BehaviorSignal[] {
    const signals: BehaviorSignal[] = [];
    const now = new Date();

    // Helper filters for timeframes
    const filterByDays = (list: CarbonEntry[], days: number) => {
      const cutOff = new Date();
      cutOff.setDate(cutOff.getDate() - days);
      return list.filter((e) => new Date(e.loggedAt) >= cutOff);
    };

    const entries7d = filterByDays(entries, 7);
    const entries30d = filterByDays(entries, 30);

    // Calculate total emissions in intervals
    const totalEmissions30d = entries30d.reduce((sum, e) => sum + e.amountKg, 0);

    // 1. FrequentBeefConsumption (7-day window)
    const beefEntries = entries7d.filter(
      (e) => e.category === 'food' && e.subCategory.toLowerCase() === 'beef'
    );
    const beefCount = beefEntries.length;
    const beefThreshold = this.thresholds.beefConsumption.weeklyFrequencyThreshold;
    if (beefCount >= beefThreshold) {
      const beefEmissions = beefEntries.reduce((sum, e) => sum + e.amountKg, 0);
      const totalFoodEmissions7d = entries7d
        .filter((e) => e.category === 'food')
        .reduce((sum, e) => sum + e.amountKg, 0);
      const foodRatio = totalFoodEmissions7d > 0 ? beefEmissions / totalFoodEmissions7d : 0;

      const evidence: BehaviorEvidence = {
        quantity: parseFloat(beefEmissions.toFixed(2)),
        count: beefCount,
        ratio: parseFloat(foodRatio.toFixed(3)),
        timeframeDays: 7,
      };

      signals.push({
        id: `signal-beef-${now.getTime()}`,
        type: 'FrequentBeefConsumption',
        description: 'High frequency of beef consumption detected.',
        strength: parseFloat(Math.min(1.0, beefCount / 10).toFixed(2)),
        confidence: this.thresholds.beefConsumption.confidenceBase,
        reasoning: `User consumed beef ${beefCount} times over the last 7 days, exceeding the threshold of ${beefThreshold} times.`,
        evidence,
        detectedAt: now,
      });
    }

    // 2. HighCarDependency (30-day window)
    const transportEntries = entries30d.filter((e) => e.category === 'transport');
    const carEntries = transportEntries.filter((e) =>
      e.subCategory.toLowerCase().includes('car') || e.subCategory.toLowerCase() === 'car_petrol' || e.subCategory.toLowerCase() === 'car_electric'
    );
    const totalTransport = transportEntries.reduce((sum, e) => sum + e.amountKg, 0);
    const carEmissions = carEntries.reduce((sum, e) => sum + e.amountKg, 0);
    const carRatio = totalTransport > 0 ? (carEmissions / totalTransport) * 100 : 0;
    const carRatioThreshold = this.thresholds.carDependency.emissionsRatioThreshold;

    if (carRatio >= carRatioThreshold) {
      const evidence: BehaviorEvidence = {
        quantity: parseFloat(carEmissions.toFixed(2)),
        count: carEntries.length,
        ratio: parseFloat((carRatio / 100).toFixed(3)),
        timeframeDays: 30,
      };

      signals.push({
        id: `signal-car-${now.getTime()}`,
        type: 'HighCarDependency',
        description: 'Significant reliance on personal vehicle transit.',
        strength: parseFloat((carRatio / 100).toFixed(2)),
        confidence: this.thresholds.carDependency.confidenceBase,
        reasoning: `${carRatio.toFixed(1)}% of transport emissions originated from personal vehicle usage during the last 30 days, exceeding the limit of ${carRatioThreshold}%.`,
        evidence,
        detectedAt: now,
      });
    }

    // 3. WeekendEmissionSpike (30-day window)
    // Map daily emissions for weekend vs weekdays
    const dailyWeekendEmissions: Record<string, number> = {};
    const dailyWeekdayEmissions: Record<string, number> = {};

    entries30d.forEach((e) => {
      const dateStr = new Date(e.loggedAt).toISOString().split('T')[0];
      const day = new Date(e.loggedAt).getDay();
      const isWeekend = day === 0 || day === 6; // Sun = 0, Sat = 6

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

    const multiplier = weekdayAvg > 0 ? weekendAvg / weekdayAvg : 0;
    const spikeThreshold = this.thresholds.weekendSpike.ratioIncreaseThreshold;

    if (multiplier >= spikeThreshold) {
      const evidence: BehaviorEvidence = {
        quantity: parseFloat(weekendSum.toFixed(2)),
        count: weekendDays.length,
        ratio: parseFloat(multiplier.toFixed(3)),
        timeframeDays: 30,
      };

      signals.push({
        id: `signal-weekend-${now.getTime()}`,
        type: 'WeekendEmissionSpike',
        description: 'Daily emissions are significantly higher during weekends.',
        strength: parseFloat(Math.min(1.0, (weekendAvg - weekdayAvg) / (weekdayAvg || 1)).toFixed(2)),
        confidence: this.thresholds.weekendSpike.confidenceBase,
        reasoning: `Average daily weekend emissions (${weekendAvg.toFixed(1)} kg) were ${multiplier.toFixed(2)}x higher than weekday daily emissions (${weekdayAvg.toFixed(1)} kg).`,
        evidence,
        detectedAt: now,
      });
    }

    // 4. ShoppingHeavyBehavior (30-day ratio or 7-day count)
    const shoppingEntries30d = entries30d.filter((e) => e.category === 'shopping');
    const shoppingEntries7d = entries7d.filter((e) => e.category === 'shopping');

    const shoppingEmissions30d = shoppingEntries30d.reduce((sum, e) => sum + e.amountKg, 0);
    const shoppingRatio = totalEmissions30d > 0 ? (shoppingEmissions30d / totalEmissions30d) * 100 : 0;

    const shoppingCount7d = shoppingEntries7d.length;

    const shoppingFreqThreshold = this.thresholds.shoppingHeavy.weeklyFrequencyThreshold;
    const shoppingRatioThreshold = this.thresholds.shoppingHeavy.emissionsRatioThreshold;

    if (shoppingRatio >= shoppingRatioThreshold || shoppingCount7d >= shoppingFreqThreshold) {
      const evidence: BehaviorEvidence = {
        quantity: parseFloat(shoppingEmissions30d.toFixed(2)),
        count: shoppingCount7d,
        ratio: parseFloat((shoppingRatio / 100).toFixed(3)),
        timeframeDays: 30,
      };

      signals.push({
        id: `signal-shopping-${now.getTime()}`,
        type: 'ShoppingHeavyBehavior',
        description: 'Frequent shopping or high carbon footprint from consumer acquisitions.',
        strength: parseFloat(Math.max(shoppingRatio / 100, shoppingCount7d / 10).toFixed(2)),
        confidence: this.thresholds.shoppingHeavy.confidenceBase,
        reasoning: `Shopping activities accounted for ${shoppingRatio.toFixed(1)}% of total emissions, or occurred ${shoppingCount7d} times per week.`,
        evidence,
        detectedAt: now,
      });
    }

    // 5. HighFlightFrequency (30-day window)
    const flightEntries = entries30d.filter(
      (e) => e.category === 'transport' && (e.subCategory.toLowerCase().includes('flight') || e.subCategory.toLowerCase() === 'flight_domestic' || e.subCategory.toLowerCase() === 'flight_intl')
    );
    const flightCount = flightEntries.length;
    const flightThreshold = this.thresholds.flightFrequency.monthlyFrequencyThreshold;

    if (flightCount >= flightThreshold) {
      const flightEmissions = flightEntries.reduce((sum, e) => sum + e.amountKg, 0);
      const flightRatio = totalEmissions30d > 0 ? flightEmissions / totalEmissions30d : 0;

      const evidence: BehaviorEvidence = {
        quantity: parseFloat(flightEmissions.toFixed(2)),
        count: flightCount,
        ratio: parseFloat(flightRatio.toFixed(3)),
        timeframeDays: 30,
      };

      signals.push({
        id: `signal-flights-${now.getTime()}`,
        type: 'HighFlightFrequency',
        description: 'Elevated emissions due to repeated air travel.',
        strength: parseFloat(Math.min(1.0, flightCount / 3).toFixed(2)),
        confidence: this.thresholds.flightFrequency.confidenceBase,
        reasoning: `User took ${flightCount} flights during the last 30 days, exceeding the threshold of ${flightThreshold} flight.`,
        evidence,
        detectedAt: now,
      });
    }

    return signals;
  }
}
export default PatternDetector;
