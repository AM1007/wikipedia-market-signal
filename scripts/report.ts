import type { MonthlyView } from "./metrics.js";

export type ReportMetric = {
  label: string;
  value: string;
};

export type ReportSection = {
  heading: string;
  body: string;
};

export type ReportData = {
  title: string;
  subtitle: string;
  periodLabel: string;
  metrics: ReportMetric[];
  sections: ReportSection[];
  chartSvg?: string;
  monthlyViews?: MonthlyView[];
};