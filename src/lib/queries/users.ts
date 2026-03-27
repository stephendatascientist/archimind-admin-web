import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, deleteUser, getUser, listUsers, updateProfile, updateUser } from "../api/users";
import type { AdminUserCreate, AdminUserUpdate, UserProfileUpdate } from "../types/api";

export const USER_KEYS = {
  all: ["users"] as const,
  list: (params?: { skip?: number; limit?: number }) => ["users", "list", params] as const,
  item: (id: string) => ["users", id] as const,
};

export function useUsers(params?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: USER_KEYS.list(params),
    queryFn: () => listUsers(params),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminUserCreate) => createUser(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: USER_KEYS.item(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: AdminUserUpdate }) =>
      updateUser(userId, payload),
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: USER_KEYS.all });
      qc.invalidateQueries({ queryKey: USER_KEYS.item(userId) });
      qc.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: USER_KEYS.all }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserProfileUpdate) => updateProfile(payload),
    onSuccess: (updatedUser) => {
      qc.invalidateQueries({ queryKey: USER_KEYS.all });
      qc.invalidateQueries({ queryKey: USER_KEYS.item(updatedUser.id) });
      qc.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}
