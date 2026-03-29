import type { KnowledgeChunk } from "@/lib/assistant-system-instruction";

type RetrieveFromPineconeInput = {
  tenantId: string;
  query: string;
  topK?: number;
  config?: PineconeClientConfig;
};

type UpsertToPineconeInput = {
  tenantId: string;
  chunks: KnowledgeChunk[];
  config?: PineconeClientConfig;
};

export type PineconeClientConfig = {
  apiKey?: string;
  indexHost?: string;
  namespacePrefix?: string;
  embedModel?: string;
  topK?: number;
};

const toPositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
};

const getNamespace = (tenantId: string, config?: PineconeClientConfig) => {
  const prefix = config?.namespacePrefix ?? process.env.PINECONE_NAMESPACE_PREFIX ?? "tenant-";
  return `${prefix}${tenantId}`;
};

const getGoogleEmbedding = async (
  query: string,
  apiKey: string,
  config?: PineconeClientConfig,
) => {
  const model = config?.embedModel ?? process.env.PINECONE_EMBED_MODEL ?? "text-embedding-004";

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
  config,
}: RetrieveFromPineconeInput): Promise<KnowledgeChunk[]> => {
  const pineconeApiKey = config?.apiKey ?? process.env.PINECONE_API_KEY;
  const indexHost = config?.indexHost ?? process.env.PINECONE_INDEX_HOST;
  const llmApiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!pineconeApiKey || !indexHost || !llmApiKey || !tenantId || !query.trim()) {
    return [];
  }

  const vector = await getGoogleEmbedding(query, llmApiKey, config);
  if (!vector) return [];

  const resolvedTopK =
    topK ??
    config?.topK ??
    toPositiveInt(process.env.PINECONE_TOP_K, 6);

  const response = await fetch(`https://${indexHost}/query`, {
    method: "POST",
    headers: {
      "Api-Key": pineconeApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      namespace: getNamespace(tenantId, config),
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

const toPineconeId = (tenantId: string, index: number) => {
  const now = Date.now();
  return `${tenantId}-${now}-${index}`;
};

export const upsertKnowledgeToPinecone = async ({
  tenantId,
  chunks,
  config,
}: UpsertToPineconeInput): Promise<boolean> => {
  const pineconeApiKey = config?.apiKey ?? process.env.PINECONE_API_KEY;
  const indexHost = config?.indexHost ?? process.env.PINECONE_INDEX_HOST;
  const llmApiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!pineconeApiKey || !indexHost || !llmApiKey || !tenantId || !chunks.length) {
    return false;
  }

  const vectors: Array<{
    id: string;
    values: number[];
    metadata: Record<string, unknown>;
  }> = [];

  for (let i = 0; i < chunks.length; i += 1) {
    const chunk = chunks[i];
    const content = chunk.content?.trim();
    if (!content) continue;

    const embedding = await getGoogleEmbedding(content, llmApiKey, config);
    if (!embedding) continue;

    vectors.push({
      id: chunk.id ?? toPineconeId(tenantId, i),
      values: embedding,
      metadata: {
        title: chunk.title ?? "Website chunk",
        source: chunk.source ?? "website",
        content,
      },
    });
  }

  if (!vectors.length) return false;

  const response = await fetch(`https://${indexHost}/vectors/upsert`, {
    method: "POST",
    headers: {
      "Api-Key": pineconeApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      namespace: getNamespace(tenantId, config),
      vectors,
    }),
  });

  return response.ok;
};
