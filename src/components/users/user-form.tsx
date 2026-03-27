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
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useEffect } from "react";

const schema = z.object({
    username: z.string().min(1, "Username is required").max(64),
    email: z.string().email("Invalid email").min(1, "Email is required"),
    password: z.string().min(8, "Password must be at least 8 characters").optional(),
    is_active: z.boolean(),
    is_superuser: z.boolean(),
    profile: z.object({
        first_name: z.string().max(100).nullable(),
        last_name: z.string().max(100).nullable(),
        avatar_url: z.string().max(255).url().or(z.literal("")).nullable(),
        bio: z.string().nullable(),
        job_title: z.string().max(100).nullable(),
        company: z.string().max(100).nullable(),
        location: z.string().max(100).nullable(),
        phone_number: z.string().max(20).nullable(),
    }).optional(),
});

export type UserFormData = z.infer<typeof schema>;

interface UserFormProps {
    defaultValues?: any; // Using any for simplicity with nested profile
    onSubmit: (data: UserFormData) => void | Promise<void>;
    isLoading?: boolean;
    isEdit?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
}

export function UserForm({
    defaultValues,
    onSubmit,
    isLoading,
    isEdit = false,
    submitLabel = "Save Changes",
    onCancel,
}: UserFormProps) {
    const form = useForm<UserFormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            username: defaultValues?.username ?? "",
            email: defaultValues?.email ?? "",
            password: "",
            is_active: defaultValues?.is_active ?? true,
            is_superuser: defaultValues?.is_superuser ?? false,
            profile: {
                first_name: defaultValues?.profile?.first_name ?? "",
                last_name: defaultValues?.profile?.last_name ?? "",
                avatar_url: defaultValues?.profile?.avatar_url ?? "",
                bio: defaultValues?.profile?.bio ?? "",
                job_title: defaultValues?.profile?.job_title ?? "",
                company: defaultValues?.profile?.company ?? "",
                location: defaultValues?.profile?.location ?? "",
                phone_number: defaultValues?.profile?.phone_number ?? "",
            },
        },
    });

    useEffect(() => {
        if (defaultValues) {
            form.reset({
                username: defaultValues.username ?? "",
                email: defaultValues.email ?? "",
                password: "",
                is_active: defaultValues.is_active ?? true,
                is_superuser: defaultValues.is_superuser ?? false,
                profile: {
                    first_name: defaultValues.profile?.first_name ?? "",
                    last_name: defaultValues.profile?.last_name ?? "",
                    avatar_url: defaultValues.profile?.avatar_url ?? "",
                    bio: defaultValues.profile?.bio ?? "",
                    job_title: defaultValues.profile?.job_title ?? "",
                    company: defaultValues.profile?.company ?? "",
                    location: defaultValues.profile?.location ?? "",
                    phone_number: defaultValues.profile?.phone_number ?? "",
                },
            });
        }
    }, [defaultValues, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="account" className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                    </TabsList>

                    <TabsContent value="account" className="space-y-4 focus-visible:ring-0">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="johndoe" {...field} disabled={isEdit || isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="john@example.com" {...field} disabled={isEdit || isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {!isEdit && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password *</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="pt-2 space-y-4">
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
                        </div>
                    </TabsContent>

                    <TabsContent value="profile" className="space-y-4 focus-visible:ring-0">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="profile.first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} value={field.value ?? ""} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="profile.last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} value={field.value ?? ""} disabled={isLoading} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="profile.job_title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Job Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Senior Engineer" {...field} value={field.value ?? ""} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="profile.company"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Company</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Acme Inc." {...field} value={field.value ?? ""} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="profile.location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="San Francisco, CA" {...field} value={field.value ?? ""} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="profile.phone_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+1234567890" {...field} value={field.value ?? ""} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="profile.avatar_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Avatar URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://example.com/avatar.jpg" {...field} value={field.value ?? ""} disabled={isLoading} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="profile.bio"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bio</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Tell us about the user..."
                                            className="resize-none"
                                            {...field}
                                            value={field.value ?? ""}
                                            disabled={isLoading}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </TabsContent>
                </Tabs>

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
