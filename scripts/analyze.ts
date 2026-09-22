import { getCompletedMonthRange } from "./dates.js";
import { getPageviews } from "./wikipedia.js";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;

  const arg = process.argv.find((value) => value.startsWith(prefix));

  return arg?.slice(prefix.length);
}

async function main() {
  const project = getArg("project");
  const article = getArg("article");
  const monthsArg = getArg("months");

  if (!project) {
    throw new Error(
      "Missing required argument: --project=<wikipedia-project>",
    );
  }

  if (!article) {
    throw new Error(
      "Missing required argument: --article=<article-title>",
    );
  }

  const months = monthsArg ? Number(monthsArg) : 12;

  if (!Number.isInteger(months) || months <= 0) {
    throw new Error("--months must be a positive integer");
  }

  const range = getCompletedMonthRange(months);

  const items = await getPageviews({
    project,
    article,
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