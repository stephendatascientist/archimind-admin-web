"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, Trash2, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useDocuments, useUploadDocument, useDeleteDocument } from "@/lib/queries/documents";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { format } from "@/lib/utils";

interface DocumentUploadProps {
  sourceType: string;
  sourceId: string;
}

export function DocumentUpload({ sourceType, sourceId }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const params = { source_type: sourceType, source_id: sourceId };
  const { data: docs = [], isLoading } = useDocuments(params);
  const upload = useUploadDocument(params);
  const deleteDoc = useDeleteDocument(params);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      await upload.mutateAsync({ file, source_type: sourceType, source_id: sourceId });
      toast.success(`"${file.name}" uploaded successfully`);
    } catch {
      toast.error("Failed to upload document");
    }
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteDoc.mutateAsync(confirmId);
      toast.success("Document deleted");
    } catch {
      toast.error("Failed to delete document");
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {upload.isPending ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-sm">Uploading…</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Upload className="h-8 w-8" />
            <p className="text-sm font-medium">Drop a file here or click to upload</p>
            <p className="text-xs">PDF, DOCX, TXT and more</p>
          </div>
        )}
      </div>

      {/* Document list */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading documents…</p>
      ) : docs.length > 0 ? (
        <div className="space-y-2">
          <Separator />
          <p className="text-sm font-medium">{docs.length} document(s)</p>
          {docs.map((doc) => (
            <div key={doc.id} className="flex items-center gap-3 rounded-md border p-3">
              <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {doc.chunk_count} chunks · {format(new Date(doc.created_at))}
                </p>
              </div>
              <Badge
                variant={doc.vector_status === "indexed" ? "default" : "secondary"}
                className="text-xs shrink-0"
              >
                {doc.vector_status}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setConfirmId(doc.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Delete document"
        description="This will remove the document and its vectors. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteDoc.isPending}
      />
    </div>
  );
}
