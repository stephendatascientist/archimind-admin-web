"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useGrantInstanceAccess,
  useInstanceAccess,
  useRevokeInstanceAccess,
} from "@/lib/queries/app-instances";
import { useUsers } from "@/lib/queries/users";
import { useGroups } from "@/lib/queries/groups";
import type {
  AccessorType,
  AppInstanceAccessGrant,
  InstancePermission,
} from "@/lib/types/api";

const PERMISSIONS: InstancePermission[] = ["READ", "CREATE", "UPDATE", "DELETE"];

const PERMISSION_VARIANT: Record<
  InstancePermission,
  "default" | "secondary" | "destructive"
> = {
  READ: "secondary",
  CREATE: "default",
  UPDATE: "secondary",
  DELETE: "destructive",
};

const grantSchema = z.object({
  accessor_type: z.enum(["USER", "GROUP"] as const),
  accessor_id: z.string().min(1, "Required"),
  permission: z.enum(["CREATE", "READ", "UPDATE", "DELETE"] as const),
});

type GrantFormData = z.infer<typeof grantSchema>;

interface InstanceAccessPanelProps {
  instanceId: string;
}

export function InstanceAccessPanel({ instanceId }: InstanceAccessPanelProps) {
  const { data: entries = [], isLoading } = useInstanceAccess(instanceId);
  const { data: users = [] } = useUsers();
  const { data: groups = [] } = useGroups();
  const grantAccess = useGrantInstanceAccess(instanceId);
  const revokeAccess = useRevokeInstanceAccess(instanceId);

  const form = useForm<GrantFormData>({
    resolver: zodResolver(grantSchema),
    defaultValues: { accessor_type: "USER", accessor_id: "", permission: "READ" },
  });

  const accessorType = form.watch("accessor_type");

  useEffect(() => {
    form.setValue("accessor_id", "");
  }, [accessorType, form]);

  const accessorOptions = useMemo(
    () =>
      accessorType === "USER"
        ? users.map((u) => ({ id: u.id, label: u.username }))
        : groups.map((g) => ({ id: g.id, label: g.name })),
    [accessorType, users, groups],
  );

  const resolveAccessorLabel = (type: AccessorType, id: string): string => {
    if (type === "USER") {
      return users.find((u) => u.id === id)?.username ?? id.slice(0, 8) + "…";
    }
    return groups.find((g) => g.id === id)?.name ?? id.slice(0, 8) + "…";
  };

  const handleGrant = async (data: GrantFormData) => {
    try {
      await grantAccess.mutateAsync(data as AppInstanceAccessGrant);
      toast.success("Access granted");
      form.reset({ accessor_type: data.accessor_type, accessor_id: "", permission: "READ" });
    } catch {
      toast.error("Failed to grant access");
    }
  };

  const handleRevoke = async (accessorType: string, accessorId: string) => {
    try {
      await revokeAccess.mutateAsync({ accessorType, accessorId });
      toast.success("Access revoked");
    } catch {
      toast.error("Failed to revoke access");
    }
  };

  return (
    <div className="space-y-6">
      {/* Grant form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Grant Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleGrant)}
              className="flex flex-wrap items-end gap-3"
            >
              <FormField
                control={form.control}
                name="accessor_type"
                render={({ field }) => (
                  <FormItem className="min-w-[110px]">
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="GROUP">Group</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessor_id"
                render={({ field }) => (
                  <FormItem className="flex-1 min-w-[180px]">
                    <FormLabel>{accessorType === "USER" ? "User" : "Group"}</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={accessorOptions.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`Select a ${accessorType === "USER" ? "user" : "group"}…`}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accessorOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.label}
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
                name="permission"
                render={({ field }) => (
                  <FormItem className="min-w-[130px]">
                    <FormLabel>Permission</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PERMISSIONS.map((p) => (
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

              <Button type="submit" size="sm" disabled={grantAccess.isPending} className="self-end">
                {grantAccess.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Grant
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Current access list */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Current Access</h3>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No access entries yet.</p>
        ) : (
          <div className="divide-y rounded-lg border">
            {entries.map((entry, i) => (
              <div
                key={`${entry.accessor_type}-${entry.accessor_id}-${entry.permission}-${i}`}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <Badge variant="outline" className="font-mono text-xs shrink-0">
                  {entry.accessor_type}
                </Badge>
                <span className="text-sm flex-1 truncate">
                  {resolveAccessorLabel(entry.accessor_type, entry.accessor_id)}
                </span>
                <Badge
                  variant={PERMISSION_VARIANT[entry.permission]}
                  className="text-xs shrink-0"
                >
                  {entry.permission}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => handleRevoke(entry.accessor_type, entry.accessor_id)}
                  disabled={revokeAccess.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Revoke</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
