import { apiClient } from "./client";
import type { DocumentListParams, DocumentResponse } from "../types/api";

export async function listDocuments(params: DocumentListParams = {}): Promise<DocumentResponse[]> {
  const { data } = await apiClient.get<DocumentResponse[]>("/documents/", { params });
  return data;
}

export async function uploadDocument(
  file: File,
  source_type: string,
  source_id: string
): Promise<DocumentResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("source_type", source_type);
  form.append("source_id", source_id);
  const { data } = await apiClient.post<DocumentResponse>("/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`/documents/${id}`);
}
