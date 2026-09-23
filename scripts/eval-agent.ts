import "dotenv/config";

import { readFile } from "node:fs/promises";

import { analyzeArticle } from "./analysis.js";
import { searchWikipedia } from "./search.js";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is not configured");
}

type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

type Message = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
};

const tools = [
  {
    type: "function",
    function: {
      name: "search_articles",
      description:
        "Search Wikipedia article candidates for a user topic in a specific Wikipedia language edition.",
      parameters: {
        type: "object",
        properties: {
          project: {
            type: "string",
            description: "Wikipedia project, for example uk.wikipedia.org",
          },
          query: {
            type: "string",
            description: "Topic or article search query",
          },
          limit: {
            type: "integer",
            minimum: 1,
            maximum: 10,
            default: 5,
          },
        },
        required: ["project", "query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "analyze_article",
      description:
        "Analyze monthly Wikipedia page views for an exact article using completed months only.",
      parameters: {
        type: "object",
        properties: {
          project: {
            type: "string",
          },
          article: {
            type: "string",
          },
          months: {
            type: "integer",
            minimum: 6,
          },
        },
        required: ["project", "article", "months"],
      },
    },
  },
];

async function callModel(messages: Message[]) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5.6-luna",
        messages,
        tools,
        tool_choice: "auto",
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenRouter API error: ${response.status} ${response.statusText}\n${errorText}`,
    );
  }

  return (await response.json()) as {
    model?: string;
    choices?: Array<{
      message?: Message;
    }>;
  };
}

async function executeTool(call: ToolCall) {
  const args = JSON.parse(call.function.arguments) as Record<
    string,
    unknown
  >;

  if (call.function.name === "search_articles") {
    return searchWikipedia(
      String(args.project),
      String(args.query),
      typeof args.limit === "number"
        ? args.limit
        : 5,
    );
  }

  if (call.function.name === "analyze_article") {
    return analyzeArticle({
      project: String(args.project),
      article: String(args.article),
      months: Number(args.months),
    });
  }

  throw new Error(
    `Unknown tool: ${call.function.name}`,
  );
}

async function main() {
  const skill = await readFile("SKILL.md", "utf8");
  const interpretation = await readFile(
    "references/interpretation.md",
    "utf8",
  );

  const messages: Message[] = [
    {
      role: "system",
      content: [
        skill,
        "",
        "# Interpretation reference",
        interpretation,
        "",
        "Use the provided tools instead of inventing Wikipedia article titles or page-view data.",
      ].join("\n"),
    },
    {
      role: "user",
      content:
        "Ми думаємо додати курс з астрономії до освітнього застосунку. Чи зростає інтерес до цієї теми в україномовній Вікіпедії за останні 12 завершених місяців?",
    },
  ];

  for (let step = 0; step < 6; step += 1) {
    const data = await callModel(messages);
    const message = data.choices?.[0]?.message;

    if (!message) {
      throw new Error("Model returned no message");
    }

    messages.push(message);

    if (!message.tool_calls?.length) {
      console.log("Model:", data.model ?? "unknown");
      console.log("");
      console.log(message.content ?? "");
      return;
    }

    for (const toolCall of message.tool_calls) {
      console.log(
        "Tool:",
        toolCall.function.name,
        toolCall.function.arguments,
      );

      const result = await executeTool(toolCall);

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }
  }

  throw new Error(
    "Agent exceeded maximum tool-calling steps",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});