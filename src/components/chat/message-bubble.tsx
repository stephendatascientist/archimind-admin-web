"use client";

import { useState, useMemo } from "react";
import MarkdownIt from "markdown-it";
import { BrainCircuit, User, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RagSource, SupersetExecutionResult } from "@/lib/types/api";
import { SupersetResult } from "./superset-result";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  thought?: string;
  isThinking?: boolean;
  ragSources?: RagSource[];
  executionResult?: SupersetExecutionResult;
}

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

function Markdown({ content, className }: { content: string; className?: string }) {
  const html = useMemo(() => md.render(content), [content]);
  return (
    <div
      className={cn("tiptap ProseMirror prose-sm max-w-none", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function MessageBubble({ role, content, thought, isThinking, ragSources, executionResult }: MessageBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(true);
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
        {(thought || isThinking) && (
          <div className="rounded-2xl bg-muted/50 border border-muted text-xs text-muted-foreground mb-2 overflow-hidden">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full items-center gap-2 px-4 py-2 hover:bg-muted/80 transition-colors text-left"
            >
              <span className="flex-1 font-medium not-italic opacity-70">
                {isThinking ? "Thinking..." : "Thought process"}
              </span>
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/50" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              )}
            </button>
            {isExpanded && thought && (
              <div className="px-4 pb-3 pt-0 border-t border-muted/30 mt-1">
                <Markdown content={thought} className="italic text-muted-foreground/80" />
              </div>
            )}
          </div>
        )}

        {(content || (!isThinking && !isUser)) && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed min-h-[40px]",
              isUser
                ? "bg-primary text-primary-foreground rounded-br-sm"
                : "bg-muted rounded-bl-sm"
            )}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap">{content}</div>
            ) : content ? (
              <Markdown content={content} />
            ) : !isThinking ? (
              <div className="text-muted-foreground italic text-xs">No response from agent.</div>
            ) : (
              <div className="flex items-center gap-1 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:300ms]" />
              </div>
            )}
          </div>
        )}

        {executionResult && <SupersetResult result={executionResult} />}

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
