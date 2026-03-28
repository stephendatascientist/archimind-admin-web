import { apiClient } from "./client";
import type { ProviderModels } from "../types/api";

export async function listModels(): Promise<ProviderModels[]> {
  const { data } = await apiClient.get<ProviderModels[]>("/models");
  return data;
}

export async function listModelsByProvider(provider: string): Promise<ProviderModels> {
  const { data } = await apiClient.get<ProviderModels>(`/models/${encodeURIComponent(provider)}`);
  return data;
}
