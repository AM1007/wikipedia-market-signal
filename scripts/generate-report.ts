import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { ReportData } from "./report.js";
import { renderReportHtml } from "./report-html.js";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.find((value) => value.startsWith(prefix));

  return arg?.slice(prefix.length);
}

async function ensureOutputDirectory(filePath: string) {
  const directory = dirname(filePath);

  if (directory === ".") {
    return;
  }

  await mkdir(directory, { recursive: true });
}

function validateReportData(value: unknown): asserts value is ReportData {
  if (!value || typeof value !== "object") {
    throw new Error("Report input must be a JSON object");
  }

  const data = value as Partial<ReportData>;

  if (!data.title || typeof data.title !== "string") {
    throw new Error("Report input must contain a title");
  }

  if (!data.subtitle || typeof data.subtitle !== "string") {
    throw new Error("Report input must contain a subtitle");
  }

  if (!data.periodLabel || typeof data.periodLabel !== "string") {
    throw new Error("Report input must contain a periodLabel");
  }

  if (!Array.isArray(data.metrics)) {
    throw new Error("Report input must contain metrics");
  }

  if (!Array.isArray(data.sections)) {
    throw new Error("Report input must contain sections");
  }
}

async function main() {
  const input = getArg("input");
  const chart = getArg("chart");
  const output = getArg("output") ?? "output/report.html";

  if (!input) {
    throw new Error("--input is required");
  }

  const raw = await readFile(input, "utf8");
  const data: unknown = JSON.parse(raw);

  validateReportData(data);

  if (chart) {
    data.chartSvg = await readFile(chart, "utf8");
  }

  const html = renderReportHtml(data);

  await ensureOutputDirectory(output);
  await writeFile(output, html, "utf8");

  console.log(
    JSON.stringify(
      {
        input,
        output,
        metricsCount: data.metrics.length,
        sectionsCount: data.sections.length,
        hasChart: Boolean(data.chartSvg),
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