import { apiClient } from "./client";

export interface ScheduledJob {
  name: string;
  schedule: string;
}

export async function listJobs(): Promise<ScheduledJob[]> {
  const { data } = await apiClient.get<ScheduledJob[]>("/jobs");
  return data;
}
