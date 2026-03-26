"use client";

import { useEffect, useRef, useState } from "react";
import {
  Send,
  Loader2,
  BrainCircuit,
  Plus,
  ChevronDown,
  Search,
  MessageSquare,
  Bot,
  Check,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useInstances } from "@/lib/queries/app-instances";
import { apiClient, tokenStorage } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { ClarificationInput, PlanMetadata, PlanStep, RagSource, SupersetExecutionResult } from "@/lib/types/api";
import { MessageBubble } from "./message-bubble";
import { HitlReviewCard } from "./hitl-review-card";
import { ClarificationCarousel } from "./clarification-carousel";

// ── Local message model ───────────────────────────────────────
type UIMessage =
  | { id: string; type: "user"; content: string }
  | {
    id: string;
    type: "assistant";
    content: string;
    thought?: string;
    isThinking?: boolean;
    ragSources?: RagSource[];
    executionResult?: SupersetExecutionResult;
  }
  | {
    id: string;
    type: "pending_review";
    plan: string;
    planId: string;
    steps: PlanStep[];
    confidence: number;
    threadId: string;
    planMetadata?: PlanMetadata;
    resolved: boolean;
  }
  | {
    id: string;
    type: "pending_clarification";
    threadId: string;
    requiredInputs: ClarificationInput[];
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
  const [mode, setMode] = useState<"ask" | "plan" | "agent">("ask");
  const [open, setOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const isBusy = isStreaming;
  const hasPendingInterrupt = messages.some(
    (m) => (m.type === "pending_review" || m.type === "pending_clarification") && !m.resolved
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

  async function runStream(endpoint: string, body: Record<string, unknown>, existingMessageId?: string) {
    const token = tokenStorage.getAccess();
    const assistantMsgId = existingMessageId || uid();

    if (existingMessageId) {
      // Update existing message (e.g. pending_review) to assistant type
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
              id: assistantMsgId,
              type: "assistant",
              content: "",
              thought: "", // Reset thought for the new stream
              isThinking: true,
            }
            : m
        )
      );
    } else {
      // Add a placeholder assistant message that we'll update
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, type: "assistant", content: "", isThinking: true },
      ]);
    }

    setIsStreaming(true);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...body, stream: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader available");

      const processSSELine = (line: string) => {
        if (!line.startsWith("data: ")) return;
        const dataStr = line.slice(6).trim();
        if (dataStr === "[DONE]") return;

        try {
          const data = JSON.parse(dataStr);
          console.log("[SSE Event]", data);

          const contentChunk = typeof data.content === "string" ? data.content : "";
          const fallbackContent = data.response || data.summary || "";

          if (data.type === "thought") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId && m.type === "assistant"
                  ? { ...m, thought: (m.thought || "") + contentChunk, isThinking: true }
                  : m
              )
            );
          } else if (data.type === "content" || data.type === "response" || data.type === "summary") {
            const newContent = contentChunk || fallbackContent;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId && m.type === "assistant"
                  ? { ...m, content: m.content + newContent, isThinking: false }
                  : m
              )
            );
          } else if (data.type === "sources") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId && m.type === "assistant"
                  ? { ...m, ragSources: data.content || data.sources || [] }
                  : m
              )
            );
          } else if (data.type === "execution_result") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId && m.type === "assistant"
                  ? { ...m, executionResult: data.content || data.result }
                  : m
              )
            );
          } else if (data.type === "status") {
            if (data.content === "pending_review") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                      id: m.id,
                      type: "pending_review",
                      plan: data.plan,
                      planId: data.plan_id,
                      steps: data.steps || [],
                      confidence: data.confidence ?? 1.0,
                      threadId: data.thread_id,
                      planMetadata: data.plan_metadata,
                      resolved: false,
                    }
                    : m
                )
              );
            } else if (data.content === "pending_clarification") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? {
                      id: m.id,
                      type: "pending_clarification",
                      threadId: data.thread_id,
                      requiredInputs: data.required_inputs || [],
                      resolved: false,
                    }
                    : m
                )
              );
            } else if (data.content === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId && m.type === "assistant"
                    ? { ...m, isThinking: false }
                    : m
                )
              );
            } else if (data.content === "error") {
              toast.error(data.details || "An error occurred.");
            }
          } else if (data.type === "done") {
            setConversationId(data.conversation_id);
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId && m.type === "assistant"
                  ? {
                    ...m,
                    isThinking: false,
                    ragSources: m.ragSources || data.rag_sources || data.sources
                  }
                  : m
              )
            );
          } else if (data.type === "error") {
            toast.error(data.content || "An error occurred during streaming.");
          }
        } catch (e) {
          console.error("Error parsing SSE data", e);
        }
      };

      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in buffer

        for (const line of lines) {
          processSSELine(line);
        }
      }

      // Handle any remaining content in the buffer
      if (buffer.trim()) {
        processSSELine(buffer);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message. Please try again.");
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
    } finally {
      setIsStreaming(false);
    }
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || isBusy) return;

    // Use the same base URL as our axios client
    const endpoint = `${apiClient.defaults.baseURL}/chat`;

    setInput("");
    setMessages((prev) => [...prev, { id: uid(), type: "user", content }]);

    await runStream(endpoint, {
      messages: [{ role: "user", content }],
      app_instance_id: (mode === "agent" || mode === "plan") ? (selectedInstanceId || undefined) : undefined,
      conversation_id: conversationId,
      mode: mode,
    });
  }

  async function handleApprove(threadId: string, messageId: string, feedback?: string) {
    const endpoint = `${apiClient.defaults.baseURL}/chat/resume`;

    if (feedback) {
      setMessages((prev) => [...prev, { id: uid(), type: "user", content: feedback }]);
      // If we have feedback, it's better to show as a new message chain
      await runStream(endpoint, {
        thread_id: threadId,
        approved: true,
        feedback,
      });
    } else {
      // If no feedback, we can reuse the message ID to show the response in place
      markResolved(messageId);
      await runStream(endpoint, {
        thread_id: threadId,
        approved: true,
      }, messageId);
    }
  }

  async function handleReject(threadId: string, messageId: string, feedback?: string) {
    markResolved(messageId);
    const endpoint = `${apiClient.defaults.baseURL}/chat/resume`;

    if (feedback) {
      setMessages((prev) => [...prev, { id: uid(), type: "user", content: feedback }]);
    }

    await runStream(endpoint, {
      thread_id: threadId,
      approved: false,
      feedback,
    });
  }

  async function handleClarify(threadId: string, messageId: string, answers: Record<string, { selected_index: number | null; custom_answer: string | null }>) {
    const endpoint = `${apiClient.defaults.baseURL}/chat/clarify`;
    markResolved(messageId, "pending_clarification");
    await runStream(endpoint, {
      thread_id: threadId,
      answers,
    }, messageId);
  }

  function markResolved(id: string, type: "pending_review" | "pending_clarification" = "pending_review") {
    setMessages((prev) =>
      prev.map((m) => (m.id === id && m.type === type ? { ...m, resolved: true } : m))
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
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
                  thought={msg.thought}
                  isThinking={msg.isThinking}
                  ragSources={msg.ragSources}
                  executionResult={msg.executionResult}
                />
              );
            }
            if (msg.type === "pending_review" && !msg.resolved) {
              return (
                <HitlReviewCard
                  key={msg.id}
                  plan={msg.plan}
                  steps={msg.steps}
                  confidence={msg.confidence}
                  planMetadata={msg.planMetadata}
                  isLoading={isBusy}
                  onApprove={(feedback) => handleApprove(msg.threadId, msg.id, feedback)}
                  onReject={(feedback) => handleReject(msg.threadId, msg.id, feedback)}
                />
              );
            }
            if (msg.type === "pending_clarification" && !msg.resolved) {
              return (
                <ClarificationCarousel
                  key={msg.id}
                  inputs={msg.requiredInputs}
                  isLoading={isBusy}
                  onSubmit={(answers) => handleClarify(msg.threadId, msg.id, answers)}
                />
              );
            }
            // Resolved pending_review — show a subtle indicator
            if ((msg.type === "pending_review" || msg.type === "pending_clarification") && msg.resolved) {
              return (
                <p key={msg.id} className="text-center text-xs text-muted-foreground italic">
                  {msg.type === "pending_review" ? "Plan reviewed" : "Inputs provided"} — waiting for agent response…
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
      <div className="flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all">
        <div className="px-4 pt-3 pb-1">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasPendingInterrupt
                ? "Please address the clarification above before sending a new message…"
                : mode === "agent"
                  ? "Ask the agent anything..."
                  : mode === "plan"
                    ? "Ask to create a plan..."
                    : "Ask anything..."
            }
            rows={2}
            className="w-full resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-base min-h-[60px]"
            disabled={isBusy || hasPendingInterrupt}
          />
        </div>

        <div className="flex items-center justify-between px-3 py-2 bg-muted/30 border-t border-border/50">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {/* Mode Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <Button variant="ghost" size="sm" className="h-8 px-2.5 gap-1.5 text-xs font-medium rounded-lg hover:bg-muted bg-muted/50">
                  {mode === "ask" ? (
                    <MessageSquare className="h-3.5 w-3.5" />
                  ) : mode === "plan" ? (
                    <Sparkles className="h-3.5 w-3.5" />
                  ) : (
                    <BrainCircuit className="h-3.5 w-3.5" />
                  )}
                  {mode === "ask" ? "Ask" : mode === "plan" ? "Plan" : "Agent"}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              } />
              <DropdownMenuContent align="start" className="min-w-[120px]">
                <DropdownMenuItem onClick={() => setMode("ask")} className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Ask Mode</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("plan")} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Plan Mode</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("agent")} className="gap-2">
                  <BrainCircuit className="h-4 w-4" />
                  <span>Agent Mode</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Instance Selector (Agent/Plan mode) */}
            {(mode === "agent" || mode === "plan") && (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger render={
                  <Button
                    variant="ghost"
                    size="sm"
                    role="combobox"
                    className="h-8 px-2.5 gap-1.5 text-xs font-medium rounded-lg hover:bg-muted bg-muted/50 max-w-[200px]"
                  >
                    <Bot className="h-3.5 w-3.5" />
                    <span className="truncate">
                      {selectedInstanceId
                        ? instances?.find((inst) => inst.id === selectedInstanceId)?.name
                        : "Select Instance"}
                    </span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                } />
                <PopoverContent className="w-[240px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search instances..." className="h-9" />
                    <CommandList>
                      <CommandEmpty>No instance found.</CommandEmpty>
                      <CommandGroup>
                        {instances?.map((inst) => (
                          <CommandItem
                            key={inst.id}
                            value={inst.name}
                            onSelect={() => {
                              handleInstanceChange(inst.id);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedInstanceId === inst.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {inst.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}

            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted">
              <Plus className="h-4 w-4" />
              <span className="sr-only">Extra options</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg hidden sm:flex">
              gpt-oss:20b
              <ChevronDown className="h-3 w-3 opacity-50 ml-1" />
            </Button>
            <Button
              size="icon"
              variant="default"
              onClick={handleSend}
              disabled={!input.trim() || isBusy || hasPendingInterrupt}
              className="h-8 w-8 rounded-lg shrink-0"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
