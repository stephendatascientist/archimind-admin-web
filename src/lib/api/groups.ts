import { apiClient } from "./client";
import type {
  GroupCreate,
  GroupResponse,
  GroupUpdate,
  AppInstanceAccessResponse,
  AppInstanceAccessCreate,
  AppInstanceAccessUpdate,
  UserResponse
} from "../types/api";

export async function listGroups(): Promise<GroupResponse[]> {
  const { data } = await apiClient.get<GroupResponse[]>("/admin/groups");
  return data;
}

export async function createGroup(payload: GroupCreate): Promise<GroupResponse> {
  const { data } = await apiClient.post<GroupResponse>("/admin/groups", payload);
  return data;
}

export async function updateGroup(groupId: string, payload: GroupUpdate): Promise<GroupResponse> {
  const { data } = await apiClient.patch<GroupResponse>(`/admin/groups/${groupId}`, payload);
  return data;
}

export async function deleteGroup(groupId: string): Promise<void> {
  await apiClient.delete(`/admin/groups/${groupId}`);
}

// ── App Instance Access ───────────────────────────────────────

export async function listGroupAccess(groupId: string): Promise<AppInstanceAccessResponse[]> {
  const { data } = await apiClient.get<AppInstanceAccessResponse[]>(`/admin/groups/${groupId}/app-instance-access`);
  return data;
}

export async function grantGroupAccess(groupId: string, payload: AppInstanceAccessCreate): Promise<AppInstanceAccessResponse> {
  const { data } = await apiClient.post<AppInstanceAccessResponse>(`/admin/groups/${groupId}/app-instance-access`, payload);
  return data;
}

export async function updateGroupAccess(
  groupId: string,
  instanceId: string,
  payload: AppInstanceAccessUpdate
): Promise<AppInstanceAccessResponse> {
  const { data } = await apiClient.patch<AppInstanceAccessResponse>(
    `/admin/groups/${groupId}/app-instance-access/${instanceId}`,
    payload
  );
  return data;
}

export async function revokeGroupAccess(groupId: string, instanceId: string): Promise<void> {
  await apiClient.delete(`/admin/groups/${groupId}/app-instance-access/${instanceId}`);
}

// ── User Assignments ──────────────────────────────────────────

export async function listGroupUsers(groupId: string): Promise<UserResponse[]> {
  const { data } = await apiClient.get<UserResponse[]>(`/admin/groups/${groupId}/users`);
  return data;
}

export async function assignUserToGroup(groupId: string, userId: string): Promise<void> {
  await apiClient.post(`/admin/groups/${groupId}/users`, { user_id: userId });
}

export async function removeUserFromGroup(groupId: string, userId: string): Promise<void> {
  await apiClient.delete(`/admin/groups/${groupId}/users/${userId}`);
}
