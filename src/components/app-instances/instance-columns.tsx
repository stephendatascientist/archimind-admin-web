"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AppInstanceResponse } from "@/lib/types/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { format } from "@/lib/utils";
import type { AppResponse } from "@/lib/types/api";

export function getInstanceColumns({
  appsById,
  onDelete,
}: {
  appsById: Record<string, AppResponse>;
  onDelete: (id: string, name: string) => void;
}): ColumnDef<AppInstanceResponse, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link href={`/app-instances/${row.original.id}`} className="font-medium hover:underline">
          {row.original.name}
        </Link>
      ),
    },
    {
      accessorKey: "app_id",
      header: "App",
      cell: ({ row }) => {
        const app = appsById[row.original.app_id];
        return app ? (
          <Link href={`/apps/${app.id}`} className="text-sm hover:underline">
            {app.name}
          </Link>
        ) : (
          <span className="text-muted-foreground text-xs font-mono truncate max-w-[120px] block">
            {row.original.app_id.slice(0, 8)}…
          </span>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate text-xs text-muted-foreground" title={row.original.description ?? ""}>
          {row.original.description || "—"}
        </div>
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
        <span className="text-muted-foreground text-sm">
          {format(new Date(row.original.created_at))}
        </span>
      ),
    },
    {
      id: "actions",
      size: 60,
      cell: ({ row }) => {
        const inst = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem render={<Link href={`/app-instances/${inst.id}`} />}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(inst.id, inst.name)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
