import "dotenv/config";

import { readFile } from "node:fs/promises";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is not configured");
}

async function main() {
  const skill = await readFile("SKILL.md", "utf8");
  const interpretation = await readFile(
    "references/interpretation.md",
    "utf8",
  );

  const analysisJson = {
    project: "uk.wikipedia.org",
    article: "Астрономія",
    period: {
      months: 12,
      start: "20250901",
      end: "20260831",
    },
    summary: {
      totalViews: 6708,
      averageMonthlyViews: 559,
      growthPct: -66,
      medianGrowthPct: -49.3,
      growthDisagreementPct: 16.7,
      signalConsistency: "medium",
      trendDirection: "down",
      trendSlopePctPerMonth: -11.95,
      volatilityPct: 61.8,
      outlierCount: 1,
      outlierMonths: ["202509"],
      outlierSharePct: 8.3,
      signalQuality: "medium",
    },
  };

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-luna",
        messages: [
          {
            role: "system",
            content: [
              skill,
              "",
              "# Interpretation reference",
              interpretation,
            ].join("\n"),
          },
          {
            role: "user",
            content: [
              "Підготуй короткий висновок для B2C founder.",
              "Використовуй лише наведені нижче дані.",
              "Не вигадуй причин змін трафіку.",
              "",
              JSON.stringify(analysisJson, null, 2),
            ].join("\n"),
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenRouter API error: ${response.status} ${response.statusText}\n${errorText}`,
    );
  }

  const data = (await response.json()) as {
    model?: string;
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  console.log("Model:", data.model ?? "unknown");
  console.log("");
  console.log(data.choices?.[0]?.message?.content ?? "");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});