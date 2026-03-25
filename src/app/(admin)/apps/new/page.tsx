"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, AppWindow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AppForm, type AppFormData } from "@/components/apps/app-form";
import { useCreateApp } from "@/lib/queries/apps";

export default function NewAppPage() {
  const router = useRouter();
  const createApp = useCreateApp();

  const handleSubmit = async (data: AppFormData) => {
    try {
      const app = await createApp.mutateAsync({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        instructions: data.instructions || null,
        metadata: data.metadata && data.metadata.trim() ? JSON.parse(data.metadata) : null,
      });
      toast.success("App created successfully");
      router.push(`/apps/${app.id}`);
    } catch {
      toast.error("Failed to create app");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" render={<Link href="/apps" />}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Apps
        </Button>
      </div>

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <AppWindow className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create App</h1>
          <p className="text-sm text-muted-foreground">Define a new AI application template.</p>
        </div>
      </div>

      {/* Form card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">App Details</CardTitle>
          <CardDescription>
            Fill in the details below. The slug is used as a unique identifier and cannot be changed after creation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AppForm
            onSubmit={handleSubmit}
            isLoading={createApp.isPending}
            submitLabel="Create App"
          />
        </CardContent>
      </Card>
    </div>
  );
}
