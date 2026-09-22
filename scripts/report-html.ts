import type { ReportData } from "./report.js";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMetrics(
  metrics: ReportData["metrics"],
): string {
  if (metrics.length === 0) {
    return "";
  }

  return `
    <section
      class="metrics"
      aria-label="Ключові показники"
    >
      ${metrics
        .map(
          (metric, index) => `
            <div
              class="metric ${
                index === 0
                  ? "metric--primary"
                  : "metric--secondary"
              }"
            >
              <div class="metric-label">
                ${escapeHtml(metric.label)}
              </div>

              <div class="metric-value">
                ${escapeHtml(metric.value)}
              </div>
            </div>
          `,
        )
        .join("\n")}
    </section>
  `;
}

function renderSections(
  sections: ReportData["sections"],
): string {
  if (sections.length === 0) {
    return "";
  }

  return `
    <section
      class="insights"
      aria-label="Висновки звіту"
    >
      <div class="section-kicker">
        Аналіз
      </div>

      <div class="insights-grid">
        ${sections
          .map(
            (section, index) => `
              <article class="insight">
                <div class="insight-index">
                  ${String(index + 1).padStart(2, "0")}
                </div>

                <div class="insight-content">
                  <h2>
                    ${escapeHtml(section.heading)}
                  </h2>

                  <p>
                    ${escapeHtml(section.body)}
                  </p>
                </div>
              </article>
            `,
          )
          .join("\n")}
      </div>
    </section>
  `;
}

