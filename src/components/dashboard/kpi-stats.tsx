"use client";

import { UserCheck, MessageCircle, MessageSquare, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSummary } from "@/lib/types/dashboard";

interface KPIStatsProps {
    summary?: DashboardSummary;
    isLoading: boolean;
}

export function KPIStats({ summary, isLoading }: KPIStatsProps) {
    const stats = [
        {
            label: "Active Users",
            value: summary?.active_users,
            icon: UserCheck,
            description: "Users active in the last 30 days",
        },
        {
            label: "Conversations",
            value: summary?.total_conversations,
            icon: MessageCircle,
            description: "Total chat sessions",
        },
        {
            label: "Messages",
            value: summary?.total_messages,
            icon: MessageSquare,
            description: "User messages only",
        },
        {
            label: "Total Tokens",
            value: summary?.total_tokens?.toLocaleString(),
            icon: Database,
            description: "Estimated token consumption",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.label}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-2xl font-bold">{stat.value ?? 0}</div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
