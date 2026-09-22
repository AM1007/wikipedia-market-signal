import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { analyzeArticle } from "./analysis.js";
import { compareMarkets } from "./compare.js";
import { generateLineChartSvg } from "./chart.js";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;

  const arg = process.argv.find((value) =>
    value.startsWith(prefix),
  );

  return arg?.slice(prefix.length);
}

function parseTargets(value: string) {
  return value.split(",").map((item) => {
    const [label, project, article] = item.split("|");

    if (!label || !project || !article) {
      throw new Error(
        "Each target must have the format label|project|article",
      );
    }

    return {
      label,
      project,
      article,
    };
  });
}

async function ensureOutputDirectory(filePath: string) {
  const directory = dirname(filePath);

  if (directory === ".") {
    return;
  }

  await mkdir(directory, {
    recursive: true,
  });
}

async function main() {
  const project = getArg("project");
  const article = getArg("article");
  const targetsArg = getArg("targets");

  const monthsArg = getArg("months");
  const title = getArg("title") ?? "Wikipedia interest";
  const output = getArg("output") ?? "output/chart.svg";

  const months = monthsArg ? Number(monthsArg) : 12;

  if (!Number.isInteger(months) || months <= 0) {
    throw new Error("--months must be a positive integer");
  }

  let series;

  if (targetsArg) {
    const targets = parseTargets(targetsArg);

    const comparison = await compareMarkets({
      months,
      targets,
    });

    series = comparison.targets.map((target) => ({
      label: target.label,
      data: target.monthlyViews,
    }));
  } else {
    if (!project || !article) {
      throw new Error(
        "Provide either --targets or both --project and --article",
      );
    }

    const analysis = await analyzeArticle({
      project,
      article,
      months,
    });

    series = [
      {
        label: article,
        data: analysis.monthlyViews,
      },
    ];
  }

  const svg = generateLineChartSvg({
    title,
    series,
  });

  await ensureOutputDirectory(output);

  await writeFile(
    output,
    svg,
    "utf8",
  );

  console.log(
    JSON.stringify(
      {
        output,
        seriesCount: series.length,
        months,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});