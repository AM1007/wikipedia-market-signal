import type { MonthlyView } from "./metrics.js";

export type ChartSeries = {
  label: string;
  data: MonthlyView[];
};

export type GenerateChartParams = {
  title: string;
  series: ChartSeries[];
  locale?: string;
  subtitle?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
};

const COLORS = [
  "#FF3B30", // Apple red
  "#007AFF", // Apple blue
  "#34C759", // Apple green
  "#AF52DE", // Apple purple
  "#FF9500", // Apple orange
];

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function formatMonth(
  month: string,
  locale: string,
): string {
  const normalized = String(month).replace("-", "");

  if (!/^\d{6}$/.test(normalized)) {
    return month;
  }

  const year = Number(normalized.slice(0, 4));
  const monthIndex = Number(normalized.slice(4, 6)) - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    return month;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex, 1)));
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

function getNiceScale(maxValue: number) {
  if (maxValue <= 0) {
    return {
      max: 100,
      step: 20,
    };
  }

  const roughStep = maxValue / 6;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;

  let niceNormalized: number;

  if (normalized <= 1) {
    niceNormalized = 1;
  } else if (normalized <= 2) {
    niceNormalized = 2;
  } else if (normalized <= 2.5) {
    niceNormalized = 2.5;
  } else if (normalized <= 5) {
    niceNormalized = 5;
  } else {
    niceNormalized = 10;
  }

  const step = niceNormalized * magnitude;
  const max = Math.ceil(maxValue / step) * step;

  return {
    max,
    step,
  };
}

  export function generateLineChartSvg({
    title,
    series,
    locale = "uk-UA",
    subtitle = "Щомісячні перегляди сторінки",
    xAxisLabel = "Дата",
    yAxisLabel = "Перегляди",
  }: GenerateChartParams): string {
  const width = 1200;
  const height = 680;

  const padding = {
    top: 150,
    right: 56,
    bottom: 100,
    left: 105,
  };

  if (series.length === 0) {
    throw new Error("At least one chart series is required");
  }

  const allPoints = series.flatMap((item) => item.data);

  if (allPoints.length === 0) {
    throw new Error("Chart series must contain data");
  }

  const allValues = allPoints.map((point) => point.views);
  const rawMaxViews = Math.max(...allValues);

  const yMin = 0;
  const { max: yMax, step: yStep } = getNiceScale(rawMaxViews);

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const months = series[0]!.data.map((point) => point.month);

  const xStep =
    months.length > 1
      ? chartWidth / (months.length - 1)
      : 0;

  const getX = (index: number) =>
    padding.left + index * xStep;

  const getY = (views: number) =>
    padding.top +
    chartHeight -
    ((views - yMin) / (yMax - yMin)) * chartHeight;

  const yTicks: number[] = [];

  for (let value = yMin; value <= yMax; value += yStep) {
    yTicks.push(value);
  }

  const horizontalGrid = yTicks
    .map((value) => {
      const y = getY(value);

      return `
        <line
          x1="${padding.left}"
          y1="${y}"
          x2="${width - padding.right}"
          y2="${y}"
          stroke="#E5E5EA"
          stroke-width="1"
        />

        <text
          x="${padding.left - 18}"
          y="${y + 5}"
          text-anchor="end"
          fill="#86868B"
          font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
          font-size="14"
          font-weight="400"
        >
          ${formatNumber(value)}
        </text>
      `;
    })
    .join("\n");

  const verticalGrid = months
    .map((_, index) => {
      const x = getX(index);

      return `
        <line
          x1="${x}"
          y1="${padding.top}"
          x2="${x}"
          y2="${height - padding.bottom}"
          stroke="#F0F0F2"
          stroke-width="1"
        />
      `;
    })
    .join("\n");

  const xLabels = months
    .map((month, index) => {
      const x = getX(index);

      return `
        <text
          x="${x}"
          y="${height - padding.bottom + 38}"
          text-anchor="middle"
          fill="#6E6E73"
          font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
          font-size="14"
          font-weight="400"
        >
          ${escapeXml(formatMonth(String(month), locale))}
        </text>
      `;
    })
    .join("\n");

  const seriesElements = series
    .map((item, seriesIndex) => {
      const color = COLORS[seriesIndex % COLORS.length]!;
      const gradientId = `series-gradient-${seriesIndex}`;

      const points = item.data.map((point, index) => ({
        x: getX(index),
        y: getY(point.views),
        value: point.views,
      }));

      if (points.length === 0) {
        return "";
      }

      const polylinePoints = points
        .map(({ x, y }) => `${x},${y}`)
        .join(" ");

      const first = points[0]!;
      const last = points[points.length - 1]!;
      const baselineY = getY(0);

      const areaPoints = [
        `${first.x},${baselineY}`,
        ...points.map(({ x, y }) => `${x},${y}`),
        `${last.x},${baselineY}`,
      ].join(" ");

      const dots = points
        .map(
          ({ x, y }) => `
            <circle
              cx="${x}"
              cy="${y}"
              r="6"
              fill="${color}"
              stroke="#FFFFFF"
              stroke-width="3"
              filter="url(#point-shadow)"
            />
          `,
        )
        .join("\n");

const valueLabels =
  series.length === 1
    ? points
        .map(
          ({ x, y, value }) => `
            <text
              x="${x}"
              y="${Math.max(y - 16, padding.top + 18)}"
              text-anchor="middle"
              fill="${color}"
              font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
              font-size="14"
              font-weight="600"
            >
              ${formatNumber(value)}
            </text>
          `,
        )
        .join("\n")
    : (() => {
        const lastPoint = points[points.length - 1];

        if (!lastPoint) {
          return "";
        }

        return `
          <text
            x="${lastPoint.x}"
            y="${Math.max(lastPoint.y - 16, padding.top + 18)}"
            text-anchor="middle"
            fill="${color}"
            font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
            font-size="14"
            font-weight="600"
          >
            ${formatNumber(lastPoint.value)}
          </text>
        `;
      })();

      return `
        <defs>
          <linearGradient
            id="${gradientId}"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stop-color="${color}"
              stop-opacity="0.16"
            />
            <stop
              offset="75%"
              stop-color="${color}"
              stop-opacity="0.03"
            />
            <stop
              offset="100%"
              stop-color="${color}"
              stop-opacity="0"
            />
          </linearGradient>
        </defs>

        <polygon
          points="${areaPoints}"
          fill="url(#${gradientId})"
        />

        <polyline
          points="${polylinePoints}"
          fill="none"
          stroke="${color}"
          stroke-width="4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        ${dots}
        ${valueLabels}
      `;
    })
    .join("\n");

  const legend =
    series.length > 1
      ? series
          .map((item, index) => {
            const x = padding.left + index * 170;
            const color = COLORS[index % COLORS.length]!;

            return `
              <circle
                cx="${x}"
                cy="118"
                r="5"
                fill="${color}"
              />

              <text
                x="${x + 14}"
                y="123"
                fill="#6E6E73"
                font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
                font-size="14"
                font-weight="500"
              >
                ${escapeXml(item.label)}
              </text>
            `;
          })
          .join("\n")
      : "";

  return `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
  role="img"
  aria-label="${escapeXml(title)}"
>
  <defs>
    <filter
      id="card-shadow"
      x="-10%"
      y="-10%"
      width="120%"
      height="130%"
    >
      <feDropShadow
        dx="0"
        dy="10"
        stdDeviation="20"
        flood-color="#000000"
        flood-opacity="0.06"
      />
    </filter>

    <filter
      id="point-shadow"
      x="-100%"
      y="-100%"
      width="300%"
      height="300%"
    >
      <feDropShadow
        dx="0"
        dy="2"
        stdDeviation="2"
        flood-color="#000000"
        flood-opacity="0.12"
      />
    </filter>
  </defs>

  <!-- Background -->
  <rect
    width="${width}"
    height="${height}"
    fill="#F5F5F7"
  />

  <!-- Card -->
  <rect
    x="24"
    y="22"
    width="${width - 48}"
    height="${height - 44}"
    rx="28"
    fill="#FFFFFF"
    filter="url(#card-shadow)"
  />

  <!-- Title -->
  <text
    x="${padding.left}"
    y="72"
    fill="#1D1D1F"
    font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
    font-size="32"
    font-weight="700"
    letter-spacing="-0.6"
  >
    ${escapeXml(title)}
  </text>

  <!-- Subtitle -->
  <text
    x="${padding.left}"
    y="103"
    fill="#86868B"
    font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
    font-size="16"
    font-weight="400"
  >
    ${escapeXml(subtitle)}
  </text>

  ${legend}

  <!-- Grid -->
  ${verticalGrid}
  ${horizontalGrid}

  <!-- Axis labels -->
  <text
    x="${padding.left}"
    y="${height - 35}"
    fill="#86868B"
    font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
    font-size="13"
    font-weight="500"
  >
    ${escapeXml(xAxisLabel)}
  </text>

  <text
    x="43"
    y="${padding.top + chartHeight / 2}"
    text-anchor="middle"
    transform="rotate(-90 43 ${padding.top + chartHeight / 2})"
    fill="#86868B"
    font-family="-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif"
    font-size="13"
    font-weight="500"
  >
    ${escapeXml(yAxisLabel)}
  </text>

  <!-- Data -->
  ${seriesElements}

  <!-- X labels -->
  ${xLabels}
</svg>
`.trim();
}