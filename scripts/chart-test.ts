import { writeFile } from "node:fs/promises";
import { analyzeArticle } from "./analysis.js";
import { generateLineChartSvg } from "./chart.js";

async function main() {
  const [poland, ukraine] = await Promise.all([
    analyzeArticle({
      project: "pl.wikipedia.org",
      article: "Astronomia",
      months: 12,
    }),
    analyzeArticle({
      project: "uk.wikipedia.org",
      article: "Астрономія",
      months: 12,
    }),
  ]);

  const svg = generateLineChartSvg({
    title: "Astronomy interest — Poland vs Ukraine",
    series: [
      {
        label: "Poland",
        data: poland.monthlyViews,
      },
      {
        label: "Ukraine",
        data: ukraine.monthlyViews,
      },
    ],
  });

  await writeFile(
    "astronomy-comparison.svg",
    svg,
    "utf8",
  );

  console.log("Created astronomy-comparison.svg");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});