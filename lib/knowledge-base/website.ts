import type { KnowledgeChunk } from "@/lib/assistant-system-instruction";

const MAX_WEBSITE_CHARS = 6000;

const clamp = (value: string, max: number) => {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}\n...[truncated website context]`;
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

const stripHtml = (html: string) => {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
};

export const retrieveFromWebsite = async (
  websiteUrl: string,
): Promise<KnowledgeChunk[]> => {
  const normalized = normalizeUrl(websiteUrl);
  if (!normalized) return [];

  try {
    const response = await fetch(normalized.toString(), {
      headers: {
        "User-Agent": "AJ-BOT-WebsiteFetcher/1.0",
      },
      next: { revalidate: 1800 },
    });

    if (!response.ok) return [];

    const contentType = (response.headers.get("content-type") ?? "").toLowerCase();
    const raw = await response.text();

    const content = contentType.includes("text/html") ? stripHtml(raw) : raw.trim();
    if (!content) return [];

    return [
      {
        id: `website:${normalized.hostname}`,
        title: `Website context (${normalized.hostname})`,
        source: normalized.toString(),
        content: clamp(content, MAX_WEBSITE_CHARS),
      },
    ];
  } catch {
    return [];
  }
};