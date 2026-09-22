import { analyzeArticle } from "./analysis.js";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;

  const arg = process.argv.find((value) =>
    value.startsWith(prefix),
  );

  return arg?.slice(prefix.length);
}

async function main() {
  const project = getArg("project");
  const article = getArg("article");
  const monthsArg = getArg("months");
  const format = getArg("format") ?? "table";

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

  const result = await analyzeArticle({
    project,
    article,
    months,
  });

  if (format === "json") {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (format !== "table") {
    throw new Error(
      "--format must be either 'table' or 'json'",
    );
  }

  console.table(result.monthlyViews);

  console.log("\nSummary");
  console.table({
    totalViews: result.summary.totalViews,
    averageMonthlyViews: result.summary.averageMonthlyViews,

    growthPct: result.summary.growthPct,
    medianGrowthPct: result.summary.medianGrowthPct,
    growthDisagreementPct:
      result.summary.growthDisagreementPct,

    signalConsistency:
      result.summary.signalConsistency,

    trendDirection:
      result.summary.trendDirection,
    trendSlopePctPerMonth:
      result.summary.trendSlopePctPerMonth,

    volatilityPct:
      result.summary.volatilityPct,

    outlierCount:
      result.summary.outlierCount,
    outlierMonths:
      result.summary.outlierMonths.join(", ") || "none",
    outlierSharePct:
      result.summary.outlierSharePct,

    signalQuality:
      result.summary.signalQuality,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});