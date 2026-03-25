"use client";

import { useCallback } from "react";
import { tokenStorage } from "../api/client";
import { login as apiLogin, logout as apiLogout } from "../api/auth";
import type { LoginRequest } from "../types/api";

export function useAuth() {
  const isAuthenticated = useCallback(() => {
    if (typeof window === "undefined") return false;
    return !!tokenStorage.getAccess();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    const tokens = await apiLogin(credentials);
    return tokens;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
  }, []);

  return { isAuthenticated, login, logout };
}
