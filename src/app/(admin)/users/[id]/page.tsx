"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserForm, type UserFormData } from "@/components/users/user-form";
import { useUser, useUpdateUser } from "@/lib/queries/users";

export default function UserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { data: user, isLoading } = useUser(id);
    const updateUser = useUpdateUser();

    const handleUpdate = async (data: UserFormData) => {
        try {
            await updateUser.mutateAsync({ userId: id, payload: data });
            toast.success("User updated successfully");
        } catch {
            toast.error("Failed to update user");
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

    if (!user) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.push("/users")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Users
                </Button>
                <p className="text-muted-foreground">User not found.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/users" />}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{user.username}</h1>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>

            <div className="border rounded-lg p-6 bg-card">
                <UserForm
                    defaultValues={user}
                    onSubmit={handleUpdate}
                    isLoading={updateUser.isPending}
                    onCancel={() => router.push("/users")}
                />
            </div>
        </div>
    );
}
