import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { chromium } from "playwright";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;

  const arg = process.argv.find((value) =>
    value.startsWith(prefix),
  );

  return arg?.slice(prefix.length);
}

async function ensureOutputDirectory(
  filePath: string,
): Promise<void> {
  const directory = dirname(filePath);

  if (directory === ".") {
    return;
  }

  await mkdir(directory, {
    recursive: true,
  });
}

async function waitForDocumentReady(
  page: import("playwright").Page,
): Promise<void> {
  /*
   * Wait for web fonts / system font resolution.
   *
   * This prevents a PDF from being captured while Chromium
   * is still calculating text metrics.
   */
  await page.evaluate(async () => {
    if ("fonts" in document) {
      await document.fonts.ready;
    }
  });

  /*
   * Give Chromium one extra rendering cycle after fonts
   * have settled.
   */
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            resolve();
          });
        });
      }),
  );
}

async function main(): Promise<void> {
  const input = getArg("input");

  const output =
    getArg("output") ??
    "output/report.pdf";

  if (!input) {
    throw new Error("--input is required");
  }

  const inputPath = resolve(input);
  const outputPath = resolve(output);

  await ensureOutputDirectory(outputPath);

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    /*
     * The viewport is mostly irrelevant to the final PDF
     * because print CSS uses millimetres, but keeping a
     * predictable desktop viewport prevents responsive
     * screen styles from producing unexpected layout
     * before print media is activated.
     */
    const page = await browser.newPage({
      viewport: {
        width: 1600,
        height: 1200,
      },

      deviceScaleFactor: 1,
    });

    /*
     * Explicitly enable @media print before loading /
     * rendering the report.
     */
    await page.emulateMedia({
      media: "print",
    });

    await page.goto(
      pathToFileURL(inputPath).href,
      {
        waitUntil: "networkidle",
      },
    );

    await waitForDocumentReady(page);

    /*
     * The page size and page breaks are primarily controlled
     * by the CSS:
     *
     * @page {
     *   size: A4 landscape;
     *   margin: 0;
     * }
     *
     * preferCSSPageSize makes Chromium respect that layout.
     */
    await page.pdf({
      path: outputPath,

      /*
       * These act as a safe fallback.
       * With preferCSSPageSize=true, the @page declaration
       * from report-html.ts takes priority.
       */
      format: "A4",
      landscape: true,

      printBackground: true,
      preferCSSPageSize: true,

      /*
       * Critical for our edge-to-edge A4 composition.
       * All visual whitespace is controlled inside
       * report-html.ts.
       */
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },

      /*
       * Keep physical dimensions predictable.
       */
      scale: 1,

      displayHeaderFooter: false,
    });
  } finally {
    await browser.close();
  }

  console.log(
    JSON.stringify(
      {
        input: inputPath,
        output: outputPath,
        format: "A4 landscape",
        pages: "controlled by CSS",
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error(error);

  process.exit(1);
});