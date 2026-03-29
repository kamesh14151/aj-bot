import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  JSONSchema7,
  convertToModelMessages,
  smoothStream,
  streamText,
  type UIMessage,
} from "ai";
import {
  buildProductionSystemInstruction,
  type KnowledgeChunk,
  type TenantProfile,
} from "@/lib/assistant-system-instruction";
import {
  retrieveFromPinecone,
  upsertKnowledgeToPinecone,
  type PineconeClientConfig,
} from "@/lib/knowledge-base/pinecone";
import { retrieveFromTavilyWebsite } from "@/lib/knowledge-base/tavily";
import { retrieveFromWebsite } from "@/lib/knowledge-base/website";

const getLatestUserQuery = (messages: UIMessage[]) => {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i] as UIMessage & {
      role?: string;
      content?: string;
      parts?: Array<{ type?: string; text?: string }>;
    };

    if (message.role !== "user") continue;

    if (typeof message.content === "string" && message.content.trim()) {
      return message.content.trim();
    }

    const textFromParts = (message.parts ?? [])
      .map((part) => {
        if (part.type !== "text" || !("text" in part)) return "";
        return typeof part.text === "string" ? part.text : "";
      })
      .filter(Boolean)
      .join("\n")
      .trim();

    if (textFromParts) return textFromParts;
  }

  return "";
};

export async function POST(req: Request) {
  const apiKey =
    process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    return new Response(
      "Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.",
      { status: 500 },
    );
  }

  const google = createGoogleGenerativeAI({ apiKey });

  const {
    messages,
    system,
    tools,
    tenantId,
    tenantProfile,
    knowledgeBase,
    pineconeTopK,
    pineconeConfig,
  }: {
    messages: UIMessage[];
    system?: string;
    tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
    tenantId?: string;
    tenantProfile?: TenantProfile;
    knowledgeBase?: KnowledgeChunk[];
    pineconeTopK?: number;
    pineconeConfig?: PineconeClientConfig;
  } = await req.json();

  const requestTenantId = tenantId ?? req.headers.get("x-tenant-id") ?? undefined;
  const defaultSystem = process.env.ASSISTANT_DEFAULT_SYSTEM_INSTRUCTION;
  const envAssistantName = process.env.ASSISTANT_NAME?.trim() || undefined;
  const assistantBaseWebsite = process.env.ASSISTANT_BASE_WEB?.trim() || undefined;

  const resolvedTenantProfile: TenantProfile | undefined = tenantProfile
    ? {
        ...tenantProfile,
        assistantName: tenantProfile.assistantName || envAssistantName,
      }
    : envAssistantName
      ? { assistantName: envAssistantName }
      : undefined;

  const latestUserQuery = getLatestUserQuery(messages);
  let pineconeKnowledge = requestTenantId
    ? await retrieveFromPinecone({
        tenantId: requestTenantId,
        query: latestUserQuery,
        topK: pineconeTopK,
        config: pineconeConfig,
      })
    : [];

  const hasProvidedDataset = (knowledgeBase?.length ?? 0) > 0;

  // If no dataset is provided and Pinecone has no context yet, bootstrap from website via Tavily.
  if (!hasProvidedDataset && requestTenantId && !pineconeKnowledge.length && assistantBaseWebsite) {
    const tavilyChunks = await retrieveFromTavilyWebsite(assistantBaseWebsite);

    if (tavilyChunks.length) {
      await upsertKnowledgeToPinecone({
        tenantId: requestTenantId,
        chunks: tavilyChunks,
        config: pineconeConfig,
      });

      pineconeKnowledge = await retrieveFromPinecone({
        tenantId: requestTenantId,
        query: latestUserQuery,
        topK: pineconeTopK,
        config: pineconeConfig,
      });
    }
  }

  const websiteKnowledge = assistantBaseWebsite
    ? await retrieveFromWebsite(assistantBaseWebsite)
    : [];

  const mergedKnowledgeBase = [
    ...(knowledgeBase ?? []),
    ...pineconeKnowledge,
    ...websiteKnowledge,
  ];

  const systemInstruction = buildProductionSystemInstruction({
    tenantId: requestTenantId,
    profile: resolvedTenantProfile,
    knowledgeBase: mergedKnowledgeBase,
    requestSystem: system,
    defaultSystem,
  });

  const configuredDelay = Number(process.env.CHAT_STREAM_DELAY_MS ?? "28");
  const streamDelayMs =
    Number.isFinite(configuredDelay) && configuredDelay >= 0
      ? configuredDelay
      : 28;

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    messages: await convertToModelMessages(messages),
    system: systemInstruction,
    tools: {
      ...frontendTools(tools ?? {}),
    },
    experimental_transform: smoothStream({
      delayInMs: streamDelayMs,
      chunking: "word",
    }),
    experimental_download: async (downloads) => {
      return Promise.all(
        downloads.map(async ({ url }) => {
          if (url.protocol !== "data:") return null;

          try {
            // Convert inline data URLs (from uploaded images/files) to bytes for Gemini.
            const response = await fetch(url);
            const buffer = await response.arrayBuffer();
            const mediaType = response.headers.get("content-type") ?? undefined;

            return {
              data: new Uint8Array(buffer),
              mediaType,
            };
          } catch {
            // Fallback to pass-through if decoding fails.
            return null;
          }
        }),
      );
    },
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
