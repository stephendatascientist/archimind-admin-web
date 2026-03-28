import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignUserToGroup,
  createGroup,
  deleteGroup,
  grantGroupAccess,
  listGroupAccess,
  listGroups,
  listGroupUsers,
  removeUserFromGroup,
  revokeGroupAccess,
  updateGroup,
  updateGroupAccess,
} from "../api/groups";
import type {
  AppInstanceAccessCreate,
  AppInstanceAccessUpdate,
  GroupCreate,
  GroupUpdate
} from "../types/api";

export const GROUP_KEYS = {
  all: ["groups"] as const,
  users: (groupId: string) => ["groups", groupId, "users"] as const,
  access: (groupId: string) => ["groups", groupId, "access"] as const,
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

export function useUpdateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, payload }: { groupId: string; payload: GroupUpdate }) =>
      updateGroup(groupId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: GROUP_KEYS.all }),
  });
}

export function useDeleteGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (groupId: string) => deleteGroup(groupId),
    onSuccess: () => qc.invalidateQueries({ queryKey: GROUP_KEYS.all }),
  });
}

// ── Group Users ───────────────────────────────────────────────

export function useGroupUsers(groupId: string) {
  return useQuery({
    queryKey: GROUP_KEYS.users(groupId),
    queryFn: () => listGroupUsers(groupId),
    enabled: !!groupId,
  });
}

export function useAssignUserToGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, groupId }: { userId: string; groupId: string }) =>
      assignUserToGroup(groupId, userId),
    onSuccess: (_, { groupId }) =>
      qc.invalidateQueries({ queryKey: GROUP_KEYS.users(groupId) }),
  });
}

export function useRemoveUserFromGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, groupId }: { userId: string; groupId: string }) =>
      removeUserFromGroup(groupId, userId),
    onSuccess: (_, { groupId }) =>
      qc.invalidateQueries({ queryKey: GROUP_KEYS.users(groupId) }),
  });
}

// ── Group Access ──────────────────────────────────────────────

export function useGroupAccess(groupId: string) {
  return useQuery({
    queryKey: GROUP_KEYS.access(groupId),
    queryFn: () => listGroupAccess(groupId),
    enabled: !!groupId,
  });
}

export function useGrantGroupAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, payload }: { groupId: string; payload: AppInstanceAccessCreate }) =>
      grantGroupAccess(groupId, payload),
    onSuccess: (_, { groupId }) =>
      qc.invalidateQueries({ queryKey: GROUP_KEYS.access(groupId) }),
  });
}

export function useUpdateGroupAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, instanceId, payload }: { groupId: string; instanceId: string; payload: AppInstanceAccessUpdate }) =>
      updateGroupAccess(groupId, instanceId, payload),
    onSuccess: (_, { groupId }) =>
      qc.invalidateQueries({ queryKey: GROUP_KEYS.access(groupId) }),
  });
}

export function useRevokeGroupAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, instanceId }: { groupId: string; instanceId: string }) =>
      revokeGroupAccess(groupId, instanceId),
    onSuccess: (_, { groupId }) =>
      qc.invalidateQueries({ queryKey: GROUP_KEYS.access(groupId) }),
  });
}
