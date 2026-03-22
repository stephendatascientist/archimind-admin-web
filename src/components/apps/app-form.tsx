"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
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
import type { AppResponse } from "@/lib/types/api";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9_]+$/, "Slug may only contain lowercase letters, digits, and underscores"),
  description: z.string().optional(),
  instructions: z.string().optional(),
  metadata: z
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

export type AppFormData = z.infer<typeof schema>;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 100);
}

interface AppFormProps {
  defaultValues?: Partial<AppResponse>;
  onSubmit: (data: AppFormData) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function AppForm({ defaultValues, onSubmit, isLoading, submitLabel = "Save" }: AppFormProps) {
  const form = useForm<AppFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      instructions: defaultValues?.instructions ?? "",
      metadata: defaultValues?.metadata ? JSON.stringify(defaultValues.metadata, null, 2) : "",
    },
  });

  const nameValue = form.watch("name");
  const isEditing = !!defaultValues?.id;

  // Auto-generate slug from name when creating
  useEffect(() => {
    if (!isEditing) {
      form.setValue("slug", slugify(nameValue ?? ""), { shouldValidate: false });
    }
  }, [nameValue, isEditing, form]);

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input placeholder="My AI App" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug *</FormLabel>
                <FormControl>
                  <Input placeholder="my_ai_app" {...field} />
                </FormControl>
                <FormDescription className="text-xs">
                  Lowercase letters, digits, and underscores only.
                </FormDescription>
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
                <Textarea placeholder="Brief description of this app…" rows={2} {...field} />
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
              <FormLabel>Base Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="System-level instructions for the AI agent…"
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
          name="metadata"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Metadata (JSON)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='{"key": "value"}'
                  rows={3}
                  className="font-mono text-xs"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-xs">Optional JSON object.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
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
