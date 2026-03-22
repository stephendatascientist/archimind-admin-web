"use client";

import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { InstanceForm, type InstanceFormData } from "@/components/app-instances/instance-form";
import { DocumentUpload } from "@/components/apps/document-upload";
import { useInstance, useUpdateInstance } from "@/lib/queries/app-instances";
import { useApp } from "@/lib/queries/apps";

function AppName({ appId }: { appId: string }) {
  const { data: app } = useApp(appId);
  return <span className="text-sm text-muted-foreground">{app?.name ?? appId.slice(0, 8) + "…"}</span>;
}

export default function AppInstanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: instance, isLoading } = useInstance(id);
  const updateInstance = useUpdateInstance(id);

  const handleUpdate = async (data: InstanceFormData) => {
    try {
      const ragTiers = data.rag_tiers
        ? data.rag_tiers.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      await updateInstance.mutateAsync({
        name: data.name,
        instructions: data.instructions || null,
        credentials:
          data.credentials && data.credentials.trim()
            ? JSON.parse(data.credentials)
            : null,
        pipeline_config: {
          llm_provider: data.llm_provider,
          llm_model: data.llm_model,
          temperature: data.temperature,
          retrieval_top_k: data.retrieval_top_k,
          context_window: data.context_window,
          enable_citations: data.enable_citations,
          ranking_strategy: data.ranking_strategy,
          rag_tiers: ragTiers,
        },
      });
      toast.success("Instance updated successfully");
    } catch {
      toast.error("Failed to update instance");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" render={<Link href="/app-instances" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {isLoading ? (
          <Skeleton className="h-7 w-48" />
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{instance?.name}</h1>
              {instance?.has_credentials && (
                <Badge variant="default" className="text-xs">Credentials</Badge>
              )}
            </div>
            {instance && <AppName appId={instance.app_id} />}
          </div>
        )}
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details & Pipeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : instance ? (
            <InstanceForm
              defaultValues={instance}
              onSubmit={handleUpdate}
              isLoading={updateInstance.isPending}
              submitLabel="Save Changes"
            />
          ) : (
            <p className="text-muted-foreground">Instance not found.</p>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          {instance && <DocumentUpload sourceType="instance" sourceId={instance.id} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
