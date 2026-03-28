"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/users/profile-form";

export default function ProfileSettingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
                <p className="text-muted-foreground text-sm">Manage your personal information.</p>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                    <CardDescription>
                        Update your personal information and how others see you.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProfileForm />
                </CardContent>
            </Card>
        </div>
    );
}
