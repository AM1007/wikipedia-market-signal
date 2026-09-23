import { mkdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

import { analyzeArticle } from "./analysis.js";
import type { ReportData } from "./report.js";

const outputDirectory = resolve("output/artifact-eval");

const reportJsonPath = resolve(
  outputDirectory,
  "report.json",
);

const chartPath = resolve(
  outputDirectory,
  "astronomy-ukraine.svg",
);

const htmlPath = resolve(
  outputDirectory,
  "report.html",
);

const pdfPath = resolve(
  outputDirectory,
  "report.pdf",
);

function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value
    .toFixed(1)
    .replace(".", ",")}%`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 1,
  }).format(value);
}

function qualityLabel(
  value: "high" | "medium" | "low",
): string {
  if (value === "high") {
    return "висока";
  }

  if (value === "medium") {
    return "середня";
  }

  return "низька";
}

function consistencyLabel(
  value: "high" | "medium" | "low",
): string {
  if (value === "high") {
    return "висока";
  }

  if (value === "medium") {
    return "середня";
  }

  return "низька";
}

function runCli(
  script: string,
  args: string[],
): Promise<void> {
  const tsxCli = resolve(
    "node_modules/tsx/dist/cli.mjs",
  );

  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      process.execPath,
      [
        tsxCli,
        script,
        ...args,
      ],
      {
        stdio: "inherit",
      },
    );

    child.on("error", reject);

    child.on("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }

      reject(
        new Error(
          `${script} exited with code ${code}`,
        ),
      );
    });
  });
}

async function assertArtifact(
  filePath: string,
): Promise<void> {
  const info = await stat(filePath);

  if (!info.isFile() || info.size === 0) {
    throw new Error(
      `Artifact is missing or empty: ${filePath}`,
    );
  }

  console.log(
    `Verified: ${filePath} (${info.size} bytes)`,
  );
}

async function main() {
  await mkdir(outputDirectory, {
    recursive: true,
  });

  console.log(
    "\n=== Analyze real Wikimedia data ===",
  );

  const analysis = await analyzeArticle({
    project: "uk.wikipedia.org",
    article: "Астрономія",
    months: 12,
  });

  const { summary } = analysis;

  function formatPeriodLabel(
    start: string,
    end: string,
  ): string {
    const formatMonth = (value: string) => {
      const year = Number(value.slice(0, 4));
      const month = Number(value.slice(4, 6));

      return new Intl.DateTimeFormat("uk-UA", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(
        new Date(Date.UTC(year, month - 1, 1)),
      );
    };

    return `${formatMonth(start)} — ${formatMonth(end)}`;
  }

  const periodLabel = formatPeriodLabel(
    analysis.period.start,
    analysis.period.end,
  );

  const reportData: ReportData = {
    title:
      "Інтерес до астрономії в українській Вікіпедії",

    subtitle:
      "Сигнал за переглядами статті «Астрономія» за останні 12 завершених місяців",

    periodLabel,

    metrics: [
      {
        label: "Середньомісячні перегляди",
        value: formatNumber(
          summary.averageMonthlyViews,
        ),
      },
      {
        label:
          "Зміна між початком і кінцем періоду",
        value: formatPercent(
          summary.growthPct,
        ),
      },
      {
        label: "Медіанна зміна",
        value: formatPercent(
          summary.medianGrowthPct,
        ),
      },
      {
        label: "Якість сигналу",
        value: qualityLabel(
          summary.signalQuality,
        ),
      },
    ],

    sections: [
      {
        heading: "Основний висновок",
        body:
          "Загальний тренд переглядів статті був низхідним. " +
          `Зміна між початком і кінцем періоду становила ${formatPercent(summary.growthPct)}, ` +
          `а медіанна зміна — ${formatPercent(summary.medianGrowthPct)}.`,
      },
      {
        heading: "Надійність сигналу",
        body:
          `Узгодженість оцінок — ${consistencyLabel(summary.signalConsistency)}, ` +
          `волатильність — ${formatPercent(summary.volatilityPct)}. ` +
          `Якість сигналу оцінена як ${qualityLabel(summary.signalQuality)}.`,
      },
      {
        heading: "Нетипові спостереження",
        body:
          summary.outlierCount > 0
            ? `Виявлено ${summary.outlierCount} нетипове спостереження: ${summary.outlierMonths.join(", ")}. Воно не видаляється автоматично й не вважається помилкою без додаткової перевірки.`
            : "Нетипових місяців за використаною евристикою не виявлено.",
      },
      {
        heading: "Що перевірити далі",
        body:
          "Перегляди Вікіпедії не доводять ринковий попит або готовність платити. Наступний крок — перевірити суміжні теми, пошуковий інтерес і поведінку користувачів через лендинг або інший продуктовий експеримент.",
      },
    ],
  };

  await writeFile(
    reportJsonPath,
    JSON.stringify(reportData, null, 2),
    "utf8",
  );

  console.log(
    "\n=== Generate SVG chart ===",
  );

  await runCli(
    "scripts/generate-chart.ts",
    [
      "--project=uk.wikipedia.org",
      "--article=Астрономія",
      "--months=12",
      "--title=Інтерес до астрономії — українська Вікіпедія",
      `--output=${chartPath}`,
    ],
  );

  console.log(
    "\n=== Generate HTML report ===",
  );

  await runCli(
    "scripts/generate-report.ts",
    [
      `--input=${reportJsonPath}`,
      `--chart=${chartPath}`,
      `--output=${htmlPath}`,
    ],
  );

  console.log(
    "\n=== Generate PDF report ===",
  );

  await runCli(
    "scripts/generate-pdf.ts",
    [
      `--input=${htmlPath}`,
      `--output=${pdfPath}`,
    ],
  );

  console.log(
    "\n=== Verify generated artifacts ===",
  );

  await assertArtifact(reportJsonPath);
  await assertArtifact(chartPath);
  await assertArtifact(htmlPath);
  await assertArtifact(pdfPath);

  console.log(
    "\nArtifact evaluation completed successfully.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});