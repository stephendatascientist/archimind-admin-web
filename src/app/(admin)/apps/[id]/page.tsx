"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AppForm, type AppFormData } from "@/components/apps/app-form";
import { DocumentUpload } from "@/components/apps/document-upload";
import { useApp, useUpdateApp } from "@/lib/queries/apps";

export default function AppDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: app, isLoading } = useApp(id);
  const updateApp = useUpdateApp(id);

  const handleUpdate = async (data: AppFormData) => {
    try {
      await updateApp.mutateAsync({
        name: data.name,
        description: data.description || null,
        instructions: data.instructions || null,
        metadata: data.metadata && data.metadata.trim() ? JSON.parse(data.metadata) : null,
      });
      toast.success("App updated successfully");
    } catch {
      toast.error("Failed to update app");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/apps" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {isLoading ? (
          <Skeleton className="h-7 w-48" />
        ) : (
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{app?.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{app?.slug}</p>
          </div>
        )}
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : app ? (
            <AppForm
              defaultValues={app}
              onSubmit={handleUpdate}
              isLoading={updateApp.isPending}
              submitLabel="Save Changes"
            />
          ) : (
            <p className="text-muted-foreground">App not found.</p>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          {app && <DocumentUpload sourceType="app" sourceId={app.id} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
