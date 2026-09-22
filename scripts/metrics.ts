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
  };
}