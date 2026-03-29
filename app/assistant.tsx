"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import {
  useChatRuntime,
  AssistantChatTransport,
} from "@assistant-ui/react-ai-sdk";
import { lastAssistantMessageIsCompleteWithToolCalls } from "ai";
import { AssistantModal } from "@/components/assistant-ui/assistant-modal";

type AssistantProps = {
  embed?: boolean;
};

export const Assistant = ({ embed = false }: AssistantProps) => {
  const runtime = useChatRuntime({
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    transport: new AssistantChatTransport({
      api: "/api/chat",
    }),
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div
        className={
          embed
            ? "relative h-full w-full bg-transparent"
            : "relative h-dvh w-full bg-background"
        }
      >
        <AssistantModal />
      </div>
    </AssistantRuntimeProvider>
  );
};
