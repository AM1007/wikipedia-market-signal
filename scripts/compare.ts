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

  return {
    months,
    targets: results,
  };
}