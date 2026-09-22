import { getCompletedMonthRange } from "./dates.js";
import { getPageviews } from "./wikipedia.js";

async function main() {
  const range = getCompletedMonthRange(12);

  const items = await getPageviews({
    project: "uk.wikipedia.org",
    article: "Астрономія",
    start: range.start,
    end: range.end,
  });

  const monthlyViews = items.map((item) => ({
    month: item.timestamp.slice(0, 6),
    views: item.views,
  }));

  console.table(monthlyViews);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});