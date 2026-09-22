# Interpretation guide

Use this guide when turning analysis JSON into a user-facing product research summary.

## Language

Write the final user-facing response in Ukrainian unless the user explicitly requests another language.

## Core principle

Treat Wikipedia page views as an interest signal, not as proof of market demand, purchase intent, or willingness to pay.

Never invent explanations for changes in traffic. If the data contains spikes or outliers, describe them as unusual observations unless their cause has been independently verified.

## Single-market analysis

Start with the direction of interest:

- `trendDirection = up` → interest shows an upward trend.
- `trendDirection = down` → interest shows a downward trend.
- `trendDirection = flat` → no clear directional trend is visible.

Use `growthPct` and `medianGrowthPct` together.

If both have the same sign, say that the direction is supported by both measures.

If they differ substantially, explain that the estimated magnitude of change is unstable.

Use `signalConsistency` only to describe agreement between the growth measures:

- `high` → strong agreement
- `medium` → partial agreement
- `low` → weak agreement

Do not describe `signalConsistency` as statistical confidence.

Use `volatilityPct` and outlier information to explain whether the time series is stable or noisy.

Use `signalQuality` as an overall heuristic quality assessment:

- `high` → relatively clean signal
- `medium` → useful signal with meaningful limitations
- `low` → weak or unstable signal that needs additional validation

Do not describe `signalQuality` as a probability or statistical confidence level.

## Market comparison

Compare markets across separate dimensions:

1. audience-interest scale using `averageMonthlyViews`;
2. direction and magnitude of change using growth metrics;
3. trend direction;
4. volatility;
5. signal quality.

Do not declare an overall "winner" unless the user has provided an explicit prioritization criterion.

For example, a market may have larger traffic but declining interest, while another may have smaller traffic but stronger growth.

## Recommended response structure

Keep the response concise and decision-oriented.

1. Main finding.
2. Key numbers.
3. Reliability and limitations.
4. What the user should validate next.

## Example style

> Інтерес до теми знижується: середня оцінка зміни становить близько -66%, а медіанна — близько -49%. Обидві метрики вказують на спад, але різниця між ними свідчить, що точний масштаб зміни нестабільний. Волатильність висока, тому загальна якість сигналу — середня. Дані Wikipedia варто використовувати як сигнал для подальшої перевірки, а не як доказ ринкового попиту.