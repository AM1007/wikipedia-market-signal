import { analyzeArticle } from "./analysis.js";

export type ComparisonTarget = {
  label: string;
  project: string;
  article: string;
};

export type CompareMarketsParams = {
  months: number;
  targets: ComparisonTarget[];
};

export async function compareMarkets({
  months,
  targets,
}: CompareMarketsParams) {
  if (targets.length < 2) {
    throw new Error(
      "At least two targets are required for comparison",
    );
  }

  const results = await Promise.all(
    targets.map(async (target) => {
      const analysis = await analyzeArticle({
        project: target.project,
        article: target.article,
        months,
      });

      return {
        label: target.label,
        ...analysis,
      };
    }),
  );

  const comparison = results.map((result) => ({
    label: result.label,
    averageMonthlyViews: result.summary.averageMonthlyViews,
    growthPct: result.summary.growthPct,
    medianGrowthPct: result.summary.medianGrowthPct,
    trendDirection: result.summary.trendDirection,
    trendSlopePctPerMonth: result.summary.trendSlopePctPerMonth,
    volatilityPct: result.summary.volatilityPct,
    signalQuality: result.summary.signalQuality,
  }));

  return {
    months,
    comparison,
    targets: results,
  };
}