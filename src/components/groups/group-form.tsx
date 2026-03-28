"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GranularPermissionsTable } from "./granular-permissions-table";
import { GroupUsersTab } from "./group-users-tab";

const schema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(64),
    description: z.string().optional(),
    app_instance_accesses: z.array(z.object({
        instance_id: z.string().min(1, "Instance is required"),
        can_read: z.boolean(),
        can_write: z.boolean(),
        can_create: z.boolean(),
        can_delete: z.boolean(),
    })),
    id: z.string().optional(),
});

export type GroupFormData = z.infer<typeof schema>;

interface GroupFormProps {
    defaultValues?: Partial<GroupFormData>;
    onSubmit: (data: GroupFormData) => void | Promise<void>;
    isLoading?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
    isEdit?: boolean;
}

export function GroupForm({
    defaultValues,
    onSubmit,
    isLoading,
    submitLabel = "Save Changes",
    onCancel,
    isEdit,
}: GroupFormProps) {
    const form = useForm<GroupFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: defaultValues?.name || "",
            description: defaultValues?.description || "",
            app_instance_accesses: defaultValues?.app_instance_accesses || [],
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="details" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="users" disabled={!isEdit}>Users</TabsTrigger>
                        <TabsTrigger value="access" disabled={!isEdit}>Access Rights</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4 focus-visible:ring-0">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Engineering"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="System administrators with full access"
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>

                    <TabsContent value="users" className="focus-visible:ring-0">
                        {isEdit && defaultValues?.id && defaultValues?.name ? (
                            <GroupUsersTab
                                groupId={defaultValues.id}
                                groupName={defaultValues.name}
                            />
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-sm text-muted-foreground">
                                    Create the group first to manage its members.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="access" className="focus-visible:ring-0">
                        <FormField
                            control={form.control}
                            name="app_instance_accesses"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <GranularPermissionsTable
                                            value={field.value}
                                            onChange={field.onChange}
                                            groupId={defaultValues?.id}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-3 pt-4">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {submitLabel}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
