"use client";

import * as React from "react";
import { Search, UserPlus, Loader2, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUsers } from "@/lib/queries/users";
import { useAssignUserToGroup, useGroupUsers, useRemoveUserFromGroup } from "@/lib/queries/groups";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface GroupUsersTabProps {
    groupId: string;
    groupName: string;
}

export function GroupUsersTab({ groupId, groupName }: GroupUsersTabProps) {
    const [search, setSearch] = React.useState("");
    const { data: users = [], isLoading: isLoadingUsers } = useUsers();
    const { data: members = [], isLoading: isLoadingMembers } = useGroupUsers(groupId);
    const assignUser = useAssignUserToGroup();
    const removeUser = useRemoveUserFromGroup();

    const filteredUsers = React.useMemo(() => {
        if (!search) return [];
        const q = search.toLowerCase();
        return users.filter(
            (u: any) =>
                (u.username.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q)) &&
                !members.some((m) => m.id === u.id)
        ).slice(0, 5);
    }, [users, members, search]);

    const handleAssign = async (userId: string, username: string) => {
        try {
            await assignUser.mutateAsync({ userId, groupId });
            toast.success(`User "${username}" assigned to group "${groupName}"`);
        } catch {
            toast.error(`Failed to assign user "${username}"`);
        }
    };

    const handleRemove = async (userId: string, username: string) => {
        try {
            await removeUser.mutateAsync({ userId, groupId });
            toast.success(`User "${username}" removed from group "${groupName}"`);
        } catch {
            toast.error(`Failed to remove user "${username}"`);
        }
    };

    return (
        <div className="space-y-6 pt-2">
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">Manage Members</h3>
                <p className="text-xs text-muted-foreground">
                    Search for users to assign them to this group.
                </p>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users by name or email..."
                        className="pl-9 h-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="rounded-md border bg-muted/30 min-h-[120px]">
                    <ScrollArea className="h-[200px] w-full">
                        <div className="p-2 space-y-1">
                            {isLoadingUsers ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-2 rounded-sm hover:bg-background transition-colors border border-transparent hover:border-border"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user.username}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 px-2 hover:bg-primary/10 hover:text-primary"
                                            onClick={() => handleAssign(user.id, user.username)}
                                            disabled={assignUser.isPending}
                                        >
                                            {assignUser.isPending ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                                            )}
                                            Assign
                                        </Button>
                                    </div>
                                ))
                            ) : search ? (
                                <div className="text-center py-8 text-xs text-muted-foreground">
                                    No users found matching &quot;{search}&quot;
                                </div>
                            ) : (
                                <div className="text-center py-8 text-xs text-muted-foreground">
                                    Type to search and assign users...
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">Current Members</h3>
                    <Badge variant="secondary" className="font-normal">
                        {members.length} {members.length === 1 ? "user" : "users"}
                    </Badge>
                </div>

                <div className="rounded-md border bg-card min-h-[120px]">
                    <ScrollArea className="h-[300px] w-full">
                        <div className="p-2 space-y-1">
                            {isLoadingMembers ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            ) : members.length > 0 ? (
                                members.map((user) => (
                                    <div
                                        key={user.id}
                                        className="flex items-center justify-between p-2 rounded-sm hover:bg-muted/50 transition-colors border border-transparent"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user.username}</span>
                                            <span className="text-xs text-muted-foreground">{user.email}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => handleRemove(user.id, user.username)}
                                            disabled={removeUser.isPending}
                                        >
                                            {removeUser.isPending ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <>
                                                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                                    Remove
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-xs text-muted-foreground">
                                    No members assigned to this group yet.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 border border-amber-100 dark:border-amber-900/30">
                <div className="flex gap-3">
                    <div className="mt-0.5">
                        <Check className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-amber-800 dark:text-amber-400">
                            Assignment complete?
                        </p>
                        <p className="text-[11px] text-amber-700/80 dark:text-amber-500/80 leading-relaxed">
                            Users assigned to this group will inherit all permissions defined in the <strong>Access Rights</strong> tab.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
