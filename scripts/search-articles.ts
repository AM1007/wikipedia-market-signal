import { searchWikipedia } from "./search.js";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;

  const arg = process.argv.find((value) =>
    value.startsWith(prefix),
  );

  return arg?.slice(prefix.length);
}

async function main() {
  const project = getArg("project");
  const query = getArg("query");
  const limitArg = getArg("limit");

  if (!project) {
    throw new Error(
      "Missing required argument: --project=<wikipedia-project>",
    );
  }

  if (!query) {
    throw new Error(
      "Missing required argument: --query=<search-query>",
    );
  }

  const limit = limitArg ? Number(limitArg) : 5;

  if (!Number.isInteger(limit) || limit <= 0 || limit > 10) {
    throw new Error(
      "--limit must be an integer between 1 and 10",
    );
  }

  const results = await searchWikipedia(
    project,
    query,
    limit,
  );

  console.log(
    JSON.stringify(
      {
        project,
        query,
        results,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});