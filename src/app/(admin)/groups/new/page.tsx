"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GroupForm, type GroupFormData } from "@/components/groups/group-form";
import { useCreateGroup } from "@/lib/queries/groups";

export default function NewGroupPage() {
    const router = useRouter();
    const createGroup = useCreateGroup();

    const handleCreate = async (data: GroupFormData) => {
        try {
            await createGroup.mutateAsync({
                name: data.name,
                description: data.description || null,
                app_instance_accesses: data.app_instance_accesses,
            });
            toast.success(`Group "${data.name}" created`);
            router.push("/groups");
        } catch {
            toast.error("Failed to create group");
        }
    };

    return (
        <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/groups" />}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">New Group</h1>
            </div>

            <div className="border rounded-lg p-6 bg-card">
                <GroupForm
                    onSubmit={handleCreate}
                    isLoading={createGroup.isPending}
                    submitLabel="Create Group"
                    onCancel={() => router.push("/groups")}
                />
            </div>
        </div>
    );
}
