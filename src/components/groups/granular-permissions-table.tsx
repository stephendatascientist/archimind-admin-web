"use client";

import * as React from "react";
import { Plus, Trash2, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useInstances } from "@/lib/queries/app-instances";
import { useGrantGroupAccess, useUpdateGroupAccess, useRevokeGroupAccess } from "@/lib/queries/groups";
import { AppInstanceAccessCreate, AppInstanceResponse } from "@/lib/types/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface GranularPermissionsTableProps {
    value: AppInstanceAccessCreate[];
    onChange: (value: AppInstanceAccessCreate[]) => void;
    groupId?: string;
}

export function GranularPermissionsTable({
    value,
    onChange,
    groupId,
}: GranularPermissionsTableProps) {
    const { data: instances } = useInstances();
    const grantAccess = useGrantGroupAccess();
    const updateAccess = useUpdateGroupAccess();
    const revokeAccess = useRevokeGroupAccess();

    const addRow = () => {
        onChange([
            ...value,
            {
                instance_id: "",
                can_read: true,
                can_write: false,
                can_create: false,
                can_delete: false,
            },
        ]);
    };

    const removeRow = async (index: number) => {
        const row = value[index];
        if (groupId && row.instance_id) {
            try {
                await revokeAccess.mutateAsync({ groupId, instanceId: row.instance_id });
                toast.success("Access revoked");
            } catch {
                toast.error("Failed to revoke access");
                return;
            }
        }
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    const updateRow = async (index: number, updates: Partial<AppInstanceAccessCreate>) => {
        const row = value[index];
        const updatedRow = { ...row, ...updates };

        // Logic: if any non-read permission is true, can_read must be true
        if (updatedRow.can_write || updatedRow.can_create || updatedRow.can_delete) {
            updatedRow.can_read = true;
        }

        if (groupId && row.instance_id) {
            // If instance_id changed, we should probably revoke old and grant new, 
            // but usually we don't change instance_id of an existing row.
            if (updates.instance_id && updates.instance_id !== row.instance_id) {
                // This case is handled in PermissionRow when selecting a new instance for an empty row
                // For an existing row, we might want to prevent changing instance_id or handle it.
            } else {
                try {
                    await updateAccess.mutateAsync({
                        groupId,
                        instanceId: row.instance_id,
                        payload: {
                            can_read: updatedRow.can_read,
                            can_write: updatedRow.can_write,
                            can_create: updatedRow.can_create,
                            can_delete: updatedRow.can_delete,
                        }
                    });
                } catch {
                    toast.error("Failed to update access");
                    return;
                }
            }
        }

        const newValue = value.map((r, i) => (i === index ? updatedRow : r));
        onChange(newValue);
    };

    const handleGrant = async (index: number, instanceId: string) => {
        const row = value[index];
        if (groupId) {
            try {
                await grantAccess.mutateAsync({
                    groupId,
                    payload: {
                        instance_id: instanceId,
                        can_read: row.can_read,
                        can_write: row.can_write,
                        can_create: row.can_create,
                        can_delete: row.can_delete,
                    }
                });
                toast.success("Access granted");
            } catch {
                toast.error("Failed to grant access");
                return;
            }
        }
        updateRow(index, { instance_id: instanceId });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRow}
                    className="h-8"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Access Right
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[300px]">App Instance</TableHead>
                            <TableHead className="text-center">Read</TableHead>
                            <TableHead className="text-center">Write</TableHead>
                            <TableHead className="text-center">Create</TableHead>
                            <TableHead className="text-center">Delete</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {value.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No access rights defined.
                                </TableCell>
                            </TableRow>
                        ) : (
                            value.map((row, index) => (
                                <PermissionRow
                                    key={index}
                                    row={row}
                                    index={index}
                                    instances={instances || []}
                                    onUpdate={updateRow}
                                    onRemove={removeRow}
                                    onGrant={handleGrant}
                                    isPending={grantAccess.isPending || updateAccess.isPending || revokeAccess.isPending}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

interface PermissionRowProps {
    row: AppInstanceAccessCreate;
    index: number;
    instances: AppInstanceResponse[];
    onUpdate: (index: number, updates: Partial<AppInstanceAccessCreate>) => void;
    onRemove: (index: number) => void;
    onGrant: (index: number, instanceId: string) => void;
    isPending?: boolean;
}

function PermissionRow({ row, index, instances, onUpdate, onRemove, onGrant, isPending }: PermissionRowProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <TableRow>
            <TableCell>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger render={
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between h-9 px-3 text-left font-normal border-input/50"
                        >
                            <span className="truncate">
                                {row.instance_id
                                    ? instances.find((inst) => inst.id === row.instance_id)?.name || row.instance_id
                                    : "Select App Instance"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    } />
                    <PopoverContent className="w-[300px] p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Search instances..." className="h-9" />
                            <CommandList>
                                <CommandEmpty>No instance found.</CommandEmpty>
                                <CommandGroup>
                                    {instances.map((inst) => (
                                        <CommandItem
                                            key={inst.id}
                                            value={inst.name}
                                            onSelect={() => {
                                                if (!row.instance_id) {
                                                    onGrant(index, inst.id);
                                                } else {
                                                    onUpdate(index, { instance_id: inst.id });
                                                }
                                                setOpen(false);
                                            }}
                                            className="flex flex-col items-start gap-0.5"
                                        >
                                            <div className="flex items-center w-full">
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4 shrink-0",
                                                        row.instance_id === inst.id ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <span className="font-medium">{inst.name}</span>
                                            </div>
                                            {inst.description && (
                                                <span className="ml-6 text-xs text-muted-foreground line-clamp-1">
                                                    {inst.description}
                                                </span>
                                            )}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center">
                    <Checkbox
                        checked={row.can_read}
                        onCheckedChange={(checked) =>
                            onUpdate(index, { can_read: !!checked })
                        }
                        disabled={
                            row.can_write || row.can_create || row.can_delete
                        }
                    />
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center">
                    <Checkbox
                        checked={row.can_write}
                        onCheckedChange={(checked) =>
                            onUpdate(index, { can_write: !!checked })
                        }
                    />
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center">
                    <Checkbox
                        checked={row.can_create}
                        onCheckedChange={(checked) =>
                            onUpdate(index, { can_create: !!checked })
                        }
                    />
                </div>
            </TableCell>
            <TableCell className="text-center">
                <div className="flex justify-center">
                    <Checkbox
                        checked={row.can_delete}
                        onCheckedChange={(checked) =>
                            onUpdate(index, { can_delete: !!checked })
                        }
                    />
                </div>
            </TableCell>
            <TableCell>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemove(index)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
            </TableCell>
        </TableRow>
    );
}
