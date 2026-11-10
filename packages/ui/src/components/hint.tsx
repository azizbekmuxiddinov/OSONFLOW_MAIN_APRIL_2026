"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";

interface HintProps {
  children: React.ReactNode;
  text: string;
  /** Keys shown as chips after the label, e.g. ["⌘", "K"]. */
  keys?: string[];
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
};

export const Hint = ({
  children,
  text,
  keys,
  side = "top",
  align = "center",
}: HintProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <span>{text}</span>
          {keys?.length ? (
            <span className="flex items-center gap-0.5">
              {keys.map((key) => (
                <kbd
                  className="inline-flex h-4 min-w-4 items-center justify-center rounded-[4px] bg-white/15 px-1 font-sans text-[0.625rem] font-medium text-white/90"
                  key={key}
                >
                  {key}
                </kbd>
              ))}
            </span>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
};
