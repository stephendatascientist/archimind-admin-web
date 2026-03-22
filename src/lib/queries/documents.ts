import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDocument, listDocuments, uploadDocument } from "../api/documents";
import type { DocumentListParams } from "../types/api";

export const DOC_KEYS = {
  list: (params?: DocumentListParams) => ["documents", params ?? {}] as const,
};

export function useDocuments(params?: DocumentListParams) {
  return useQuery({
    queryKey: DOC_KEYS.list(params),
    queryFn: () => listDocuments(params),
    enabled: !!params?.source_id,
  });
}

export function useUploadDocument(params?: DocumentListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, source_type, source_id }: { file: File; source_type: string; source_id: string }) =>
      uploadDocument(file, source_type, source_id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}

export function useDeleteDocument(params?: DocumentListParams) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}
