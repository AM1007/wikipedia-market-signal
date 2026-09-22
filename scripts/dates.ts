export type DateRange = {
  start: string;
  end: string;
};

function formatDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}${month}${day}`;
}

export function getCompletedMonthRange(
  months: number,
  now = new Date(),
): DateRange {
  if (!Number.isInteger(months) || months <= 0) {
    throw new Error("months must be a positive integer");
  }

  const end = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      0,
    ),
  );

  const start = new Date(
    Date.UTC(
      end.getUTCFullYear(),
      end.getUTCMonth() - months + 1,
      1,
    ),
  );

  return {
    start: formatDate(start),
    end: formatDate(end),
  };
}