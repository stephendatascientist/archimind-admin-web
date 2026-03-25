import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createApp, deleteApp, getApp, listApps, updateApp } from "../api/apps";
import type { AppCreate, AppUpdate } from "../types/api";

export const APP_KEYS = {
  all: ["apps"] as const,
  detail: (id: string) => ["apps", id] as const,
};

export function useApps() {
  return useQuery({
    queryKey: APP_KEYS.all,
    queryFn: () => listApps({ limit: 200 }),
  });
}

export function useApp(id: string) {
  return useQuery({
    queryKey: APP_KEYS.detail(id),
    queryFn: () => getApp(id),
    enabled: !!id,
  });
}

export function useCreateApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AppCreate) => createApp(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: APP_KEYS.all }),
  });
}

export function useUpdateApp(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AppUpdate) => updateApp(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: APP_KEYS.all });
      qc.invalidateQueries({ queryKey: APP_KEYS.detail(id) });
    },
  });
}

export function useDeleteApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApp(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: APP_KEYS.all }),
  });
}
