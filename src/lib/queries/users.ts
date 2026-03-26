import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser, getUser, listUsers, updateUser } from "../api/users";
import type { AdminUserUpdate } from "../types/api";

export const USER_KEYS = {
  all: ["users"] as const,
  item: (id: string) => ["users", id] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: USER_KEYS.all,
    queryFn: () => listUsers(),
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
