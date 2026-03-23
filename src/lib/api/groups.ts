import { apiClient } from "./client";
import type { GroupCreate, GroupResponse } from "../types/api";

export async function listGroups(): Promise<GroupResponse[]> {
  const { data } = await apiClient.get<GroupResponse[]>("/admin/groups");
  return data;
}

export async function createGroup(payload: GroupCreate): Promise<GroupResponse> {
  const { data } = await apiClient.post<GroupResponse>("/admin/groups", payload);
  return data;
}

export async function deleteGroup(name: string): Promise<void> {
  await apiClient.delete(`/admin/groups/${name}`);
}

export async function assignUserToGroup(userId: string, groupName: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/groups/${groupName}`);
}

export async function removeUserFromGroup(userId: string, groupName: string): Promise<void> {
  await apiClient.delete(`/admin/users/${userId}/groups/${groupName}`);
}
