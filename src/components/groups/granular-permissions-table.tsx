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
import { AppInstanceAccessCreate, AppInstanceResponse } from "@/lib/types/api";

interface GranularPermissionsTableProps {
    value: AppInstanceAccessCreate[];
    onChange: (value: AppInstanceAccessCreate[]) => void;
}

export function GranularPermissionsTable({
    value,
    onChange,
}: GranularPermissionsTableProps) {
    const { data: instances } = useInstances();

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

    const removeRow = (index: number) => {
        const newValue = [...value];
        newValue.splice(index, 1);
        onChange(newValue);
    };

    const updateRow = (index: number, updates: Partial<AppInstanceAccessCreate>) => {
        const newValue = value.map((row, i) => {
            if (i === index) {
                const updatedRow = { ...row, ...updates };
                // Logic: if any non-read permission is true, can_read must be true
                if (
                    updatedRow.can_write ||
                    updatedRow.can_create ||
                    updatedRow.can_delete
                ) {
                    updatedRow.can_read = true;
                }
                return updatedRow;
            }
            return row;
        });
        onChange(newValue);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Access Rights</h3>
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
}

function PermissionRow({ row, index, instances, onUpdate, onRemove }: PermissionRowProps) {
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
                                                onUpdate(index, { instance_id: inst.id });
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
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}
