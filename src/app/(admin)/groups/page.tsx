"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getGroupColumns } from "@/components/groups/group-columns";
import { AssignGroupDialog } from "@/components/groups/assign-group-dialog";
import {
  useGroups,
  useDeleteGroup,
  useAssignUserToGroup,
} from "@/lib/queries/groups";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { GroupResponse } from "@/lib/types/api";

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [assignTarget, setAssignTarget] = useState<GroupResponse | null>(null);

  const { data: groups = [], isLoading } = useGroups();
  const deleteGroup = useDeleteGroup();
  const assignUser = useAssignUserToGroup();

  const filtered = useMemo(() => {
    if (!debouncedSearch) return groups;
    const q = debouncedSearch.toLowerCase();
    return groups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description?.toLowerCase().includes(q)
    );
  }, [groups, debouncedSearch]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteGroup.mutateAsync(deleteTarget.id);
      toast.success(`Group "${deleteTarget.name}" deleted`);
    } catch {
      toast.error("Failed to delete group");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleAssign = async (userId: string, group: GroupResponse) => {
    try {
      await assignUser.mutateAsync({ userId, groupId: group.id });
      toast.success(`User assigned to "${group.name}"`);
      setAssignTarget(null);
    } catch {
      toast.error("Failed to assign user to group");
    }
  };

  const columns = getGroupColumns({
    onAssignUser: (group) => setAssignTarget(group),
    onDelete: (id, name) => setDeleteTarget({ id, name }),
  });

  const toolbar = (
    <DataTableToolbar
      searchPlaceholder="Search groups…"
      onSearchChange={setSearch}
      actions={
        <Button size="sm" nativeButton={false} render={<Link href="/groups/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          New Group
        </Button>
      }
    />
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
        <p className="text-muted-foreground text-sm">
          Manage user groups and RBAC permissions. Add users to the{" "}
          <code className="text-xs font-mono bg-muted px-1 rounded">ADMIN</code> group to grant
          administrative access.
        </p>
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} toolbar={toolbar} />

      <AssignGroupDialog
        open={!!assignTarget}
        onOpenChange={(open) => !open && setAssignTarget(null)}
        group={assignTarget}
        onSubmit={handleAssign}
        isLoading={assignUser.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete group "${deleteTarget?.name}"?`}
        description="This will permanently remove the group. Users currently in this group will lose its permissions."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteGroup.isPending}
      />
    </div>
  );
}

