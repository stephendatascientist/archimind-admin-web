import { useMutation } from "@tanstack/react-query";
import { resumeWorkflow, sendMessage } from "../api/chat";
import type { ChatRequest, ResumeRequest } from "../types/api";

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
