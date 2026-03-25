"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RefreshCw, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/data-table/data-table";
import { auditLogColumns } from "@/components/audit-logs/audit-log-columns";
import { useCurrentUser } from "@/lib/queries/auth";
import { useAuditLogsByUser, useAuditLogsByResource } from "@/lib/queries/audit-logs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ── Resource search form ─────────────────────────────────────
const resourceSchema = z.object({
  resource_type: z.string().min(1, "Resource type is required"),
  resource_id: z.string().uuid("Must be a valid UUID"),
});
type ResourceForm = z.infer<typeof resourceSchema>;

const RESOURCE_TYPES = ["app", "app_instance", "document", "user"] as const;

function ByResourceTab() {
  const [query, setQuery] = useState<{ resource_type: string; resource_id: string } | null>(null);

  const { data, isLoading, isFetching, refetch } = useAuditLogsByResource(
    query?.resource_type ?? "",
    query?.resource_id ?? "",
    { limit: 200 },
    !!query
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResourceForm>({ resolver: zodResolver(resourceSchema) });

  const onSubmit = (values: ResourceForm) => {
    setQuery(values);
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-end"
      >
        <div className="space-y-1 w-full sm:w-48">
          <Label>Resource Type</Label>
          <Select
            onValueChange={(val) => setValue("resource_type", val as string, { shouldValidate: true })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type…" />
            </SelectTrigger>
            <SelectContent>
              {RESOURCE_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.resource_type && (
            <p className="text-xs text-destructive">{errors.resource_type.message}</p>
          )}
        </div>

        <div className="space-y-1 flex-1">
          <Label htmlFor="resource_id">Resource ID (UUID)</Label>
          <Input
            id="resource_id"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="font-mono text-sm"
            {...register("resource_id")}
          />
          {errors.resource_id && (
            <p className="text-xs text-destructive">{errors.resource_id.message}</p>
          )}
        </div>

        <Button type="submit" size="sm" className="shrink-0">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
      </form>

      {query ? (
        <DataTable
          columns={auditLogColumns}
          data={data ?? []}
          isLoading={isLoading || isFetching}
          toolbar={
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {data ? `${data.length} log${data.length !== 1 ? "s" : ""} found` : ""}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          }
        />
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          Enter a resource type and ID above to view its audit trail.
        </div>
      )}
    </div>
  );
}

// ── My Activity tab ──────────────────────────────────────────
function MyActivityTab() {
  const { data: me, isLoading: meLoading } = useCurrentUser();

  const { data, isLoading, isFetching, refetch } = useAuditLogsByUser(me?.id ?? "", {
    limit: 200,
  });

  if (meLoading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Loading user…
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-destructive">
        Could not load current user.
      </div>
    );
  }

  return (
    <DataTable
      columns={auditLogColumns}
      data={data ?? []}
      isLoading={isLoading || isFetching}
      toolbar={
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Activity for <span className="font-medium text-foreground">{me.username}</span>
            {data ? ` — ${data.length} log${data.length !== 1 ? "s" : ""}` : ""}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      }
    />
  );
}

// ── Page ─────────────────────────────────────────────────────
export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground text-sm">
          Review the complete activity trail of admin actions.
        </p>
      </div>

      <Tabs defaultValue="my-activity">
        <TabsList>
          <TabsTrigger value="my-activity">My Activity</TabsTrigger>
          <TabsTrigger value="by-resource">By Resource</TabsTrigger>
        </TabsList>

        <TabsContent value="my-activity" className="mt-4">
          <MyActivityTab />
        </TabsContent>

        <TabsContent value="by-resource" className="mt-4">
          <ByResourceTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
