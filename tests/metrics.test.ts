import assert from "node:assert/strict";
import test from "node:test";

import { summarizeViews } from "../scripts/metrics.js";

test("detects a clear upward trend", () => {
  const data = [
    { month: "202601", views: 100 },
    { month: "202602", views: 120 },
    { month: "202603", views: 140 },
    { month: "202604", views: 160 },
    { month: "202605", views: 180 },
    { month: "202606", views: 200 },
  ];

  const result = summarizeViews(data);

  assert.equal(result.trendDirection, "up");
  assert.ok(result.growthPct > 0);
  assert.ok(result.medianGrowthPct > 0);
  assert.ok(result.trendSlopePctPerMonth > 0);
});

test("detects a clear downward trend", () => {
  const data = [
    { month: "202601", views: 200 },
    { month: "202602", views: 180 },
    { month: "202603", views: 160 },
    { month: "202604", views: 140 },
    { month: "202605", views: 120 },
    { month: "202606", views: 100 },
  ];

  const result = summarizeViews(data);

  assert.equal(result.trendDirection, "down");
  assert.ok(result.growthPct < 0);
  assert.ok(result.medianGrowthPct < 0);
  assert.ok(result.trendSlopePctPerMonth < 0);
});

test("flags a strong outlier", () => {
  const data = [
    { month: "202601", views: 100 },
    { month: "202602", views: 105 },
    { month: "202603", views: 98 },
    { month: "202604", views: 102 },
    { month: "202605", views: 101 },
    { month: "202606", views: 1000 },
  ];

  const result = summarizeViews(data);

  assert.equal(result.outlierCount, 1);
  assert.deepEqual(result.outlierMonths, ["202606"]);
});

test("rejects periods shorter than six months", () => {
  const data = [
    { month: "202601", views: 100 },
    { month: "202602", views: 110 },
    { month: "202603", views: 120 },
    { month: "202604", views: 130 },
    { month: "202605", views: 140 },
  ];

  assert.throws(() => summarizeViews(data));
});