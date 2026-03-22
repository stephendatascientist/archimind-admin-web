import { apiClient } from "./client";
import type { AuditLogResponse, AuditLogListParams } from "../types/api";

export async function getAuditLogsByUser(
  userId: string,
  params: AuditLogListParams = {}
): Promise<AuditLogResponse[]> {
  const { data } = await apiClient.get<AuditLogResponse[]>(
    `/audit/user/${userId}`,
    { params }
  );
  return data;
}

export async function getAuditLogsByResource(
  resourceType: string,
  resourceId: string,
  params: AuditLogListParams = {}
): Promise<AuditLogResponse[]> {
  const { data } = await apiClient.get<AuditLogResponse[]>(
    `/audit/resource/${encodeURIComponent(resourceType)}/${resourceId}`,
    { params }
  );
  return data;
}
