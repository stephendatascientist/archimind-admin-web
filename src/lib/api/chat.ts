import { apiClient } from "./client";
import type { ChatRequest, ChatResponse, ResumeRequest } from "../types/api";

export async function sendMessage(payload: ChatRequest): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/chat", payload);
  return data;
}

export async function resumeWorkflow(payload: ResumeRequest): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>("/chat/resume", payload);
  return data;
}
