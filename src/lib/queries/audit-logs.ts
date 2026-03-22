import { useQuery } from "@tanstack/react-query";
import { getAuditLogsByUser, getAuditLogsByResource } from "../api/audit-logs";
import type { AuditLogListParams } from "../types/api";

export const AUDIT_KEYS = {
  byUser: (userId: string, params: AuditLogListParams) =>
    ["audit", "user", userId, params] as const,
  byResource: (resourceType: string, resourceId: string, params: AuditLogListParams) =>
    ["audit", "resource", resourceType, resourceId, params] as const,
};

export function useAuditLogsByUser(userId: string, params: AuditLogListParams = {}) {
  return useQuery({
    queryKey: AUDIT_KEYS.byUser(userId, params),
    queryFn: () => getAuditLogsByUser(userId, params),
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export function useAuditLogsByResource(
  resourceType: string,
  resourceId: string,
  params: AuditLogListParams = {},
  enabled = true
) {
  return useQuery({
    queryKey: AUDIT_KEYS.byResource(resourceType, resourceId, params),
    queryFn: () => getAuditLogsByResource(resourceType, resourceId, params),
    enabled: enabled && !!resourceType && !!resourceId,
    staleTime: 30 * 1000,
  });
}
