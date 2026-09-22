import { getCompletedMonthRange } from "./dates.js";
import {
  summarizeViews,
  type MonthlyView,
} from "./metrics.js";
import { getPageviews } from "./wikipedia.js";

export type AnalyzeArticleParams = {
  project: string;
  article: string;
  months: number;
};

export async function analyzeArticle({
  project,
  article,
  months,
}: AnalyzeArticleParams) {
  const range = getCompletedMonthRange(months);

  const items = await getPageviews({
    project,
    article,
    start: range.start,
    end: range.end,
  });

  const monthlyViews: MonthlyView[] = items.map((item) => ({
    month: item.timestamp.slice(0, 6),
    views: item.views,
  }));

  const summary = summarizeViews(monthlyViews);

  return {
    project,
    article,
    period: {
      months,
      start: range.start,
      end: range.end,
    },
    monthlyViews,
    summary: {
      totalViews: summary.totalViews,
      averageMonthlyViews: Number(
        summary.averageMonthlyViews.toFixed(1),
      ),

      growthPct: Number(
        summary.growthPct.toFixed(1),
      ),
      medianGrowthPct: Number(
        summary.medianGrowthPct.toFixed(1),
      ),
      growthDisagreementPct: Number(
        summary.growthDisagreementPct.toFixed(1),
      ),

      signalConsistency: summary.signalConsistency,

      trendDirection: summary.trendDirection,
      trendSlopePctPerMonth: Number(
        summary.trendSlopePctPerMonth.toFixed(2),
      ),

      volatilityPct: Number(
        summary.volatilityPct.toFixed(1),
      ),

      outlierCount: summary.outlierCount,
      outlierMonths: summary.outlierMonths,
      outlierSharePct: Number(
        summary.outlierSharePct.toFixed(1),
      ),

      signalQuality: summary.signalQuality,
    },
  };
}