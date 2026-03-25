import { apiClient } from "./client";
import type {
  AppInstanceAccessEntry,
  AppInstanceAccessGrant,
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
  const { data } = await apiClient.put<AppInstanceResponse>(`/app-instances/${id}`, payload);
  return data;
}

export async function deleteInstance(id: string): Promise<void> {
  await apiClient.delete(`/app-instances/${id}`);
}

export async function listInstanceAccess(
  instanceId: string,
): Promise<AppInstanceAccessEntry[]> {
  const { data } = await apiClient.get<AppInstanceAccessEntry[]>(
    `/app-instances/${instanceId}/access`,
  );
  return data;
}

export async function grantInstanceAccess(
  instanceId: string,
  payload: AppInstanceAccessGrant,
): Promise<void> {
  await apiClient.post(`/app-instances/${instanceId}/access`, payload);
}

export async function revokeInstanceAccess(
  instanceId: string,
  accessorType: string,
  accessorId: string,
): Promise<void> {
  await apiClient.delete(
    `/app-instances/${instanceId}/access/${accessorType}/${accessorId}`,
  );
}
