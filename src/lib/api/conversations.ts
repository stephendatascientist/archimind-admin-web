import { apiClient } from "./client";

export interface ConversationResponse {
  id: string;
  user_id: string;
  app_instance_id: string | null;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithMessages extends ConversationResponse {
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
}

export async function listConversations(params?: {
  skip?: number;
  limit?: number;
}): Promise<ConversationResponse[]> {
  const { data } = await apiClient.get<ConversationResponse[]>("/conversations", { params });
  return data;
}

export async function getConversation(conversationId: string): Promise<ConversationWithMessages> {
  const { data } = await apiClient.get<ConversationWithMessages>(`/conversations/${conversationId}`);
  return data;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  await apiClient.delete(`/conversations/${conversationId}`);
}
