import { Thread } from "@/components/assistant-ui/thread";
import { AssistantModalPrimitive } from "@assistant-ui/react";
import { BotIcon } from "lucide-react";

export const AssistantModal = () => {
  return (
    <AssistantModalPrimitive.Root>
      <AssistantModalPrimitive.Anchor className="fixed right-4 bottom-4 z-50 size-11">
        <AssistantModalPrimitive.Trigger asChild>
          <button
            type="button"
            aria-label="Open chat assistant"
            className="size-full rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 active:scale-90"
          >
            <BotIcon className="mx-auto size-5" />
          </button>
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>

      <AssistantModalPrimitive.Content
        sideOffset={16}
        className="h-[500px] w-[400px] max-w-[calc(100vw-2rem)] rounded-xl border bg-popover shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out"
      >
        <Thread />
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};