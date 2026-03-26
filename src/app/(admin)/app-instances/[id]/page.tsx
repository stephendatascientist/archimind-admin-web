"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Form } from "@/components/ui/form";
import {
  InstanceDetailsFields,
  InstanceCredentialsFields,
  instanceSchema,
  type InstanceFormData
} from "@/components/app-instances/instance-form";
import { DocumentUpload } from "@/components/apps/document-upload";
import { useInstance, useUpdateInstance } from "@/lib/queries/app-instances";
import { useApp, useApps } from "@/lib/queries/apps";
import type { CredentialSchemaField } from "@/lib/types/api";

function AppName({ appId }: { appId: string }) {
  const { data: app } = useApp(appId);
  return <span className="text-sm text-muted-foreground">{app?.name ?? appId.slice(0, 8) + "…"}</span>;
}

export default function AppInstanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: instance, isLoading } = useInstance(id);
  const { data: apps = [] } = useApps();
  const updateInstance = useUpdateInstance(id);

  const form = useForm<InstanceFormData>({
    resolver: zodResolver(instanceSchema),
    defaultValues: {
      name: "",
      app_id: "",
      description: "",
      instructions: "",
      credentials: "",
    },
  });

  useEffect(() => {
    if (instance) {
      form.reset({
        name: instance.name,
        app_id: instance.app_id,
        description: instance.description ?? "",
        instructions: instance.instructions ?? "",
        credentials: "",
      });
    }
  }, [instance, form]);

  const selectedApp = apps.find((a) => a.id === instance?.app_id);
  const credentialSchema =
    selectedApp?.credential_schema ??
    (selectedApp?.metadata?.credential_schema as CredentialSchemaField[] | undefined);

  const handleUpdate = async (data: InstanceFormData) => {
    try {
      await updateInstance.mutateAsync({
        name: data.name,
        description: data.description,
        instructions: data.instructions || null,
        credentials:
          data.credentials && data.credentials.trim()
            ? JSON.parse(data.credentials)
            : null,
      });
      toast.success("Instance updated successfully");
      form.setValue("credentials", ""); // Clear credentials field after successful update
    } catch {
      toast.error("Failed to update instance");
    }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/app-instances" />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        {isLoading ? (
          <Skeleton className="h-7 w-48" />
        ) : (
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{instance?.name}</h1>
            </div>
            {instance && <AppName appId={instance.app_id} />}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : instance ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-6">
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="credentials">Credentials</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <InstanceDetailsFields
                  form={form}
                  apps={apps}
                  isEdit
                />
              </TabsContent>

              <TabsContent value="credentials" className="mt-4">
                <InstanceCredentialsFields
                  form={form}
                  credentialSchema={credentialSchema}
                  hasExisting={instance.has_credentials}
                />
              </TabsContent>

              <TabsContent value="documents" className="mt-4">
                <DocumentUpload sourceType="instance" sourceId={instance.id} />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={updateInstance.isPending}>
                {updateInstance.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <p className="text-muted-foreground">Instance not found.</p>
      )}
    </div>
  );
}

