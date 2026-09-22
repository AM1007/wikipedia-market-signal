---
name: wikipedia-market-signal
description: Analyzes Wikipedia page-view trends across topics and language editions to help B2C product teams identify and compare audience interest. Use when a user wants to evaluate topic interest, compare languages or markets, analyze growth over time, assess signal reliability, or prepare a short research summary or shareable report.
---

# Wikipedia Market Signal

Analyze Wikipedia page-view data to help B2C product teams investigate audience interest across topics, languages, and time periods.

Write user-facing conclusions in Ukrainian unless the user explicitly requests another language.

## Workflow

1. Identify the user's:
   - topic;
   - Wikipedia language edition or editions;
   - analysis period;
   - decision or comparison goal.

2. Resolve the topic to real Wikipedia articles before analyzing page views.

   Use:

   ```bash
   npx tsx scripts/search-articles.ts \
     --project=<project> \
     --query=<topic>
   ```

   Do not invent article titles.

3. Select the article that best matches the user's intended topic.

   If several candidates represent materially different interpretations of the request, ask one concise clarification question.

4. For one article, run:

   ```bash
   npx tsx scripts/analyze.ts \
     --project=<project> \
     --article=<article> \
     --months=<months> \
     --format=json
   ```

5. For multiple markets or language editions, run:

   ```bash
   npx tsx scripts/compare-markets.ts \
     --months=<months> \
     --targets="<label>|<project>|<article>,..."
   ```

6. Use the returned JSON as the source of truth for all numeric claims.

   Do not calculate growth, volatility, trend, or signal quality manually.

7. Read `references/interpretation.md` before writing conclusions.

8. If a chart is useful, generate one from the same underlying analysis.

   For a single article:

   ```bash
   npx tsx scripts/generate-chart.ts \
     --project=<project> \
     --article=<article> \
     --months=<months> \
     --title="<title>" \
     --output=output/chart.svg
   ```

   For multiple markets or language editions:

   ```bash
   npx tsx scripts/generate-chart.ts \
     --months=<months> \
     --targets="<label>|<project>|<article>,..." \
     --title="<title>" \
     --output=output/comparison.svg
   ```

9. Explain assumptions, unusual observations, and limitations.

10. Never treat Wikipedia page views as proof of:
    - market demand;
    - purchase intent;
    - willingness to pay.

    Use them as a signal for deciding what should be researched next.

## Shareable report

When the user requests a shareable report, build it from the same analysis result used for the written conclusion.

Do not invent new metrics for the report.

1. Create a report JSON file with this structure:

   ```json
   {
     "title": "<Ukrainian report title>",
     "subtitle": "<short description of what the signal represents>",
     "periodLabel": "<human-readable period>",
     "metrics": [
       {
         "label": "<metric label>",
         "value": "<metric value>"
       }
     ],
     "sections": [
       {
         "heading": "<section heading>",
         "body": "<concise interpretation>"
       }
     ]
   }
   ```

2. Populate `metrics` only from values returned by the analysis or comparison tools.

3. Populate `sections` using `references/interpretation.md`.

   A useful default structure is:
   - main finding;
   - signal reliability;
   - unusual observations or outliers;
   - next validation step.

4. Generate the HTML report.

   With a chart:

   ```bash
   npx tsx scripts/generate-report.ts \
     --input=output/report.json \
     --chart=output/chart.svg \
     --output=output/report.html
   ```

   Without a chart, omit the `--chart` argument:

   ```bash
   npx tsx scripts/generate-report.ts \
     --input=output/report.json \
     --output=output/report.html
   ```

5. When a PDF is requested, generate it from the HTML report:

   ```bash
   npx tsx scripts/generate-pdf.ts \
     --input=output/report.html \
     --output=output/report.pdf
   ```

The PDF layout is intentionally optimized as a two-page A4 landscape report:

- page 1: title, period, key metrics, and chart;
- page 2: interpretation, limitations, next steps, and footer.

Treat files under `output/` as generated artifacts rather than source files.

## Follow-up requests

When the user changes a period, market, language, or article assumption:

- rerun only the affected analysis;
- preserve the same methodology;
- compare updated results against the previous assumption when useful;
- regenerate charts or reports from the updated analysis when needed.

Do not silently change the selected Wikipedia article.

## Output

Prefer a concise, decision-oriented response containing:

1. main finding;
2. key metrics;
3. signal quality and limitations;
4. recommended next validation step.

When requested, create a chart, HTML report, or PDF report from the same underlying analysis.

Keep user-facing report text concise and in Ukrainian unless the user explicitly requests another language.
