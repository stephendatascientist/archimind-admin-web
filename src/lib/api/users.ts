import { apiClient } from "./client";
import { AdminUserCreate, AdminUserUpdate, UserProfileUpdate, UserResponse } from "../types/api";

export async function listUsers(params?: {
  skip?: number;
  limit?: number;
}): Promise<UserResponse[]> {
  const { data } = await apiClient.get<UserResponse[]>("/admin/users", { params });
  return data;
}

export async function getUser(userId: string): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>(`/admin/users/${userId}`);
  return data;
}

export async function updateUser(
  userId: string,
  payload: AdminUserUpdate,
): Promise<UserResponse> {
  const { data } = await apiClient.patch<UserResponse>(`/admin/users/${userId}`, payload);
  return data;
}

export async function deleteUser(userId: string): Promise<void> {
  await apiClient.delete(`/admin/users/${userId}`);
}

export async function updateProfile(payload: UserProfileUpdate): Promise<UserResponse> {
  const { data } = await apiClient.patch<UserResponse>("/users/me/profile", payload);
  return data;
}

export async function createUser(payload: AdminUserCreate): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>("/admin/users", payload);
  return data;
}
