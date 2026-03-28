import { useQuery } from "@tanstack/react-query";
import { listModels } from "../api/models";

export const MODEL_KEYS = {
  all: ["models"] as const,
};

export function useModels() {
  return useQuery({
    queryKey: MODEL_KEYS.all,
    queryFn: listModels,
    staleTime: 5 * 60 * 1000, // cached for 5 minutes (matches API cache)
  });
}
