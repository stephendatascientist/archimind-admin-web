import { useQuery } from "@tanstack/react-query";
import { listJobs } from "../api/jobs";

export const JOB_KEYS = {
  all: ["jobs"] as const,
};

export function useJobs() {
  return useQuery({
    queryKey: JOB_KEYS.all,
    queryFn: listJobs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
