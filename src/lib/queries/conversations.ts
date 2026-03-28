import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listConversations,
  getConversation,
  deleteConversation,
  renameConversation,
  listAllConversations,
  getAnyConversation,
  deleteAnyConversation,
} from "../api/conversations";
import type { ConversationResponse, ConversationWithMessages, AdminConversation } from "../types/api";

export interface ConversationListParams {
  skip?: number;
  limit?: number;
  user_id?: string;
}

export const CONVERSATION_KEYS = {
  all: (params?: ConversationListParams) => ["conversations", params ?? {}] as const,
  adminAll: (params?: ConversationListParams) => ["admin", "conversations", params ?? {}] as const,
  detail: (id: string) => ["conversations", id] as const,
  adminDetail: (id: string) => ["admin", "conversations", id] as const,
};

export function useConversations(params?: ConversationListParams) {
  return useQuery({
    queryKey: CONVERSATION_KEYS.all(params),
    queryFn: () => listConversations(params),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: CONVERSATION_KEYS.detail(id),
    queryFn: () => getConversation(id),
    enabled: !!id,
  });
}

export function useRenameConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameConversation(id, title),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_KEYS.all() });
      queryClient.invalidateQueries({ queryKey: CONVERSATION_KEYS.detail(id) });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_KEYS.all() });
      queryClient.removeQueries({ queryKey: CONVERSATION_KEYS.detail(conversationId) });
    },
  });
}

// ── Admin Oversight Hooks ─────────────────────────────────────

export function useAllConversations(params?: ConversationListParams) {
  return useQuery({
    queryKey: CONVERSATION_KEYS.adminAll(params),
    queryFn: () => listAllConversations(params),
  });
}

export function useAnyConversation(id: string) {
  return useQuery({
    queryKey: CONVERSATION_KEYS.adminDetail(id),
    queryFn: () => getAnyConversation(id),
    enabled: !!id,
  });
}

export function useDeleteAnyConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAnyConversation,
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATION_KEYS.adminAll() });
      queryClient.removeQueries({ queryKey: CONVERSATION_KEYS.adminDetail(conversationId) });
    },
  });
}
