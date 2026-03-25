import { apiClient } from "./client";
import type { AppCreate, AppResponse, AppUpdate, ListParams } from "../types/api";

export async function listApps(params: ListParams = {}): Promise<AppResponse[]> {
  const { data } = await apiClient.get<AppResponse[]>("/apps/", { params });
  return data;
}

export async function getApp(id: string): Promise<AppResponse> {
  const { data } = await apiClient.get<AppResponse>(`/apps/${id}`);
  return data;
}

export async function createApp(payload: AppCreate): Promise<AppResponse> {
  const { data } = await apiClient.post<AppResponse>("/apps/", payload);
  return data;
}

export async function updateApp(id: string, payload: AppUpdate): Promise<AppResponse> {
  const { data } = await apiClient.put<AppResponse>(`/apps/${id}`, payload);
  return data;
}

export async function deleteApp(id: string): Promise<void> {
  await apiClient.delete(`/apps/${id}`);
}
