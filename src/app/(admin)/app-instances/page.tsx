"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, LayoutList, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { KanbanView } from "@/components/data-table/kanban-view";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getInstanceColumns } from "@/components/app-instances/instance-columns";
import { useInstances, useDeleteInstance } from "@/lib/queries/app-instances";
import { useApps } from "@/lib/queries/apps";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import type { AppResponse } from "@/lib/types/api";

export default function AppInstancesPage() {
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data: instances = [], isLoading } = useInstances();
  const { data: apps = [] } = useApps();
  const deleteInstance = useDeleteInstance();

  const appsById = useMemo<Record<string, AppResponse>>(
    () => Object.fromEntries(apps.map((a) => [a.id, a])),
    [apps]
  );

  const filtered = useMemo(() => {
    if (!debouncedSearch) return instances;
    const q = debouncedSearch.toLowerCase();
    return instances.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        appsById[i.app_id]?.name.toLowerCase().includes(q)
    );
  }, [instances, debouncedSearch, appsById]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteInstance.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
    } catch {
      toast.error("Failed to delete instance");
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = getInstanceColumns({
    appsById,
    onDelete: (id, name) => setDeleteTarget({ id, name }),
  });

  // Group kanban by app
  const kanbanGroups = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((inst) => {
      const appName = appsById[inst.app_id]?.name ?? "Unknown App";
      if (!groups[appName]) groups[appName] = [];
      groups[appName].push(inst);
    });
    return Object.entries(groups).map(([label, items]) => ({
      label,
      items: items.map((inst) => ({
        id: inst.id,
        title: inst.name,
        badges: inst.has_credentials ? (
          <Badge variant="default" className="text-xs">Credentials</Badge>
        ) : undefined,
      })),
    }));
  }, [filtered, appsById]);

  const toolbar = (
    <DataTableToolbar
      searchPlaceholder="Search instances…"
      onSearchChange={setSearch}
      viewToggle={
        <div className="flex gap-1">
          <Toggle pressed={view === "list"} onPressedChange={() => setView("list")} size="sm" aria-label="List view">
            <LayoutList className="h-4 w-4" />
          </Toggle>
          <Toggle pressed={view === "kanban"} onPressedChange={() => setView("kanban")} size="sm" aria-label="Kanban view">
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
        </div>
      }
      actions={
        <Button size="sm" nativeButton={false} render={<Link href="/app-instances/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          New Instance
        </Button>
      }
    />
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">App Instances</h1>
        <p className="text-muted-foreground text-sm">Deploy configured app instances with custom pipelines.</p>
      </div>

      {view === "list" ? (
        <DataTable columns={columns} data={filtered} isLoading={isLoading} toolbar={toolbar} />
      ) : (
        <div className="space-y-3">
          {toolbar}
          <KanbanView groups={kanbanGroups} isLoading={isLoading} />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently delete the instance. This cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteInstance.isPending}
      />
    </div>
  );
}
