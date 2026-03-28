import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInstance,
  deleteInstance,
  getInstance,
  listInstances,
  updateInstance,
} from "../api/app-instances";
import type {
  AppInstanceCreate,
  AppInstanceListParams,
  AppInstanceUpdate,
} from "../types/api";

export const INSTANCE_KEYS = {
  all: (params?: AppInstanceListParams) => ["app-instances", params ?? {}] as const,
  detail: (id: string) => ["app-instances", id] as const,
};

export function useInstances(params?: AppInstanceListParams) {
  return useQuery({
    queryKey: INSTANCE_KEYS.all(params),
    queryFn: () => listInstances({ limit: 200, ...params }),
  });
}

export function useInstance(id: string) {
  return useQuery({
    queryKey: INSTANCE_KEYS.detail(id),
    queryFn: () => getInstance(id),
    enabled: !!id,
  });
}

export function useCreateInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AppInstanceCreate) => createInstance(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["app-instances"] }),
  });
}

export function useUpdateInstance(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AppInstanceUpdate) => updateInstance(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["app-instances"] });
      qc.invalidateQueries({ queryKey: INSTANCE_KEYS.detail(id) });
    },
  });
}

export function useDeleteInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteInstance(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["app-instances"] }),
  });
}

