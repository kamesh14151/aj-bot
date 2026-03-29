import type { KnowledgeChunk } from "@/lib/assistant-system-instruction";

type RetrieveFromPineconeInput = {
  tenantId: string;
  query: string;
  topK?: number;
};

const toPositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

const getNamespace = (tenantId: string) => {
  const prefix = process.env.PINECONE_NAMESPACE_PREFIX ?? "tenant-";
  return `${prefix}${tenantId}`;
};

const getGoogleEmbedding = async (query: string, apiKey: string) => {
  const model = process.env.PINECONE_EMBED_MODEL ?? "text-embedding-004";

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: `models/${model}`,
        content: {
          parts: [{ text: query }],
        },
      }),
    },
  );

  if (!response.ok) {
    return null;
  }

  const json = (await response.json()) as {
    embedding?: { values?: number[] };
  };

  const values = json.embedding?.values;
  if (!values?.length) return null;
  return values;
};

export const retrieveFromPinecone = async ({
  tenantId,
  query,
  topK,
}: RetrieveFromPineconeInput): Promise<KnowledgeChunk[]> => {
  const pineconeApiKey = process.env.PINECONE_API_KEY;
  const indexHost = process.env.PINECONE_INDEX_HOST;
  const llmApiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!pineconeApiKey || !indexHost || !llmApiKey || !tenantId || !query.trim()) {
    return [];
  }

  const vector = await getGoogleEmbedding(query, llmApiKey);
  if (!vector) return [];

  const resolvedTopK = topK ?? toPositiveInt(process.env.PINECONE_TOP_K, 6);

  const response = await fetch(`https://${indexHost}/query`, {
    method: "POST",
    headers: {
      "Api-Key": pineconeApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      namespace: getNamespace(tenantId),
      vector,
      topK: resolvedTopK,
      includeMetadata: true,
    }),
  });

  if (!response.ok) {
    return [];
  }

  const json = (await response.json()) as {
    matches?: Array<{
      id?: string;
      metadata?: Record<string, unknown>;
    }>;
  };

  const chunks: KnowledgeChunk[] = [];

  for (const match of json.matches ?? []) {
    const metadata = match.metadata ?? {};
    const content =
      (metadata.content as string | undefined) ??
      (metadata.text as string | undefined) ??
      (metadata.chunk as string | undefined);

    if (!content) continue;

    chunks.push({
      id: match.id,
      title: (metadata.title as string | undefined) ?? undefined,
      source: (metadata.source as string | undefined) ?? undefined,
      content,
    });
  }

  return chunks;
};
