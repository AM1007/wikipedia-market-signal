export type SearchResult = {
  title: string;
  description: string;
  url: string;
};

type OpenSearchResponse = [
  string,
  string[],
  string[],
  string[],
];

export async function searchWikipedia(
  project: string,
  query: string,
  limit = 5,
): Promise<SearchResult[]> {
  const url =
    `https://${project}/w/api.php` +
    `?action=opensearch` +
    `&search=${encodeURIComponent(query)}` +
    `&limit=${limit}` +
    `&namespace=0` +
    `&format=json` +
    `&origin=*`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Wikipedia search API error: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as OpenSearchResponse;

  const [, titles, descriptions, urls] = data;

  return titles.map((title, index) => ({
    title,
    description: descriptions[index] ?? "",
    url: urls[index] ?? "",
  }));
}