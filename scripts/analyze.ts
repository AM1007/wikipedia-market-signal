import { getPageviews } from "./wikipedia.js";

async function main() {
  const items = await getPageviews({
    project: "uk.wikipedia.org",
    article: "Астрономія",
    start: "20250901",
    end: "20260731",
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