import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import {
  JSONSchema7,
  convertToModelMessages,
  smoothStream,
  streamText,
  type UIMessage,
} from "ai";

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
  }: {
    messages: UIMessage[];
    system?: string;
    tools?: Record<string, { description?: string; parameters: JSONSchema7 }>;
  } = await req.json();

  const configuredDelay = Number(process.env.CHAT_STREAM_DELAY_MS ?? "28");
  const streamDelayMs =
    Number.isFinite(configuredDelay) && configuredDelay >= 0
      ? configuredDelay
      : 28;

  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    messages: await convertToModelMessages(messages),
    system,
    tools: {
      ...frontendTools(tools ?? {}),
    },
    experimental_transform: smoothStream({
      delayInMs: streamDelayMs,
      chunking: "word",
    }),
  });

  return result.toUIMessageStreamResponse({
    sendReasoning: true,
  });
}
