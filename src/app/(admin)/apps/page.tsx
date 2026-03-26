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
import { getAppColumns } from "@/components/apps/app-columns";
import { useApps, useDeleteApp } from "@/lib/queries/apps";
import { useDebounce } from "@/lib/hooks/use-debounce";

export default function AppsPage() {
  const [view, setView] = useState<"list" | "kanban">("kanban");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  const { data: apps = [], isLoading } = useApps();
  const deleteApp = useDeleteApp();

  const filtered = useMemo(() => {
    if (!debouncedSearch) return apps;
    const q = debouncedSearch.toLowerCase();
    return apps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
    );
  }, [apps, debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteApp.mutateAsync(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
    } catch {
      toast.error("Failed to delete app");
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = getAppColumns({
    onDelete: (id, name) => setDeleteTarget({ id, name }),
  });

  const kanbanGroups = [
    {
      label: "All Apps",
      items: filtered.map((app) => ({
        id: app.id,
        title: app.name,
        subtitle: app.description ?? undefined,
        badges: (
          <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{app.slug}</span>
        ),
      })),
    },
  ];

  const toolbar = (
    <DataTableToolbar
      searchPlaceholder="Search apps…"
      onSearchChange={setSearch}
      viewToggle={
        <div className="flex gap-1">
          <Toggle
            pressed={view === "list"}
            onPressedChange={() => setView("list")}
            aria-label="List view"
            size="sm"
          >
            <LayoutList className="h-4 w-4" />
          </Toggle>
          <Toggle
            pressed={view === "kanban"}
            onPressedChange={() => setView("kanban")}
            aria-label="Kanban view"
            size="sm"
          >
            <LayoutGrid className="h-4 w-4" />
          </Toggle>
        </div>
      }
      actions={
        <Button size="sm" nativeButton={false} render={<Link href="/apps/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          New App
        </Button>
      }
    />
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Apps</h1>
        <p className="text-muted-foreground text-sm">Manage global AI application templates.</p>
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
        description="This will permanently delete the app and all its instances. This cannot be undone."
        onConfirm={handleDelete}
        isLoading={deleteApp.isPending}
      />
    </div>
  );
}
