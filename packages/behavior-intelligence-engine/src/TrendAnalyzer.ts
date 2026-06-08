import { CarbonEntry, BehaviorTrend, CarbonCategory } from '@carbonsense/shared-types';

export class TrendAnalyzer {
  /**
   * Computes behavior trends over specified sliding windows.
   */
  public analyze(entries: CarbonEntry[]): BehaviorTrend[] {
    const trends: BehaviorTrend[] = [];
    const now = new Date();

    const windows: Array<{ days: number; label: '7d' | '30d' | '90d' }> = [
      { days: 7, label: '7d' },
      { days: 30, label: '30d' },
      { days: 90, label: '90d' },
    ];

    windows.forEach((win) => {
      const halfDays = win.days / 2;
      const tNow = now.getTime();

      const secondHalfStart = new Date(tNow - halfDays * 24 * 60 * 60 * 1000);
      const firstHalfStart = new Date(tNow - win.days * 24 * 60 * 60 * 1000);

      // Filter entries
      const secondHalfEntries = entries.filter(
        (e) => new Date(e.loggedAt) >= secondHalfStart && new Date(e.loggedAt) <= now
      );
      const firstHalfEntries = entries.filter(
        (e) => new Date(e.loggedAt) >= firstHalfStart && new Date(e.loggedAt) < secondHalfStart
      );

      // Compute total emissions trends
      const totalSecond = secondHalfEntries.reduce((sum, e) => sum + e.amountKg, 0);
      const totalFirst = firstHalfEntries.reduce((sum, e) => sum + e.amountKg, 0);

      const totalTrend = this.calculateTrendSegment(
        totalFirst,
        totalSecond,
        'total_emissions',
        win.label,
        now
      );
      trends.push(totalTrend);

      // Compute category specific trends
      const categories: CarbonCategory[] = ['transport', 'food', 'energy', 'shopping'];
      categories.forEach((cat) => {
        const catSecond = secondHalfEntries.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amountKg, 0);
        const catFirst = firstHalfEntries.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amountKg, 0);

        if (catFirst > 0 || catSecond > 0) {
          const catTrend = this.calculateTrendSegment(
            catFirst,
            catSecond,
            `category_${cat}`,
            win.label,
            now
          );
          trends.push(catTrend);
        }
      });
    });

    return trends;
  }

  private calculateTrendSegment(
    firstHalfVal: number,
    secondHalfVal: number,
    type: string,
    window: '7d' | '30d' | '90d',
    generatedAt: Date
  ): BehaviorTrend {
    let changePercent = 0;
    if (firstHalfVal > 0) {
      changePercent = ((secondHalfVal - firstHalfVal) / firstHalfVal) * 100;
    } else if (secondHalfVal > 0) {
      changePercent = 100.0;
    }

    let direction: 'Increasing' | 'Decreasing' | 'Stable' = 'Stable';
    if (changePercent >= 5.0) {
      direction = 'Increasing';
    } else if (changePercent <= -5.0) {
      direction = 'Decreasing';
    }

    // Confidence metric represents density: e.g. base 0.90
    const confidence = 0.90;

    return {
      id: `trend-${type}-${window}-${generatedAt.getTime()}`,
      trendType: type,
      direction,
      changePercent: parseFloat(changePercent.toFixed(1)),
      confidence,
      timeWindow: window,
      generatedAt,
    };
  }
}
export default TrendAnalyzer;
