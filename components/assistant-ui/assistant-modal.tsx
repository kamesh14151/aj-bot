import { Thread } from "@/components/assistant-ui/thread";
import { AssistantModalPrimitive } from "@assistant-ui/react";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { forwardRef, useEffect, useRef, useState } from "react";

const ModalButton = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { "data-state"?: string }
>(({ "data-state": state, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label={state === "open" ? "Close chat assistant" : "Open chat assistant"}
    className="relative size-full overflow-hidden rounded-full bg-white text-black shadow-md transition-transform hover:scale-110 active:scale-90 data-[state=open]:bg-black data-[state=open]:text-white"
    {...props}
  >
    <Image
      src="/favicon.png"
      alt="Snooky launcher logo"
      width={44}
      height={44}
      data-state={state}
      className="absolute inset-0 m-auto h-11 w-11 rounded-full object-cover transition-all duration-200 data-[state=open]:scale-0 data-[state=open]:rotate-90"
    />
    <XIcon
      data-state={state}
      className="absolute inset-0 m-auto size-5 transition-all duration-200 data-[state=closed]:scale-0 data-[state=closed]:-rotate-90"
    />
  </button>
));

ModalButton.displayName = "ModalButton";

export const AssistantModal = () => {
  const [open, setOpen] = useState(false);
  const [showOpenLoader, setShowOpenLoader] = useState(false);
  const loaderTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (loaderTimerRef.current !== null) {
        window.clearTimeout(loaderTimerRef.current);
      }
    };
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (loaderTimerRef.current !== null) {
      window.clearTimeout(loaderTimerRef.current);
      loaderTimerRef.current = null;
    }

    if (nextOpen) {
      setShowOpenLoader(true);
      loaderTimerRef.current = window.setTimeout(() => {
        setShowOpenLoader(false);
        loaderTimerRef.current = null;
      }, 4000);
      return;
    }

    setShowOpenLoader(false);
  };

  return (
    <AssistantModalPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <AssistantModalPrimitive.Anchor className="fixed right-4 bottom-4 z-50 size-11">
        <AssistantModalPrimitive.Trigger asChild>
          <ModalButton />
        </AssistantModalPrimitive.Trigger>
      </AssistantModalPrimitive.Anchor>

      <AssistantModalPrimitive.Content
        dissmissOnInteractOutside
        sideOffset={16}
        className="h-[520px] w-[400px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border bg-popover shadow-xl duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-4 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-4"
      >
        <div className="relative flex h-full flex-col">
          {showOpenLoader ? (
            <div className="absolute inset-0 z-20 flex flex-col bg-[#f8f8f8]/95 backdrop-blur-[1px]">
              <div className="h-[46px] border-b border-orange-200 bg-gradient-to-r from-amber-100 via-orange-100 to-orange-200" />
              <div className="flex flex-1 flex-col items-center justify-center px-6">
                <div className="mb-3 h-9 w-9 animate-spin rounded-full border-2 border-black/15 border-t-black/55" />
                <p className="text-sm font-medium text-[#111827]">BYTE is initializing...</p>
                <p className="mt-1 text-xs text-[#6b7280]">Preparing secure assistant context</p>
                <div className="mt-4 w-full max-w-[280px] space-y-2">
                  <div className="byte-shimmer h-3 w-full rounded-full" />
                  <div className="byte-shimmer h-3 w-5/6 rounded-full" />
                  <div className="byte-shimmer h-3 w-2/3 rounded-full" />
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center justify-between border-b border-orange-200 bg-gradient-to-r from-amber-100 via-orange-100 to-orange-200 px-3 py-2.5 text-[#7c2d12]">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex size-8 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                <Image
                  src="/favicon.png"
                  alt="Snooky logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-cover"
                />
              </span>
              <div className="leading-tight">
                <p className="font-semibold text-sm">AJ BOT</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Close assistant"
                onClick={() => handleOpenChange(false)}
                className="inline-flex size-7 items-center justify-center rounded-md text-[#9a3412] transition-colors hover:bg-orange-200/70 hover:text-[#7c2d12]"
              >
                <XIcon className="size-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            <Thread />
          </div>
        </div>
      </AssistantModalPrimitive.Content>
    </AssistantModalPrimitive.Root>
  );
};