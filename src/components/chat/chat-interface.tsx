"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, BrainCircuit } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstances } from "@/lib/queries/app-instances";
import { useSendMessage, useResumeWorkflow } from "@/lib/queries/chat";
import type { PlanMetadata, RagSource } from "@/lib/types/api";
import { MessageBubble } from "./message-bubble";
import { HitlReviewCard } from "./hitl-review-card";

// ── Local message model ───────────────────────────────────────
type UIMessage =
  | { id: string; type: "user"; content: string }
  | { id: string; type: "assistant"; content: string; ragSources?: RagSource[] }
  | {
      id: string;
      type: "pending_review";
      plan: string;
      threadId: string;
      planMetadata: PlanMetadata;
      resolved: boolean;
    };

function uid() {
  return Math.random().toString(36).slice(2);
}

interface ChatInterfaceProps {
  initialInstanceId?: string;
}

export function ChatInterface({ initialInstanceId }: ChatInterfaceProps) {
  const { data: instances, isLoading: instancesLoading } = useInstances();
  const [selectedInstanceId, setSelectedInstanceId] = useState(initialInstanceId ?? "");
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = useSendMessage();
  const resumeWorkflow = useResumeWorkflow();

  const isBusy = sendMessage.isPending || resumeWorkflow.isPending;
  const hasPendingReview = messages.some(
    (m) => m.type === "pending_review" && !m.resolved
  );

  // Auto-select first instance when loaded
  useEffect(() => {
    if (!selectedInstanceId && instances && instances.length > 0) {
      setSelectedInstanceId(instances[0].id);
    }
  }, [instances, selectedInstanceId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleInstanceChange(id: string | null) {
    setSelectedInstanceId(id ?? "");
    setConversationId(undefined);
    setMessages([]);
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || isBusy) return;

    setInput("");
    setMessages((prev) => [...prev, { id: uid(), type: "user", content }]);

    try {
      const response = await sendMessage.mutateAsync({
        messages: [{ role: "user", content }],
        app_instance_id: selectedInstanceId || undefined,
        conversation_id: conversationId,
      });

      setConversationId(response.conversation_id);

      if (response.status === "complete") {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            type: "assistant",
            content: response.response,
            ragSources: response.rag_sources,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            type: "pending_review",
            plan: response.plan,
            threadId: response.thread_id,
            planMetadata: response.plan_metadata,
            resolved: false,
          },
        ]);
      }
    } catch {
      toast.error("Failed to send message. Please try again.");
    }
  }

  async function handleApprove(threadId: string, messageId: string) {
    markResolved(messageId);
    try {
      const response = await resumeWorkflow.mutateAsync({
        thread_id: threadId,
        approved: true,
      });
      setConversationId(response.conversation_id);
      handleResumeResponse(response);
    } catch {
      toast.error("Failed to resume workflow. Please try again.");
    }
  }

  async function handleReject(threadId: string, messageId: string, feedback?: string) {
    markResolved(messageId);
    try {
      const response = await resumeWorkflow.mutateAsync({
        thread_id: threadId,
        approved: false,
        feedback,
      });
      setConversationId(response.conversation_id);
      handleResumeResponse(response);
    } catch {
      toast.error("Failed to resume workflow. Please try again.");
    }
  }

  function markResolved(id: string) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id && m.type === "pending_review" ? { ...m, resolved: true } : m))
    );
  }

  function handleResumeResponse(response: Awaited<ReturnType<typeof resumeWorkflow.mutateAsync>>) {
    if (response.status === "complete") {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          type: "assistant",
          content: response.response,
          ragSources: response.rag_sources,
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          type: "pending_review",
          plan: response.plan,
          threadId: response.thread_id,
          planMetadata: response.plan_metadata,
          resolved: false,
        },
      ]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Instance selector */}
      <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
        <BrainCircuit className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="text-sm text-muted-foreground shrink-0">App Instance:</span>
        {instancesLoading ? (
          <Skeleton className="h-8 w-56" />
        ) : (
          <Select value={selectedInstanceId} onValueChange={handleInstanceChange}>
            <SelectTrigger className="h-8 w-56 text-sm">
              <SelectValue placeholder="Select an instance (optional)" />
            </SelectTrigger>
            <SelectContent>
              {instances?.map((inst) => (
                <SelectItem key={inst.id} value={inst.id}>
                  {inst.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {conversationId && (
          <span className="ml-auto text-[10px] text-muted-foreground font-mono truncate max-w-xs">
            conv: {conversationId}
          </span>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto rounded-lg border bg-card p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div className="space-y-2">
              <BrainCircuit className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {selectedInstanceId
                  ? "Send a message to start the conversation."
                  : "Select an app instance or type a message for generic chat."}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === "user") {
              return <MessageBubble key={msg.id} role="user" content={msg.content} />;
            }
            if (msg.type === "assistant") {
              return (
                <MessageBubble
                  key={msg.id}
                  role="assistant"
                  content={msg.content}
                  ragSources={msg.ragSources}
                />
              );
            }
            if (msg.type === "pending_review" && !msg.resolved) {
              return (
                <HitlReviewCard
                  key={msg.id}
                  plan={msg.plan}
                  planMetadata={msg.planMetadata}
                  isLoading={isBusy}
                  onApprove={() => handleApprove(msg.threadId, msg.id)}
                  onReject={(feedback) => handleReject(msg.threadId, msg.id, feedback)}
                />
              );
            }
            // Resolved pending_review — show a subtle indicator
            if (msg.type === "pending_review" && msg.resolved) {
              return (
                <p key={msg.id} className="text-center text-xs text-muted-foreground italic">
                  Plan reviewed — waiting for agent response…
                </p>
              );
            }
            return null;
          })
        )}

        {isBusy && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted border">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-bl-sm bg-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex gap-2 items-end rounded-lg border bg-card p-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            hasPendingReview
              ? "Approve or reject the plan above before sending a new message…"
              : "Type a message… (Enter to send, Shift+Enter for new line)"
          }
          rows={2}
          className="flex-1 resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-sm"
          disabled={isBusy || hasPendingReview}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || isBusy || hasPendingReview}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
