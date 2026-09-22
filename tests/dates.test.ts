import assert from "node:assert/strict";
import test from "node:test";

import { getCompletedMonthRange } from "../scripts/dates.js";

test("returns the last completed month as end date", () => {
  const now = new Date("2026-09-23T12:00:00Z");

  const result = getCompletedMonthRange(12, now);

  assert.deepEqual(result, {
    start: "20250901",
    end: "20260831",
  });
});

test("handles year boundaries correctly", () => {
  const now = new Date("2026-01-15T12:00:00Z");

  const result = getCompletedMonthRange(3, now);

  assert.deepEqual(result, {
    start: "20251001",
    end: "20251231",
  });
});

test("returns a single completed month", () => {
  const now = new Date("2026-09-23T12:00:00Z");

  const result = getCompletedMonthRange(1, now);

  assert.deepEqual(result, {
    start: "20260801",
    end: "20260831",
  });
});

test("rejects invalid month counts", () => {
  assert.throws(() => getCompletedMonthRange(0), {
    message: "months must be a positive integer",
  });

  assert.throws(() => getCompletedMonthRange(1.5), {
    message: "months must be a positive integer",
  });
});