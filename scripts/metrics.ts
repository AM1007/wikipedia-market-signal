export type MonthlyView = {
  month: string;
  views: number;
};

export type ViewSummary = {
  totalViews: number;
  averageMonthlyViews: number;

  startAverageViews: number;
  endAverageViews: number;
  growthPct: number;

  startMedianViews: number;
  endMedianViews: number;
  medianGrowthPct: number;

  growthDisagreementPct: number;

  signalConsistency: SignalConsistency;

  trendSlope: number;
  trendDirection: "up" | "down" | "flat";

  trendSlopePctPerMonth: number;
};

export type SignalConsistency = "high" | "medium" | "low";

function average(values: number[]): number {
  if (values.length === 0) {
    throw new Error("Cannot calculate average of an empty array");
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error("Cannot calculate median of an empty array");
  }

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1]! + sorted[middle]!) / 2;
  }

  return sorted[middle]!;
}

function calculateTrendSlope(values: number[]): number {
  const n = values.length;

  const xMean = (n - 1) / 2;
  const yMean = average(values);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = i - xMean;
    const yDiff = values[i]! - yMean;

    numerator += xDiff * yDiff;
    denominator += xDiff * xDiff;
  }

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

export function summarizeViews(
  monthlyViews: MonthlyView[],
): ViewSummary {
  if (monthlyViews.length < 6) {
    throw new Error(
      "At least 6 months of data are required to calculate growth",
    );
  }

  const views = monthlyViews.map((item) => item.views);

  const totalViews = views.reduce(
    (sum, value) => sum + value,
    0,
  );

  const averageMonthlyViews = average(views);

  const startAverageViews = average(
    views.slice(0, 3),
  );

  const endAverageViews = average(
    views.slice(-3),
  );

  const growthPct =
    ((endAverageViews - startAverageViews) /
      startAverageViews) *
    100;

  const startMedianViews = median(
    views.slice(0, 3),
  );

  const endMedianViews = median(
    views.slice(-3),
  );

  const medianGrowthPct =
    ((endMedianViews - startMedianViews) /
      startMedianViews) *
    100;

  const growthDisagreementPct = Math.abs(
    growthPct - medianGrowthPct,
  );

  let signalConsistency: SignalConsistency;

  if (growthDisagreementPct <= 10) {
    signalConsistency = "high";
  } else if (growthDisagreementPct <= 25) {
    signalConsistency = "medium";
  } else {
    signalConsistency = "low";
  }

  const trendSlope = calculateTrendSlope(views);

  const trendSlopePctPerMonth =
    (trendSlope / averageMonthlyViews) * 100;

  let trendDirection: "up" | "down" | "flat";  

  if (trendSlope > 0) {
    trendDirection = "up";
  } else if (trendSlope < 0) {
    trendDirection = "down";
  } else {
    trendDirection = "flat";
  }



  return {
    totalViews,
    averageMonthlyViews,
    startAverageViews,
    endAverageViews,
    growthPct,
    startMedianViews,
    endMedianViews,
    medianGrowthPct,
    growthDisagreementPct,
    signalConsistency,
    trendSlope,
    trendDirection,
    trendSlopePctPerMonth,
  };
}