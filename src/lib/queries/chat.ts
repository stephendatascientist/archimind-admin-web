import { useMutation } from "@tanstack/react-query";
import { resumeWorkflow, sendMessage, sendClarification } from "../api/chat";
import type { ChatRequest, ResumeRequest, ClarifyRequest } from "../types/api";

export function useSendMessage() {
  return useMutation({
    mutationFn: (payload: ChatRequest) => sendMessage(payload),
  });
}

export function useResumeWorkflow() {
  return useMutation({
    mutationFn: (payload: ResumeRequest) => resumeWorkflow(payload),
  });
}

export function useClarify() {
  return useMutation({
    mutationFn: (payload: ClarifyRequest) => sendClarification(payload),
  });
}
