import "dotenv/config";

const apiKey = process.env.OPENROUTER_API_KEY;

if (!apiKey) {
  throw new Error("OPENROUTER_API_KEY is not configured");
}

async function main() {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "user",
            content:
              "Відповідай українською одним коротким реченням: що таке Вікіпедія?",
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenRouter API error: ${response.status} ${response.statusText}\n${errorText}`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter returned no response content");
  }

  console.log(content);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});