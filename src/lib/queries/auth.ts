import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, updateInstructions } from "../api/auth";
import type { UpdateInstructionsRequest } from "../types/api";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateInstructions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateInstructionsRequest) => updateInstructions(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["user", "me"] }),
  });
}
