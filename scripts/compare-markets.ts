import { compareMarkets } from "./compare.js";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;

  const arg = process.argv.find((value) =>
    value.startsWith(prefix),
  );

  return arg?.slice(prefix.length);
}

function parseTargets(value: string) {
  return value.split(",").map((item) => {
    const [label, project, article] = item.split("|");

    if (!label || !project || !article) {
      throw new Error(
        "Each target must have the format label|project|article",
      );
    }

    return {
      label,
      project,
      article,
    };
  });
}

async function main() {
  const targetsArg = getArg("targets");
  const monthsArg = getArg("months");

  if (!targetsArg) {
    throw new Error(
      "Missing required argument: --targets=<label|project|article,...>",
    );
  }

  const months = monthsArg ? Number(monthsArg) : 12;

  if (!Number.isInteger(months) || months <= 0) {
    throw new Error("--months must be a positive integer");
  }

  const targets = parseTargets(targetsArg);

  const result = await compareMarkets({
    months,
    targets,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});