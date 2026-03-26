"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";

const schema = z.object({
    is_active: z.boolean(),
    is_superuser: z.boolean(),
});

export type UserFormData = z.infer<typeof schema>;

interface UserFormProps {
    defaultValues?: Partial<UserFormData>;
    onSubmit: (data: UserFormData) => void | Promise<void>;
    isLoading?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
}

export function UserForm({
    defaultValues,
    onSubmit,
    isLoading,
    submitLabel = "Save Changes",
    onCancel,
}: UserFormProps) {
    const form = useForm<UserFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            is_active: defaultValues?.is_active ?? true,
            is_superuser: defaultValues?.is_superuser ?? false,
        },
    });

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                is_active: defaultValues.is_active ?? true,
                is_superuser: defaultValues.is_superuser ?? false,
            });
        }
    }, [defaultValues, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active">Active</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Inactive users cannot log in.
                                    </p>
                                </div>
                                <FormControl>
                                    <Switch
                                        id="is_active"
                                        checked={field.value}
                                        onCheckedChange={(checked) => field.onChange(checked)}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="is_superuser"
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_superuser">Superuser</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Grants full administrative access, bypassing all access checks.
                                    </p>
                                </div>
                                <FormControl>
                                    <Switch
                                        id="is_superuser"
                                        checked={field.value}
                                        onCheckedChange={(checked) => field.onChange(checked)}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-3">
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
