"use client";

import { ColumnDef } from "@tanstack/react-table";
import { AuditLogResponse } from "@/lib/types/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";
import { format } from "@/lib/utils";
import { useState } from "react";

/** Colour-code common action verbs */
function ActionBadge({ action }: { action: string }) {
  const lower = action.toLowerCase();
  const variant =
    lower.includes("delete") || lower.includes("remove")
      ? "destructive"
      : lower.includes("create") || lower.includes("register")
        ? "default"
        : lower.includes("update") || lower.includes("edit")
          ? "secondary"
          : "outline";
  return (
    <Badge variant={variant} className="font-mono text-xs capitalize">
      {action}
    </Badge>
  );
}

/** Expandable details cell */
function DetailsCell({ details }: { details: Record<string, unknown> | null }) {
  const [open, setOpen] = useState(false);
  if (!details || Object.keys(details).length === 0) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {open ? "Hide" : "Show"}
      </button>
      {open && (
        <pre className="mt-1 max-w-xs overflow-auto rounded bg-muted p-2 text-xs">
          {JSON.stringify(details, null, 2)}
        </pre>
      )}
    </div>
  );
}

export const auditLogColumns: ColumnDef<AuditLogResponse, unknown>[] = [
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Timestamp
        <ArrowUpDown className="ml-1 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm text-muted-foreground">
        {format(new Date(row.original.created_at))}
      </span>
    ),
    sortingFn: "datetime",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <ActionBadge action={row.original.action} />,
  },
  {
    accessorKey: "resource_type",
    header: "Resource Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono text-xs">
        {row.original.resource_type}
      </Badge>
    ),
  },
  {
    accessorKey: "resource_id",
    header: "Resource ID",
    cell: ({ row }) => {
      const id = row.original.resource_id;
      if (!id) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <span
          className="font-mono text-xs text-muted-foreground"
          title={id}
        >
          {id.slice(0, 8)}…
        </span>
      );
    },
  },
  {
    accessorKey: "user_id",
    header: "User ID",
    cell: ({ row }) => {
      const id = row.original.user_id;
      if (!id) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <span className="font-mono text-xs text-muted-foreground" title={id}>
          {id.slice(0, 8)}…
        </span>
      );
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => <DetailsCell details={row.original.details} />,
    enableSorting: false,
  },
];
