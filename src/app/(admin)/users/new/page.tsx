"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserForm, type UserFormData } from "@/components/users/user-form";
import { useCreateUser } from "@/lib/queries/users";

export default function NewUserPage() {
    const router = useRouter();
    const createUser = useCreateUser();

    const handleCreate = async (data: UserFormData) => {
        try {
            await createUser.mutateAsync(data);
            toast.success("User created successfully");
            router.push("/users");
        } catch {
            toast.error("Failed to create user");
        }
    };

    return (
        <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/users" />}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">New User</h1>
            </div>

            <div className="border rounded-lg p-6 bg-card">
                <UserForm
                    onSubmit={handleCreate}
                    isLoading={createUser.isPending}
                    isEdit={false}
                    submitLabel="Create User"
                    onCancel={() => router.push("/users")}
                />
            </div>
        </div>
    );
}
