import { apiClient } from "./client";
import type {
  AppInstanceCreate,
  AppInstanceListParams,
  AppInstanceResponse,
  AppInstanceUpdate,
} from "../types/api";

export async function listInstances(params: AppInstanceListParams = {}): Promise<AppInstanceResponse[]> {
  const { data } = await apiClient.get<AppInstanceResponse[]>("/app-instances/", { params });
  return data;
}

export async function getInstance(id: string): Promise<AppInstanceResponse> {
  const { data } = await apiClient.get<AppInstanceResponse>(`/app-instances/${id}`);
  return data;
}

export async function createInstance(payload: AppInstanceCreate): Promise<AppInstanceResponse> {
  const { data } = await apiClient.post<AppInstanceResponse>("/app-instances/", payload);
  return data;
}

export async function updateInstance(id: string, payload: AppInstanceUpdate): Promise<AppInstanceResponse> {
  const { data } = await apiClient.patch<AppInstanceResponse>(`/app-instances/${id}`, payload);
  return data;
}

export async function deleteInstance(id: string): Promise<void> {
  await apiClient.delete(`/app-instances/${id}`);
}

