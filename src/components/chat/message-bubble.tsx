"use client";

import { BrainCircuit, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RagSource } from "@/lib/types/api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  ragSources?: RagSource[];
}

export function MessageBubble({ role, content, ragSources }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground border"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
      </div>

      <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm"
          )}
        >
          {content}
        </div>

        {!isUser && ragSources && ragSources.length > 0 && (
          <div className="flex flex-wrap gap-1 px-1">
            {ragSources.map((src) => (
              <Tooltip key={src.source_id}>
                <TooltipTrigger
                  render={
                    <span className="cursor-default rounded border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted transition-colors" />
                  }
                >
                  {src.filename}
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  <p className="font-medium mb-0.5">{src.filename}</p>
                  <p className="text-muted-foreground line-clamp-3">{src.chunk_text}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
