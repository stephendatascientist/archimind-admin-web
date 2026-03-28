"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
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
import { useCurrentUser } from "@/lib/queries/auth";
import { useUpdateProfile } from "@/lib/queries/users";
import { UserProfileUpdate } from "@/lib/types/api";

const profileSchema = z.object({
    first_name: z.string().max(100).nullable(),
    last_name: z.string().max(100).nullable(),
    avatar_url: z.string().max(255).url().or(z.literal("")).nullable(),
    bio: z.string().nullable(),
    job_title: z.string().max(100).nullable(),
    company: z.string().max(100).nullable(),
    location: z.string().max(100).nullable(),
    phone_number: z.string().max(20).nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
    const { data: user, isLoading } = useCurrentUser();
    const updateProfile = useUpdateProfile();

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            avatar_url: "",
            bio: "",
            job_title: "",
            company: "",
            location: "",
            phone_number: "",
        },
    });

    useEffect(() => {
        if (user?.profile) {
            form.reset({
                first_name: user.profile.first_name ?? "",
                last_name: user.profile.last_name ?? "",
                avatar_url: user.profile.avatar_url ?? "",
                bio: user.profile.bio ?? "",
                job_title: user.profile.job_title ?? "",
                company: user.profile.company ?? "",
                location: user.profile.location ?? "",
                phone_number: user.profile.phone_number ?? "",
            });
        }
    }, [user, form]);

    async function onSubmit(data: ProfileFormData) {
        try {
            // Clean up empty strings to nulls for the API if needed, 
            // or just send as is if the API handles it.
            const payload: UserProfileUpdate = Object.fromEntries(
                Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
            );

            await updateProfile.mutateAsync(payload);
            toast.success("Profile updated successfully.");
        } catch {
            toast.error("Failed to update profile. Please try again.");
        }
    }

    if (isLoading) {
        return <div className="py-4 text-center text-sm text-muted-foreground">Loading profile...</div>;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Doe" {...field} value={field.value ?? ""} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="job_title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Job Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Senior Engineer" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                                <Input placeholder="Acme Inc." {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="San Francisco, CA" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="+1234567890" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="avatar_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Avatar URL</FormLabel>
                            <FormControl>
                                <Input placeholder="https://example.com/avatar.jpg" {...field} value={field.value ?? ""} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Bio</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell us about yourself..."
                                    className="resize-none"
                                    {...field}
                                    value={field.value ?? ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" disabled={updateProfile.isPending} className="gap-2">
                    {updateProfile.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    Save Profile
                </Button>
            </form>
        </Form>
    );
}
