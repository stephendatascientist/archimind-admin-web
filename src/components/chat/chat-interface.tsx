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
  MoreVertical,
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
import { useModels } from "@/lib/queries/models";
import { apiClient, tokenStorage } from "@/lib/api/client";
import { streamChat } from "@/lib/api/chat";
import { cn } from "@/lib/utils";
import type { ClarificationInput, PlanMetadata, PlanStep, RagSource, SupersetExecutionResult, ConversationWithMessages, UIMessage } from "@/lib/types/api";
import { MessageBubble } from "./message-bubble";
import { HitlReviewCard } from "./hitl-review-card";
import { ClarificationCarousel } from "./clarification-carousel";


function uid() {
  return Math.random().toString(36).slice(2);
}

interface ChatInterfaceProps {
  initialInstanceId?: string;
  conversationId?: string;
  onConversationIdChange?: (id: string | undefined) => void;
}

export function ChatInterface({ initialInstanceId, conversationId: externalConversationId, onConversationIdChange }: ChatInterfaceProps) {
  const { data: instances, isLoading: instancesLoading } = useInstances();
  const { data: providerModels } = useModels();
  const [selectedInstanceId, setSelectedInstanceId] = useState(initialInstanceId ?? "");
  const [selectedModel, setSelectedModel] = useState<string | undefined>();
  const [mode, setMode] = useState<"ask" | "plan" | "agent">("ask");
  const [open, setOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(externalConversationId);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Sync with external conversationId
  useEffect(() => {
    setConversationId(externalConversationId);
    if (externalConversationId) {
      loadConversationMessages(externalConversationId);
    } else {
      setMessages([]);
    }
  }, [externalConversationId]);

  async function loadConversationMessages(id: string) {
    setIsLoadingMessages(true);
    try {
      const resp = await apiClient.get<ConversationWithMessages>(`/conversations/${id}`);
      const uiMsgs: UIMessage[] = resp.data.messages.map((m: any) => ({
        id: uid(),
        type: m.role as any,
        content: m.content,
      }));
      setMessages(uiMsgs);
      if (resp.data.app_instance_id) setSelectedInstanceId(resp.data.app_instance_id);
    } catch (err) {
      console.error("Failed to load messages", err);
      toast.error("Failed to load conversation messages");
    } finally {
      setIsLoadingMessages(false);
    }
  }

  const isBusy = isStreaming || isLoadingMessages;
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
    console.log("[runStream] Starting with endpoint:", endpoint, "conversationId:", body.conversation_id);
    const assistantMsgId = existingMessageId || uid();

    if (existingMessageId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
              id: assistantMsgId,
              type: "assistant",
              content: "",
              thought: "",
              isThinking: true,
            }
            : m
        )
      );
    } else {
      setMessages((prev) => [
        ...prev,
        { id: assistantMsgId, type: "assistant", content: "", isThinking: true },
      ]);
    }

    setIsStreaming(true);
    try {
      await streamChat(endpoint, body, (event) => {
        console.log("[SSE Event]", event);

        if (event.conversation_id) {
          console.log("[SSE Event] Received conversation_id:", event.conversation_id);
          setConversationId(event.conversation_id);
          onConversationIdChange?.(event.conversation_id);
        }

        if (event.type === "thought") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId && m.type === "assistant"
                ? { ...m, thought: (m.thought || "") + (event.content || ""), isThinking: true }
                : m
            )
          );
        } else if (event.type === "content") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId && m.type === "assistant"
                ? { ...m, content: (m.content || "") + (event.content || ""), isThinking: false }
                : m
            )
          );
        } else if (event.type === "sources") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId && m.type === "assistant"
                ? { ...m, ragSources: event.content || [] }
                : m
            )
          );
        } else if (event.type === "execution_result") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId && m.type === "assistant"
                ? { ...m, executionResult: event.content || event.result }
                : m
            )
          );
        } else if (event.type === "status") {
          if (event.content === "pending_review") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                    id: m.id,
                    type: "pending_review",
                    plan: event.plan,
                    planId: event.plan_id,
                    steps: event.steps || [],
                    confidence: event.confidence ?? 1.0,
                    threadId: event.thread_id,
                    planMetadata: event.plan_metadata,
                    resolved: false,
                  }
                  : m
              )
            );
          } else if (event.content === "pending_clarification") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                    id: m.id,
                    type: "pending_clarification",
                    threadId: event.thread_id,
                    requiredInputs: event.required_inputs || [],
                    resolved: false,
                  }
                  : m
              )
            );
          } else if (event.content === "done") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId && m.type === "assistant"
                  ? { ...m, isThinking: false }
                  : m
              )
            );
          }
        } else if (event.type === "error") {
          toast.error(event.content?.message || "An error occurred.");
        } else if (event.type === "done") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId && m.type === "assistant"
                ? {
                  ...m,
                  isThinking: false,
                  ragSources: m.ragSources || event.rag_sources || event.sources
                }
                : m
            )
          );
        }
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to send message. Please try again.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantMsgId));
    } finally {
      setIsStreaming(false);
    }
  }

  async function handleSend() {
    const content = input.trim();
    if (!content || isBusy) return;

    const endpoint = `/chat`;

    setInput("");
    setMessages((prev) => [...prev, { id: uid(), type: "user", content }]);

    console.log("[handleSend] Current conversationId state:", conversationId);
    await runStream(endpoint, {
      messages: [{ role: "user", content }],
      app_instance_id: (mode === "agent" || mode === "plan") ? (selectedInstanceId || undefined) : undefined,
      conversation_id: conversationId,
      mode: mode,
      model: selectedModel,
    });
  }

  async function handleApprove(threadId: string, messageId: string, feedback?: string) {
    const endpoint = `/chat/resume`;

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
    const endpoint = `/chat/resume`;

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
    const endpoint = `/chat/clarify`;
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
            {/* Model Selector */}
            <Popover open={modelOpen} onOpenChange={setModelOpen}>
              <PopoverTrigger render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2.5 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg hidden sm:flex gap-1.5"
                >
                  {selectedModel ?? "Default model"}
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              } />
              <PopoverContent className="w-[260px] p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search models..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No models found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="__default__"
                        onSelect={() => { setSelectedModel(undefined); setModelOpen(false); }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", !selectedModel ? "opacity-100" : "opacity-0")} />
                        Default (server)
                      </CommandItem>
                    </CommandGroup>
                    {providerModels?.map((group) => (
                      <CommandGroup key={group.provider} heading={group.provider}>
                        {group.models.map((m) => {
                          const value = `${group.provider}/${m.id}`;
                          return (
                            <CommandItem
                              key={value}
                              value={value}
                              onSelect={() => { setSelectedModel(value); setModelOpen(false); }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", selectedModel === value ? "opacity-100" : "opacity-0")} />
                              {m.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
