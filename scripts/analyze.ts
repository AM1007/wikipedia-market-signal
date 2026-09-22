import { getCompletedMonthRange } from "./dates.js";
import { summarizeViews, type MonthlyView } from "./metrics.js";
import { getPageviews } from "./wikipedia.js";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;

  const arg = process.argv.find((value) => value.startsWith(prefix));

  return arg?.slice(prefix.length);
}

async function main() {
  const project = getArg("project");
  const article = getArg("article");
  const monthsArg = getArg("months");

  if (!project) {
    throw new Error(
      "Missing required argument: --project=<wikipedia-project>",
    );
  }

  if (!article) {
    throw new Error(
      "Missing required argument: --article=<article-title>",
    );
  }

  const months = monthsArg ? Number(monthsArg) : 12;

  if (!Number.isInteger(months) || months <= 0) {
    throw new Error("--months must be a positive integer");
  }

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

  console.table(monthlyViews);

  console.log("\nSummary");
  console.table({
    totalViews: Math.round(summary.totalViews),
    averageMonthlyViews: Math.round(summary.averageMonthlyViews),

    startAverageViews: Math.round(summary.startAverageViews),
    endAverageViews: Math.round(summary.endAverageViews),
    growthPct: Number(summary.growthPct.toFixed(1)),

    startMedianViews: Math.round(summary.startMedianViews),
    endMedianViews: Math.round(summary.endMedianViews),
    medianGrowthPct: Number(summary.medianGrowthPct.toFixed(1)),

    growthDisagreementPct: Number(
      summary.growthDisagreementPct.toFixed(1)
    ),
    
    signalConsistency: summary.signalConsistency,

    trendSlope: Number(summary.trendSlope.toFixed(1)),
    trendDirection: summary.trendDirection,
    trendSlopePctPerMonth: Number(
      summary.trendSlopePctPerMonth.toFixed(2),
    ),
    volatilityPct: Number(
      summary.volatilityPct.toFixed(1),
    ),

    outlierCount: summary.outlierCount,
    outlierMonths: summary.outlierMonths.join(", ") || "none",

    outlierSharePct: Number(
      summary.outlierSharePct.toFixed(1),
    ),

    signalQuality: summary.signalQuality,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});