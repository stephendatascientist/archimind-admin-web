"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { getUserColumns } from "@/components/users/user-columns";
import { EditUserDialog } from "@/components/users/edit-user-dialog";
import { useUsers, useUpdateUser, useDeleteUser } from "@/lib/queries/users";
import { useDebounce } from "@/lib/hooks/use-debounce";
import type { UserResponse } from "@/lib/types/api";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const [editTarget, setEditTarget] = useState<UserResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);

  const { data: users = [], isLoading } = useUsers();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const filtered = useMemo(() => {
    if (!debouncedSearch) return users;
    const q = debouncedSearch.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, debouncedSearch]);

  const handleEdit = async (
    userId: string,
    data: { is_active: boolean; is_superuser: boolean },
  ) => {
    try {
      await updateUser.mutateAsync({ userId, payload: data });
      toast.success("User updated");
      setEditTarget(null);
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      toast.success(`User "${deleteTarget.username}" deleted`);
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = getUserColumns({
    onEdit: (user) => setEditTarget(user),
    onDelete: (user) => setDeleteTarget(user),
  });

  const toolbar = (
    <DataTableToolbar
      searchPlaceholder="Search users…"
      onSearchChange={setSearch}
    />
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">
          Manage user accounts, active status, and superuser privileges.
        </p>
      </div>

      <DataTable columns={columns} data={filtered} isLoading={isLoading} toolbar={toolbar} />

      <EditUserDialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        user={editTarget}
        onSubmit={handleEdit}
        isLoading={updateUser.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete user "${deleteTarget?.username}"?`}
        description="This will permanently remove the user account. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteUser.isPending}
      />
    </div>
  );
}
