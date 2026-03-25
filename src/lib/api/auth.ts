import { apiClient, tokenStorage } from "./client";
import type { LoginRequest, RegisterRequest, TokenResponse, UpdateInstructionsRequest, UserResponse } from "../types/api";

export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  const { data } = await apiClient.post<TokenResponse>("/auth/login", credentials);
  tokenStorage.set(data.access_token, data.refresh_token);
  return data;
}

export async function register(payload: RegisterRequest): Promise<UserResponse> {
  const { data } = await apiClient.post<UserResponse>("/auth/register", payload);
  return data;
}

export async function getMe(): Promise<UserResponse> {
  const { data } = await apiClient.get<UserResponse>("/users/me");
  return data;
}

export async function updateInstructions(payload: UpdateInstructionsRequest): Promise<UserResponse> {
  const { data } = await apiClient.put<UserResponse>("/users/me/instructions", payload);
  return data;
}

export function logout() {
  tokenStorage.clear();
  window.location.href = "/login";
}
