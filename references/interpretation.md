# Interpretation guide

Use this guide when turning analysis JSON into a user-facing product research summary.

## Language

Write the final user-facing response in Ukrainian unless the user explicitly requests another language.

## Core principle

Treat Wikipedia page views as an interest signal, not as proof of market demand, purchase intent, or willingness to pay.

Never invent explanations for changes in traffic. If the data contains spikes or outliers, describe them as unusual observations unless their cause has been independently verified.

Do not infer causality from timing alone.

## Single-market analysis

Start with the overall direction of interest:

- `trendDirection = up` → the overall trend across the analyzed period is upward.
- `trendDirection = down` → the overall trend across the analyzed period is downward.
- `trendDirection = flat` → no clear overall directional trend is visible.

Use `growthPct` and `medianGrowthPct` together.

If both have the same sign, say that both measures support the same direction.

If they differ substantially in magnitude, explain that the estimated size of the change is unstable.

Use `signalConsistency` only to describe agreement between the two growth estimators:

- `high` → strong agreement;
- `medium` → partial agreement;
- `low` → weak agreement.

Do not describe `signalConsistency` as statistical confidence.

Use `volatilityPct` and outlier information to explain whether the time series is relatively stable or noisy.

Use `signalQuality` as an overall heuristic assessment:

- `high` → relatively clean and interpretable signal;
- `medium` → useful signal with meaningful limitations;
- `low` → weak or unstable signal that needs additional validation.

Do not describe `signalQuality` as a probability or statistical confidence level.

## Metric wording

Do not call `growthPct` "average growth" or "average change".

`growthPct` compares the average page views of the first three months with the average page views of the last three months.

Describe it as:

- positive value → "зміна між початком і кінцем періоду: +X%";
- negative value → "зміна між початком і кінцем періоду: -X%".

`medianGrowthPct` compares the median page views of the first three months with the median page views of the last three months.

Describe it as:

- "медіанна зміна: X%".

Never label a negative value as "growth" or "зростання".

`trendSlopePctPerMonth` is the normalized slope of the fitted linear trend.

Use it as a description of the estimated trend slope, not as a compounded monthly growth rate and not as a forecast.

Prefer:

- "оцінений нахил тренду: X% на місяць".

Avoid:

- "щомісячне зростання: X%";
- "щомісячне падіння: X%";
- "очікується X% наступного місяця".

`averageMonthlyViews` is an average monthly page-view volume over the analyzed period.

Prefer:

- "середньомісячні перегляди: X".

## Confidence wording

Do not use statistical-confidence language such as:

- "confidence";
- "рівень впевненості";
- "впевненість у тренді";
- "ймовірність того, що тренд правильний".

`signalConsistency` describes agreement between two growth estimators.

`signalQuality` is a heuristic assessment of how clean and interpretable the observed signal is.

Neither metric represents statistical confidence, probability, or forecast certainty.

## Outlier wording

An outlier is an unusual observation, not automatically an error.

If `outlierCount > 0`:

- mention the number of unusual months;
- mention `outlierMonths` when useful;
- do not delete or ignore them in the explanation;
- do not invent a cause.

Prefer:

- "зафіксовано 1 нетиповий місяць";
- "у часовому ряді є нетипове спостереження".

Avoid:

- "помилка в даних";
- "аномалія через сезонність";
- "сплеск через новини";

unless the cause has been independently verified.

## Market comparison

Compare markets across separate dimensions:

1. audience-interest scale using `averageMonthlyViews`;
2. direction and magnitude of change using `growthPct` and `medianGrowthPct`;
3. overall trend direction;
4. volatility;
5. signal quality.

Do not declare an overall "winner" unless the user has provided an explicit prioritization criterion.

Do not convert differences in page views directly into claims about market size, revenue potential, conversion, or willingness to pay.

For example, a market may have larger traffic but declining interest, while another may have smaller traffic but stronger growth.

When the user provides a decision criterion, apply that criterion explicitly and state the trade-off.

## Recommended response structure

Keep the response concise and decision-oriented.

1. Main finding.
2. Key numbers.
3. Reliability and limitations.
4. What the user should validate next.

Use grammatically correct Ukrainian headings, for example:

- "Основний висновок";
- "Ключові показники";
- "Надійність та обмеження";
- "Що перевірити далі".

## Ukrainian terminology

When writing in Ukrainian:

- use "Вікіпедія", not "Wikipedia";
- use "українська Вікіпедія" or "україномовна Вікіпедія" where appropriate;
- describe declining page views as "інтерес знижується" or "загальний тренд є низхідним";
- use "нестабільний" for the estimate, signal, or magnitude of change, not for the underlying audience interest unless the data specifically supports that claim.

Prefer:

- "масштаб зміни оцінюється нестабільно";
- "сигнал має високу волатильність";
- "загальний тренд за період був низхідним";
- "середньомісячні перегляди".

Avoid:

- "нестабільний інтерес";
- "нестабільний попит";
- "середній рівень уваги";
- "Wikipedia" in Ukrainian user-facing text.

## Trend wording

`trendDirection` describes the overall direction across the analyzed period.

It does not mean that page views moved in the same direction every month.

Prefer:

- `trendDirection = down` → "загальний тренд за період був низхідним";
- `trendDirection = up` → "загальний тренд за період був висхідним";
- `trendDirection = flat` → "чіткого загального напрямку не видно".

Avoid wording such as:

- "інтерес знижувався щомісяця";
- "інтерес зростав протягом усього періоду";
- "інтерес падав безперервно";

unless the monthly data actually supports that claim.

When referring to volume, prefer "перегляди" or "середньомісячні перегляди" rather than vague terms such as "увага".

## Forecasting

This skill describes observed historical page-view patterns.

Do not turn trend metrics into a forecast unless forecasting is implemented separately.

Avoid:

- predicting future page views;
- stating that the trend will continue;
- estimating future market demand from the current trend.

Prefer:

- "у межах проаналізованого періоду";
- "за наявними історичними даними";
- "цей сигнал варто перевірити іншими джерелами".

## Recommended next validation

Recommend follow-up validation that matches the user's product question.

Useful examples include:

- search-interest data;
- product analytics;
- landing-page or ad experiments;
- user interviews or surveys;
- related-topic comparisons;
- additional Wikipedia language editions;
- alternative article proxies for the same topic.

Do not claim that one external source will prove market demand by itself.

## Example style

> Загальний тренд за період був низхідним. Зміна між початком і кінцем періоду становила близько -66%, а медіанна зміна — близько -49%. Обидві метрики вказують на спад, але різниця між ними означає, що точний масштаб зміни оцінюється нестабільно. Волатильність висока, тому загальна якість сигналу — середня. Дані Вікіпедії варто використовувати як сигнал для подальшої перевірки, а не як доказ ринкового попиту.
