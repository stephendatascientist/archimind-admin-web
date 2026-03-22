"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import type { AppInstanceResponse } from "@/lib/types/api";
import { useApps } from "@/lib/queries/apps";
import { PipelineConfigForm } from "./pipeline-config-form";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  app_id: z.string().uuid("Please select an app"),
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
  llm_provider: z.string().min(1),
  llm_model: z.string().min(1),
  temperature: z.number().min(0).max(2),
  retrieval_top_k: z.number().min(1).max(100),
  context_window: z.number().min(1024).max(128000),
  enable_citations: z.boolean(),
  ranking_strategy: z.string().min(1),
  rag_tiers: z.string(),
});

export type InstanceFormData = z.infer<typeof schema>;

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
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      app_id: lockedAppId ?? defaultValues?.app_id ?? "",
      instructions: defaultValues?.instructions ?? "",
      credentials: "",
      llm_provider: defaultValues?.pipeline_config?.llm_provider ?? "openai",
      llm_model: defaultValues?.pipeline_config?.llm_model ?? "gpt-4o",
      temperature: defaultValues?.pipeline_config?.temperature ?? 0.7,
      retrieval_top_k: defaultValues?.pipeline_config?.retrieval_top_k ?? 10,
      context_window: defaultValues?.pipeline_config?.context_window ?? 8192,
      enable_citations: defaultValues?.pipeline_config?.enable_citations ?? true,
      ranking_strategy: defaultValues?.pipeline_config?.ranking_strategy ?? "reciprocal_rank_fusion",
      rag_tiers: (defaultValues?.pipeline_config?.rag_tiers ?? []).join(","),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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
                  disabled={!!lockedAppId || !!defaultValues?.id}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an app…" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {apps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="instructions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instance Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Override or extend the base app instructions for this instance…"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="credentials"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Credentials (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={
                    defaultValues?.has_credentials
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
                {defaultValues?.has_credentials && (
                  <span className="ml-1 text-amber-600">
                    This instance has credentials stored — leave blank to keep them.
                  </span>
                )}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <PipelineConfigForm form={form} />

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
