export type PageviewItem = {
  project: string;
  article: string;
  granularity: string;
  timestamp: string;
  access: string;
  agent: string;
  views: number;
};

type PageviewResponse = {
  items: PageviewItem[];
};

export type GetPageviewsParams = {
  project: string;
  article: string;
  start: string;
  end: string;
};

export async function getPageviews({
  project,
  article,
  start,
  end,
}: GetPageviewsParams): Promise<PageviewItem[]> {
  const url =
    `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/` +
    `${project}/all-access/user/${encodeURIComponent(article)}/monthly/${start}/${end}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Wikimedia API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as PageviewResponse;

  return data.items;
}