"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupForm, type GroupFormData } from "@/components/groups/group-form";
import { useGroups, useAssignUserToGroup, useUpdateGroup } from "@/lib/queries/groups";
import { AssignGroupDialog } from "@/components/groups/assign-group-dialog";
import { useState, useMemo } from "react";

export default function GroupDetailPage() {
    const { name } = useParams<{ name: string }>();
    const router = useRouter();
    const { data: groups = [], isLoading } = useGroups();
    const updateGroup = useUpdateGroup();
    const assignUser = useAssignUserToGroup();
    const [assignOpen, setAssignOpen] = useState(false);

    const group = useMemo(() => groups.find((g) => g.name === name), [groups, name]);

    const handleUpdate = async (data: GroupFormData) => {
        if (!group) return;
        try {
            await updateGroup.mutateAsync({
                groupId: group.id,
                payload: {
                    name: data.name,
                    description: data.description || null,
                    app_instance_accesses: data.app_instance_accesses,
                },
            });
            toast.success(`Group "${data.name}" updated`);
        } catch {
            toast.error("Failed to update group");
        }
    };

    const handleAssign = async (userId: string, groupName: string) => {
        try {
            await assignUser.mutateAsync({ userId, groupName });
            toast.success(`User assigned to "${groupName}"`);
            setAssignOpen(false);
        } catch {
            toast.error("Failed to assign user to group");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4 max-w-2xl">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (!group) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.push("/groups")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Groups
                </Button>
                <p className="text-muted-foreground">Group not found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/groups" />}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
                </div>
                <Button size="sm" onClick={() => setAssignOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign User
                </Button>
            </div>

            <div className="border rounded-lg p-6 bg-card">
                <GroupForm
                    defaultValues={{
                        ...group,
                        description: group.description ?? undefined,
                    }}
                    onSubmit={handleUpdate}
                    isLoading={updateGroup.isPending}
                    submitLabel="Save Changes"
                    onCancel={() => router.push("/groups")}
                    isEdit={true}
                />
            </div>

            <AssignGroupDialog
                open={assignOpen}
                onOpenChange={setAssignOpen}
                group={group}
                onSubmit={handleAssign}
                isLoading={assignUser.isPending}
            />
        </div>
    );
}
