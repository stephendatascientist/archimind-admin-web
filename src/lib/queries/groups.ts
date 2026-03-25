import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignUserToGroup,
  createGroup,
  deleteGroup,
  listGroups,
  removeUserFromGroup,
} from "../api/groups";
import type { GroupCreate } from "../types/api";

export const GROUP_KEYS = {
  all: ["groups"] as const,
};

export function useGroups() {
  return useQuery({
    queryKey: GROUP_KEYS.all,
    queryFn: listGroups,
  });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: GroupCreate) => createGroup(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: GROUP_KEYS.all }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => deleteGroup(name),
    onSuccess: () => qc.invalidateQueries({ queryKey: GROUP_KEYS.all }),
  });
}

export function useAssignUserToGroup() {
  return useMutation({
    mutationFn: ({ userId, groupName }: { userId: string; groupName: string }) =>
      assignUserToGroup(userId, groupName),
  });
}

export function useRemoveUserFromGroup() {
  return useMutation({
    mutationFn: ({ userId, groupName }: { userId: string; groupName: string }) =>
      removeUserFromGroup(userId, groupName),
  });
}
