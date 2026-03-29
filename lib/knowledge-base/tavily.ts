import type { KnowledgeChunk } from "@/lib/assistant-system-instruction";

type TavilySearchResult = {
  title?: string;
  url?: string;
  content?: string;
  raw_content?: string;
};

const MAX_TAVILY_CONTENT_CHARS = 12000;

const clamp = (value: string, max: number) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}\n...[truncated tavily context]`;
};

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
};

const toChunk = (result: TavilySearchResult, index: number): KnowledgeChunk | null => {
  const content = (result.raw_content ?? result.content ?? "").trim();
  if (!content) return null;

  return {
    id: `tavily-${index + 1}`,
    title: result.title ?? `Website result ${index + 1}`,
    source: result.url,
    content,
  };
};

const splitChunk = (chunk: KnowledgeChunk): KnowledgeChunk[] => {
  if (chunk.content.length <= MAX_TAVILY_CONTENT_CHARS) return [chunk];

  const parts: KnowledgeChunk[] = [];
  let start = 0;
  let sequence = 1;

  while (start < chunk.content.length) {
    const end = start + MAX_TAVILY_CONTENT_CHARS;
    const piece = clamp(chunk.content.slice(start, end), MAX_TAVILY_CONTENT_CHARS);
    parts.push({
      id: `${chunk.id ?? "tavily"}-${sequence}`,
      title: chunk.title,
      source: chunk.source,
      content: piece,
    });
    start = end;
    sequence += 1;
  }

  return parts;
};

export const retrieveFromTavilyWebsite = async (
  websiteUrl: string,
): Promise<KnowledgeChunk[]> => {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  const normalized = normalizeUrl(websiteUrl);
  if (!normalized) return [];

  const maxResults = Number(process.env.TAVILY_MAX_RESULTS ?? "5");
  const resolvedMaxResults = Number.isFinite(maxResults) && maxResults > 0 ? maxResults : 5;

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        api_key: apiKey,
        query: `Important company information from ${normalized.toString()}`,
        include_raw_content: true,
        max_results: resolvedMaxResults,
        search_depth: "advanced",
        include_domains: [normalized.hostname],
      }),
    });

    if (!response.ok) return [];

    const json = (await response.json()) as {
      results?: TavilySearchResult[];
    };

    const baseChunks = (json.results ?? [])
      .map(toChunk)
      .filter((value): value is KnowledgeChunk => Boolean(value));

    return baseChunks.flatMap(splitChunk);
  } catch {
    return [];
  }
};