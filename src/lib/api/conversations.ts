import { apiClient } from "./client";
import type { ConversationResponse, ConversationWithMessages, AdminConversation } from "../types/api";

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

export async function renameConversation(conversationId: string, title: string): Promise<ConversationResponse> {
  const { data } = await apiClient.patch<ConversationResponse>(`/conversations/${conversationId}`, { title });
  return data;
}

// ── Admin Oversight ───────────────────────────────────────────

export async function listAllConversations(params?: {
  skip?: number;
  limit?: number;
  user_id?: string;
}): Promise<AdminConversation[]> {
  const { data } = await apiClient.get<AdminConversation[]>("/admin/conversations", { params });
  return data;
}

export async function getAnyConversation(conversationId: string): Promise<ConversationWithMessages> {
  const { data } = await apiClient.get<ConversationWithMessages>(`/admin/conversations/${conversationId}`);
  return data;
}

export async function deleteAnyConversation(conversationId: string): Promise<void> {
  await apiClient.delete(`/admin/conversations/${conversationId}`);
}
