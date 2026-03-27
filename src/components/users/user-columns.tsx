"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { UserResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "@/lib/utils";

export function getUserColumns({
  onDelete,
}: {
  onDelete: (user: UserResponse) => void;
}): ColumnDef<UserResponse, unknown>[] {
  return [
    {
      accessorKey: "username",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Username
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/users/${row.original.id}`}
            className="font-medium text-sm hover:text-primary transition-colors cursor-pointer"
          >
            {row.original.username}
          </Link>
          {row.original.is_superuser && (
            <ShieldCheck className="h-3.5 w-3.5 text-destructive" aria-label="Superuser" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">{row.original.email}</span>
      ),
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => {
        const profile = row.original.profile;
        if (!profile || (!profile.first_name && !profile.last_name)) {
          return <span className="text-muted-foreground text-xs">—</span>;
        }
        return (
          <span className="text-sm">
            {[profile.first_name, profile.last_name].filter(Boolean).join(" ")}
          </span>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant="default" className="text-xs">
            Active
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Inactive
          </Badge>
        ),
    },
    {
      accessorKey: "is_superuser",
      header: "Role",
      cell: ({ row }) =>
        row.original.is_superuser ? (
          <Badge variant="destructive" className="text-xs">
            Superuser
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {format(new Date(row.original.created_at))}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem nativeButton={false} render={<Link href={`/users/${user.id}`} />}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(user)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
