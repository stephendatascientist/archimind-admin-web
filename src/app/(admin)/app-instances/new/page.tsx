"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InstanceForm, type InstanceFormData } from "@/components/app-instances/instance-form";
import { useCreateInstance } from "@/lib/queries/app-instances";

export default function NewInstancePage() {
  const router = useRouter();
  const createInstance = useCreateInstance();

  const handleSubmit = async (data: InstanceFormData) => {
    try {
      const ragTiers = data.rag_tiers
        ? data.rag_tiers.split(",").map((s) => s.trim()).filter(Boolean)
        : [];
      const instance = await createInstance.mutateAsync({
        name: data.name,
        app_id: data.app_id,
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
      toast.success("Instance created successfully");
      router.push(`/app-instances/${instance.id}`);
    } catch {
      toast.error("Failed to create instance");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/app-instances" />}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to App Instances
        </Button>
      </div>

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Server className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create App Instance</h1>
          <p className="text-sm text-muted-foreground">
            Deploy a configured instance of an existing app with its own pipeline and credentials.
          </p>
        </div>
      </div>

      {/* Form sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Instance Details</CardTitle>
          <CardDescription>
            Select an app, name this instance, and optionally override its instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InstanceForm
            onSubmit={handleSubmit}
            isLoading={createInstance.isPending}
            submitLabel="Create Instance"
          />
        </CardContent>
      </Card>
    </div>
  );
}
