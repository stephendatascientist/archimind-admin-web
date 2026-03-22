"use client";

import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { InstanceFormData } from "./instance-form";

// If Switch isn't installed yet we'll render a checkbox fallback
let SwitchComponent: typeof Switch;
try {
  SwitchComponent = Switch;
} catch {
  // fallback — will never happen since we're in same project
  SwitchComponent = Switch;
}

const LLM_PROVIDERS = ["openai", "anthropic", "google", "mistral", "ollama"];
const RANKING_STRATEGIES = ["reciprocal_rank_fusion", "linear", "borda"];

interface PipelineConfigFormProps {
  form: UseFormReturn<InstanceFormData>;
}

export function PipelineConfigForm({ form }: PipelineConfigFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Pipeline Configuration</h3>
        <p className="text-xs text-muted-foreground">Configure the RAG/LLM pipeline for this instance.</p>
      </div>
      <Separator />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="llm_provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LLM Provider</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LLM_PROVIDERS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="llm_model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="gpt-4o" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="temperature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temperature (0–2)</FormLabel>
              <FormControl>
                <Input type="number" step="0.1" min={0} max={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="retrieval_top_k"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retrieval Top-K (1–100)</FormLabel>
              <FormControl>
                <Input type="number" min={1} max={100} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="context_window"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Context Window (tokens)</FormLabel>
              <FormControl>
                <Input type="number" min={1024} max={128000} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ranking_strategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ranking Strategy</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {RANKING_STRATEGIES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
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
        name="rag_tiers"
        render={({ field }) => (
          <FormItem>
            <FormLabel>RAG Tiers</FormLabel>
            <FormControl>
              <Input placeholder="app,instance,global" {...field} />
            </FormControl>
            <FormDescription className="text-xs">
              Comma-separated list of tiers to search (e.g. app,instance,global).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="enable_citations"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <FormLabel>Enable Citations</FormLabel>
              <FormDescription className="text-xs">
                Include source citations in responses.
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