export function renderReportHtml(
  data: ReportData,
): string {
  const metricsHtml = renderMetrics(data.metrics);
  const sectionsHtml = renderSections(data.sections);

  const chartHtml = data.chartSvg
    ? `
      <section
        class="visual-section"
        aria-label="Візуалізація даних"
      >
        <div class="visual-header">
          <div>
            <div class="section-kicker">
              Динаміка
            </div>

            <h2 class="visual-title">
              Інтерес у часі
            </h2>
          </div>

          <div class="visual-caption">
            ${escapeHtml(data.periodLabel)}
          </div>
        </div>

        <div class="chart">
          ${data.chartSvg}
        </div>
      </section>
    `
    : "";

  return `<!doctype html>
<html lang="uk">
<head>
  <meta charset="utf-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />

  <meta
    name="color-scheme"
    content="light"
  />

  <title>${escapeHtml(data.title)}</title>

  <style>
    :root {
      --bg: #f5f5f7;
      --surface: #ffffff;

      --text: #1d1d1f;
      --text-secondary: #6e6e73;
      --text-tertiary: #86868b;

      --border: #e8e8ed;
      --border-soft: #f0f0f2;

      --accent: #ff3b30;

      --page-width: 1180px;

      --font-display:
        -apple-system,
        BlinkMacSystemFont,
        "SF Pro Display",
        "Helvetica Neue",
        Arial,
        sans-serif;

      --font-text:
        -apple-system,
        BlinkMacSystemFont,
        "SF Pro Text",
        "Helvetica Neue",
        Arial,
        sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    html {
      background: var(--bg);
      color: var(--text);

      font-family: var(--font-text);

      text-rendering: optimizeLegibility;

      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      margin: 0;
      min-height: 100vh;

      background:
        linear-gradient(
          180deg,
          #f8f8fa 0%,
          var(--bg) 320px
        );
    }

    /*
     * REPORT SURFACE
     */

    .page {
      width:
        min(
          var(--page-width),
          calc(100% - 48px)
        );

      margin:
        32px auto 64px;

      background:
        var(--surface);

      border-radius:
        32px;

      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.02),
        0 18px 60px rgba(0, 0, 0, 0.055);

      overflow:
        hidden;
    }

    .report-page-primary,
    .report-page-secondary {
      width: 100%;
    }

    /*
     * HERO
     */

    .hero {
      position: relative;

      padding:
        72px 72px 54px;

      border-bottom:
        1px solid var(--border-soft);
    }

    .hero::before {
      content: "";

      position: absolute;

      top: 72px;
      left: 0;

      width: 3px;
      height: 44px;

      border-radius:
        0 3px 3px 0;

      background:
        var(--accent);
    }

    .eyebrow {
      display:
        inline-flex;

      align-items:
        center;

      gap:
        9px;

      margin-bottom:
        26px;

      color:
        var(--text-tertiary);

      font-size:
        12px;

      font-weight:
        650;

      line-height:
        1;

      letter-spacing:
        0.085em;

      text-transform:
        uppercase;
    }

    .eyebrow-dot {
      width:
        6px;

      height:
        6px;

      flex:
        0 0 6px;

      border-radius:
        999px;

      background:
        var(--accent);
    }

    h1 {
      max-width:
        920px;

      margin:
        0;

      color:
        var(--text);

      font-family:
        var(--font-display);

      font-size:
        clamp(
          42px,
          5.4vw,
          72px
        );

      font-weight:
        720;

      line-height:
        0.98;

      letter-spacing:
        -0.052em;
    }

    .subtitle {
      max-width:
        780px;

      margin-top:
        26px;

      color:
        var(--text-secondary);

      font-family:
        var(--font-display);

      font-size:
        clamp(
          20px,
          2vw,
          27px
        );

      font-weight:
        420;

      line-height:
        1.34;

      letter-spacing:
        -0.022em;
    }

    .period {
      margin-top:
        28px;

      color:
        var(--text-tertiary);

      font-size:
        13px;

      font-weight:
        520;

      letter-spacing:
        0.01em;
    }

    /*
     * METRICS
     */

    .metrics {
      display:
        grid;

      grid-template-columns:
        minmax(260px, 1.65fr)
        repeat(3, minmax(150px, 1fr));

      margin:
        0;

      padding:
        0 72px;

      border-bottom:
        1px solid var(--border-soft);
    }

    .metric {
      min-width:
        0;

      padding:
        44px 28px 46px 0;
    }

    .metric + .metric {
      padding-left:
        28px;

      border-left:
        1px solid var(--border);
    }

    .metric-label {
      margin-bottom:
        11px;

      color:
        var(--text-tertiary);

      font-size:
        12px;

      font-weight:
        610;

      line-height:
        1.3;

      letter-spacing:
        0.055em;

      text-transform:
        uppercase;
    }

    .metric-value {
      color:
        var(--text);

      font-family:
        var(--font-display);

      font-weight:
        680;

      font-variant-numeric:
        tabular-nums;

      white-space:
        nowrap;
    }

    .metric--primary
    .metric-value {
      font-size:
        clamp(
          44px,
          4.5vw,
          64px
        );

      line-height:
        0.96;

      letter-spacing:
        -0.05em;
    }

    .metric--secondary
    .metric-value {
      font-size:
        clamp(
          25px,
          2.3vw,
          34px
        );

      line-height:
        1;

      letter-spacing:
        -0.035em;
    }

    /*
     * SECTION LABEL
     */

    .section-kicker {
      color:
        var(--accent);

      font-size:
        11px;

      font-weight:
        700;

      line-height:
        1;

      letter-spacing:
        0.1em;

      text-transform:
        uppercase;
    }

    /*
     * CHART
     */

    .visual-section {
      padding:
        64px 72px 70px;

      border-bottom:
        1px solid var(--border-soft);
    }

    .visual-header {
      display:
        flex;

      align-items:
        flex-end;

      justify-content:
        space-between;

      gap:
        32px;

      margin-bottom:
        30px;
    }

    .visual-title {
      margin:
        11px 0 0;

      color:
        var(--text);

      font-family:
        var(--font-display);

      font-size:
        30px;

      font-weight:
        650;

      line-height:
        1.1;

      letter-spacing:
        -0.035em;
    }

    .visual-caption {
      flex:
        0 0 auto;

      padding-bottom:
        3px;

      color:
        var(--text-tertiary);

      font-size:
        13px;

      font-weight:
        500;
    }

    .chart {
      width:
        100%;

      margin:
        0;

      overflow:
        hidden;
    }

    .chart svg {
      display:
        block;

      width:
        100%;

      height:
        auto;

      max-width:
        100%;
    }

    /*
     * INSIGHTS
     */

    .insights {
      padding:
        68px 72px 80px;
    }

    .insights-grid {
      display:
        grid;

      grid-template-columns:
        repeat(
          2,
          minmax(0, 1fr)
        );

      column-gap:
        72px;

      row-gap:
        0;

      margin-top:
        26px;
    }

    .insight {
      display:
        grid;

      grid-template-columns:
        36px minmax(0, 1fr);

      gap:
        18px;

      padding:
        30px 0 34px;

      border-top:
        1px solid var(--border);
    }

    .insight-index {
      padding-top:
        3px;

      color:
        #aeaeb2;

      font-size:
        11px;

      font-weight:
        650;

      font-variant-numeric:
        tabular-nums;

      letter-spacing:
        0.06em;
    }

    .insight-content {
      min-width:
        0;
    }

    .insight h2 {
      margin:
        0 0 13px;

      color:
        var(--text);

      font-family:
        var(--font-display);

      font-size:
        22px;

      font-weight:
        640;

      line-height:
        1.2;

      letter-spacing:
        -0.025em;
    }

    .insight p {
      margin:
        0;

      color:
        #424245;

      font-size:
        16px;

      font-weight:
        400;

      line-height:
        1.65;

      letter-spacing:
        -0.008em;
    }

    /*
     * FOOTER
     */

    .footer {
      display:
        flex;

      align-items:
        center;

      justify-content:
        space-between;

      gap:
        24px;

      padding:
        22px 72px 26px;

      border-top:
        1px solid var(--border-soft);

      color:
        var(--text-tertiary);

      font-size:
        11px;

      font-weight:
        500;
    }

    .footer-mark {
      display:
        flex;

      align-items:
        center;

      gap:
        8px;
    }

    .footer-dot {
      width:
        5px;

      height:
        5px;

      flex:
        0 0 5px;

      border-radius:
        50%;

      background:
        var(--accent);
    }

    /*
     * RESPONSIVE
     */

    @media (
      max-width: 900px
    ) {
      .page {
        width:
          min(
            100% - 28px,
            var(--page-width)
          );

        margin:
          14px auto 32px;

        border-radius:
          24px;
      }

      .hero {
        padding:
          52px 42px 42px;
      }

      .hero::before {
        top:
          52px;
      }

      .metrics {
        grid-template-columns:
          repeat(
            2,
            minmax(0, 1fr)
          );

        padding:
          0 42px;
      }

      .metric {
        padding:
          32px 24px 34px 0;
      }

      .metric + .metric {
        padding-left:
          24px;
      }

      .metric:nth-child(3) {
        padding-left:
          0;

        border-left:
          0;

        border-top:
          1px solid var(--border);
      }

      .metric:nth-child(4) {
        border-top:
          1px solid var(--border);
      }

      .visual-section,
      .insights {
        padding-left:
          42px;

        padding-right:
          42px;
      }

      .insights-grid {
        column-gap:
          42px;
      }

      .footer {
        padding-left:
          42px;

        padding-right:
          42px;
      }
    }

    @media (
      max-width: 640px
    ) {
      body {
        background:
          var(--surface);
      }

      .page {
        width:
          100%;

        margin:
          0;

        border-radius:
          0;

        box-shadow:
          none;
      }

      .hero {
        padding:
          42px 24px 34px;
      }

      .hero::before {
        top:
          42px;
      }

      .eyebrow {
        margin-bottom:
          20px;
      }

      h1 {
        font-size:
          41px;

        line-height:
          1.01;
      }

      .subtitle {
        margin-top:
          20px;

        font-size:
          20px;
      }

      .period {
        margin-top:
          22px;
      }

      .metrics {
        grid-template-columns:
          1fr 1fr;

        padding:
          0 24px;
      }

      .metric,
      .metric + .metric {
        padding:
          28px 18px 30px 0;
      }

      .metric:nth-child(even) {
        padding-left:
          18px;

        padding-right:
          0;

        border-left:
          1px solid var(--border);
      }

      .metric:nth-child(n + 3) {
        border-top:
          1px solid var(--border);
      }

      .metric--primary
      .metric-value {
        font-size:
          40px;
      }

      .metric--secondary
      .metric-value {
        font-size:
          25px;
      }

      .visual-section {
        padding:
          48px 24px 50px;
      }

      .visual-header {
        display:
          block;

        margin-bottom:
          24px;
      }

      .visual-title {
        font-size:
          26px;
      }

      .visual-caption {
        margin-top:
          10px;
      }

      .chart {
        margin-left:
          -8px;

        width:
          calc(100% + 16px);
      }

      .insights {
        padding:
          50px 24px 60px;
      }

      .insights-grid {
        grid-template-columns:
          1fr;

        margin-top:
          24px;
      }

      .insight {
        grid-template-columns:
          30px minmax(0, 1fr);

        gap:
          13px;

        padding:
          27px 0 30px;
      }

      .insight h2 {
        font-size:
          21px;
      }

      .insight p {
        font-size:
          15.5px;

        line-height:
          1.62;
      }

      .footer {
        display:
          block;

        padding:
          20px 24px 28px;
      }

      .footer-period {
        margin-top:
          8px;
      }
    }

    /*
     * ============================================================
     * PRINT / PDF
     *
     * PDF intentionally uses a different layout from the browser.
     *
     * PAGE 1:
     * Hero + metrics + chart
     *
     * PAGE 2:
     * Analysis + footer
     * ============================================================
     */

    @media print {
      @page {
        size:
          A4 landscape;

        margin:
          0;
      }

      html,
      body {
        width:
          297mm;

        margin:
          0;

        padding:
          0;

        background:
          #ffffff;
      }

      html {
        print-color-adjust:
          exact;

        -webkit-print-color-adjust:
          exact;
      }

      body {
        min-height:
          0;

        background:
          #ffffff;

        print-color-adjust:
          exact;

        -webkit-print-color-adjust:
          exact;
      }

      /*
       * Remove browser card styling.
       */

      .page {
        width:
          297mm;

        max-width:
          none;

        margin:
          0;

        padding:
          0;

        background:
          #ffffff;

        border-radius:
          0;

        box-shadow:
          none;

        overflow:
          visible;
      }

      /*
       * ----------------------------------------------------------
       * PAGE 1
       * ----------------------------------------------------------
       */

      .report-page-primary {
        width:
          297mm;

        height:
          210mm;

        display:
          flex;

        flex-direction:
          column;

        overflow:
          hidden;

        break-after:
          page;

        page-break-after:
          always;

        background:
          #ffffff;
      }

      /*
       * Compact hero for PDF.
       */

      .hero {
        flex:
          0 0 auto;

        padding:
          10mm 18mm 6mm;

        border-bottom:
          0;
      }

      .hero::before {
        top:
          15mm;

        left:
          0;

        width:
          0.7mm;

        height:
          9mm;

        border-radius:
          0 1mm 1mm 0;
      }

      .eyebrow {
        gap:
          2mm;

        margin-bottom:
          4mm;

        font-size:
          7pt;

        line-height:
          1;

        letter-spacing:
          0.09em;
      }

      .eyebrow-dot {
        width:
          1.4mm;

        height:
          1.4mm;

        flex-basis:
          1.4mm;
      }

      h1 {
        max-width:
          220mm;

        font-size:
          25pt;

        line-height:
          0.98;

        letter-spacing:
          -0.045em;
      }

      .subtitle {
        max-width:
          215mm;

        margin-top:
          3.5mm;

        font-size:
          10pt;

        line-height:
          1.28;

        letter-spacing:
          -0.015em;
      }

      .period {
        margin-top:
          3.5mm;

        font-size:
          7pt;

        line-height:
          1.2;
      }

      /*
       * Metrics stay compact and horizontal.
       */

      .metrics {
        flex:
          0 0 auto;

        grid-template-columns:
          1.45fr
          1fr
          1fr
          1fr;

        margin:
          0 18mm;

        padding:
          0;

        border-top:
          0.25mm solid var(--border);

        border-bottom:
          0.25mm solid var(--border);

        break-inside:
          avoid;

        page-break-inside:
          avoid;
      }

      .metric {
        padding:
          5mm 5mm 5.5mm 0;
      }

      .metric + .metric {
        padding-left:
          5mm;

        border-left:
          0.25mm solid var(--border);
      }

      .metric-label {
        margin-bottom:
          1.5mm;

        font-size:
          6.5pt;

        line-height:
          1.2;

        letter-spacing:
          0.05em;
      }

      .metric--primary
      .metric-value {
        font-size:
          23pt;

        line-height:
          0.95;
      }

      .metric--secondary
      .metric-value {
        font-size:
          15pt;

        line-height:
          1;
      }

      /*
       * Visualization consumes remaining page-1 space.
       */

      .visual-section {
        flex:
          1 1 auto;

        min-height:
          0;

        display:
          flex;

        flex-direction:
          column;

        padding:
          5.5mm 18mm 7mm;

        border-bottom:
          0;

        overflow:
          hidden;

        break-inside:
          avoid;

        page-break-inside:
          avoid;
      }

      .visual-header {
        flex:
          0 0 auto;

        gap:
          8mm;

        margin-bottom:
          3mm;
      }

      .section-kicker {
        font-size:
          6.5pt;

        letter-spacing:
          0.1em;
      }

      .visual-title {
        margin:
          1.8mm 0 0;

        font-size:
          14pt;

        line-height:
          1.05;

        letter-spacing:
          -0.025em;
      }

      .visual-caption {
        padding-bottom:
          0.5mm;

        font-size:
          6.5pt;
      }

      /*
       * Preserve SVG proportions.
       *
       * We intentionally make the chart slightly narrower in PDF.
       * This avoids the graph becoming excessively tall when
       * rendered from its original SVG aspect ratio.
       */

      .chart {
        flex:
          1 1 auto;

        min-height:
          0;

        display:
          flex;

        align-items:
          flex-start;

        justify-content:
          center;

        width:
          100%;

        margin:
          0;

        overflow:
          hidden;
      }

      .chart svg {
        display:
          block;

        width:
          198mm;

        max-width:
          100%;

        height:
          auto;

        max-height:
          105mm;

        margin:
          0 auto;
      }

      /*
       * ----------------------------------------------------------
       * PAGE 2
       * ----------------------------------------------------------
       */

      .report-page-secondary {
        width:
          297mm;

        height:
          210mm;

        display:
          flex;

        flex-direction:
          column;

        overflow:
          hidden;

        background:
          #ffffff;

        break-before:
          page;

        page-break-before:
          always;
      }

      .insights {
        flex:
          1 1 auto;

        min-height:
          0;

        padding:
          18mm 18mm 8mm;

        overflow:
          hidden;
      }

      .insights > .section-kicker {
        margin-bottom:
          7mm;
      }

      .insights-grid {
        display:
          grid;

        grid-template-columns:
          repeat(
            2,
            minmax(0, 1fr)
          );

        column-gap:
          16mm;

        row-gap:
          0;

        margin-top:
          0;
      }

      .insight {
        grid-template-columns:
          8mm minmax(0, 1fr);

        gap:
          4mm;

        padding:
          8mm 0 9mm;

        border-top:
          0.25mm solid var(--border);

        break-inside:
          avoid;

        page-break-inside:
          avoid;
      }

      .insight-index {
        padding-top:
          0.8mm;

        font-size:
          6.5pt;

        line-height:
          1.2;
      }

      .insight h2 {
        margin:
          0 0 2.5mm;

        font-size:
          14pt;

        line-height:
          1.15;

        letter-spacing:
          -0.02em;
      }

      .insight p {
        margin:
          0;

        font-size:
          9.5pt;

        line-height:
          1.5;

        letter-spacing:
          -0.005em;
      }

      /*
       * Footer is pinned visually to the bottom of page 2
       * because the secondary page is a flex column.
       */

      .footer {
        flex:
          0 0 auto;

        margin-top:
          auto;

        padding:
          4.5mm 18mm 6mm;

        border-top:
          0.25mm solid var(--border-soft);

        font-size:
          6.5pt;

        line-height:
          1.2;

        break-inside:
          avoid;

        page-break-inside:
          avoid;
      }

      .footer-mark {
        gap:
          2mm;
      }

      .footer-dot {
        width:
          1.2mm;

        height:
          1.2mm;

        flex-basis:
          1.2mm;
      }
    }
  </style>
</head>

<body>
  <main class="page">

    <div class="report-page-primary">

      <header class="hero">
        <div class="eyebrow">
          <span
            class="eyebrow-dot"
            aria-hidden="true"
          ></span>

          Аналітичний звіт
        </div>

        <h1>
          ${escapeHtml(data.title)}
        </h1>

        <div class="subtitle">
          ${escapeHtml(data.subtitle)}
        </div>

        <div class="period">
          ${escapeHtml(data.periodLabel)}
        </div>
      </header>

      ${metricsHtml}

      ${chartHtml}

    </div>

    <div class="report-page-secondary">

      ${sectionsHtml}

      <footer class="footer">
        <div class="footer-mark">
          <span
            class="footer-dot"
            aria-hidden="true"
          ></span>

          Згенерований аналітичний звіт
        </div>

        <div class="footer-period">
          ${escapeHtml(data.periodLabel)}
        </div>
      </footer>

    </div>

  </main>
</body>
</html>`;
}