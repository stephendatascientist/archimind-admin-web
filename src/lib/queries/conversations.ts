import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listConversations,
  getConversation,
  deleteConversation,
} from "../api/conversations";
import type { ConversationResponse, ConversationWithMessages } from "../api/conversations";

export interface ConversationListParams {
  skip?: number;
  limit?: number;
}

export const CONVERSATION_KEYS = {
  all: (params?: ConversationListParams) => ["conversations", params ?? {}] as const,
  detail: (id: string) => ["conversations", id] as const,
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
