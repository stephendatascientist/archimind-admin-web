"use client";

import { UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppInstanceResponse, CredentialSchemaField, AppResponse } from "@/lib/types/api";
import { useApps } from "@/lib/queries/apps";
import { DynamicCredentialsForm } from "./dynamic-credentials-form";

export const instanceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  app_id: z.string().uuid("Please select an app"),
  description: z.string().optional(),
  instructions: z.string().optional(),
  credentials: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val.trim() === "") return true;
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Must be valid JSON" }
    ),
});

export type InstanceFormData = z.infer<typeof instanceSchema>;

interface InstanceDetailsFieldsProps {
  form: UseFormReturn<InstanceFormData>;
  apps: AppResponse[];
  lockedAppId?: string;
  isEdit?: boolean;
}

export function InstanceDetailsFields({ form, apps, lockedAppId, isEdit }: InstanceDetailsFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input placeholder="Production Instance" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="app_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>App *</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!!lockedAppId || isEdit}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an app…">
                      {apps.find(a => a.id === field.value)?.name}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {apps.length > 0 ? (
                    apps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-muted-foreground text-center">Loading apps…</div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="A brief description of this instance's purpose…"
                className="resize-none"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="instructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Instance Instructions</FormLabel>
            <FormControl>
              <RichTextEditor
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Override or extend the base app instructions for this instance…"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

interface InstanceCredentialsFieldsProps {
  form: UseFormReturn<InstanceFormData>;
  credentialSchema?: CredentialSchemaField[];
  hasExisting?: boolean;
}

export function InstanceCredentialsFields({
  form,
  credentialSchema,
  hasExisting
}: InstanceCredentialsFieldsProps) {
  const hasDynamicSchema = Array.isArray(credentialSchema) && credentialSchema.length > 0;

  return (
    <div className="space-y-5">
      {hasDynamicSchema ? (
        <DynamicCredentialsForm
          schema={credentialSchema!}
          hasExisting={hasExisting}
          onChange={(json) => form.setValue("credentials", json)}
        />
      ) : (
        <FormField
          control={form.control}
          name="credentials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credentials (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    hasExisting
                      ? '{"api_key": "…"} — Leave blank to keep existing credentials'
                      : '{"api_key": "…"}'
                  }
                  rows={3}
                  className="font-mono text-xs"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Credentials are encrypted on the server and never returned.
                {hasExisting && (
                  <span className="ml-1 text-amber-600">
                    This instance has credentials stored — leave blank to keep them.
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}

interface InstanceFormProps {
  defaultValues?: Partial<AppInstanceResponse>;
  lockedAppId?: string;
  onSubmit: (data: InstanceFormData) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function InstanceForm({
  defaultValues,
  lockedAppId,
  onSubmit,
  isLoading,
  submitLabel = "Save",
}: InstanceFormProps) {
  const { data: apps = [] } = useApps();

  const form = useForm<InstanceFormData>({
    resolver: zodResolver(instanceSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      app_id: lockedAppId ?? defaultValues?.app_id ?? "",
      description: defaultValues?.description ?? "",
      instructions: defaultValues?.instructions ?? "",
      credentials: "",
    },
  });

  const selectedAppId = form.watch("app_id");
  const selectedApp = apps.find((a) => a.id === selectedAppId);
  const credentialSchema =
    selectedApp?.credential_schema ??
    (selectedApp?.metadata?.credential_schema as CredentialSchemaField[] | undefined);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <InstanceDetailsFields
          form={form}
          apps={apps}
          lockedAppId={lockedAppId}
          isEdit={!!defaultValues?.id}
        />

        <InstanceCredentialsFields
          form={form}
          credentialSchema={credentialSchema}
          hasExisting={defaultValues?.has_credentials}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

