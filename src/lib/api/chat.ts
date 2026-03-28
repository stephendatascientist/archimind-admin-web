import { apiClient, tokenStorage } from "./client";
import type { ChatRequest, ChatResponse, ResumeRequest, ClarifyRequest } from "../types/api";

export async function sendMessage(payload: ChatRequest): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/chat", payload);
  return data;
}

export async function resumeWorkflow(payload: ResumeRequest): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/chat/resume", payload);
  return data;
}

export async function sendClarification(payload: ClarifyRequest): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/chat/clarify", payload);
  return data;
}

export interface SSEEvent {
  type: "thought" | "content" | "sources" | "status" | "error" | "done" | "execution_result";
  content?: any;
  [key: string]: any;
}

export async function streamChat(
  endpoint: string,
  request: any,
  onEvent: (event: SSEEvent) => void
) {
  const token = tokenStorage.getAccess();
  const response = await fetch(`${apiClient.defaults.baseURL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ ...request, stream: true }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to start stream");
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) throw new Error("No reader available");

  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data: ")) continue;

      const payload = trimmed.slice(6);
      if (payload === "[DONE]") {
        onEvent({ type: "done" });
        return;
      }

      try {
        onEvent(JSON.parse(payload));
      } catch (e) {
        console.error("Error parsing SSE payload", e);
      }
    }
  }
}
