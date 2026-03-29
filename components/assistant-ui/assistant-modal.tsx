import { Thread } from "@/components/assistant-ui/thread";
import { AssistantModalPrimitive } from "@assistant-ui/react";
import { BotIcon, XIcon } from "lucide-react";
import { forwardRef } from "react";

const ModalButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { "data-state"?: string }
>(({ "data-state": state, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={state === "open" ? "Close chat assistant" : "Open chat assistant"}
    className="relative size-full rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110 active:scale-90"
    {...props}
  >
    <BotIcon
      data-state={state}
      className="absolute inset-0 m-auto size-5 transition-all duration-200 data-[state=open]:scale-0 data-[state=open]:rotate-90"
    />
    <XIcon
      data-state={state}
      className="absolute inset-0 m-auto size-5 transition-all duration-200 data-[state=closed]:scale-0 data-[state=closed]:-rotate-90"
    />
  </button>
));

ModalButton.displayName = "ModalButton";

export const AssistantModal = () => {
  return (
    <AssistantModalPrimitive.Root>
      <AssistantModalPrimitive.Anchor className="fixed right-4 bottom-4 z-50 size-11">
        <AssistantModalPrimitive.Trigger asChild>
          <ModalButton />
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>

      <AssistantModalPrimitive.Content
        dissmissOnInteractOutside
        sideOffset={16}
        className="h-[500px] w-[400px] max-w-[calc(100vw-2rem)] rounded-xl border bg-popover shadow-md duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-4"
      >
        <Thread />
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};