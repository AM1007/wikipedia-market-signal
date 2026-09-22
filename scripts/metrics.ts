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

  volatilityPct: number;

  outlierCount: number;
  outlierMonths: string[];

  outlierSharePct: number;
  signalQuality: SignalQuality;
};

export type SignalConsistency = "high" | "medium" | "low";

export type SignalQuality = "high" | "medium" | "low";

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

function standardDeviation(values: number[]): number {
  if (values.length === 0) {
    throw new Error(
      "Cannot calculate standard deviation of an empty array",
    );
  }

  const mean = average(values);

  const variance =
    values.reduce((sum, value) => {
      const difference = value - mean;

      return sum + difference * difference;
    }, 0) / values.length;

  return Math.sqrt(variance);
}

function percentile(
  values: number[],
  percentile: number,
): number {
  const sorted = [...values].sort((a, b) => a - b);

  const index = (sorted.length - 1) * percentile;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower]!;
  }

  const weight = index - lower;

  return (
    sorted[lower]! * (1 - weight) +
    sorted[upper]! * weight
  );
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

  const volatilityPct =
  (standardDeviation(views) / averageMonthlyViews) * 100;

  const q1 = percentile(views, 0.25);
  const q3 = percentile(views, 0.75);

  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  const outliers = monthlyViews.filter(
    (item) =>
      item.views < lowerBound ||
      item.views > upperBound,
  );

  const outlierCount = outliers.length;

  const outlierSharePct =
  (outlierCount / monthlyViews.length) * 100;
  
  const outlierMonths = outliers.map(
    (item) => item.month,
  );

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

  let signalQuality: SignalQuality;

  if (
    monthlyViews.length >= 12 &&
    signalConsistency === "high" &&
    volatilityPct <= 40 &&
    outlierSharePct <= 10
  ) {
    signalQuality = "high";
  } else if (
    monthlyViews.length >= 6 &&
    signalConsistency !== "low" &&
    volatilityPct <= 70 &&
    outlierSharePct <= 25
  ) {
    signalQuality = "medium";
  } else {
    signalQuality = "low";
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
    volatilityPct,
    outlierCount,
    outlierMonths,
    outlierSharePct,
    signalQuality,
  };
}