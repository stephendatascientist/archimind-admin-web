"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppInstanceUsage } from "@/lib/types/dashboard";
import { ChevronDown, ChevronRight } from "lucide-react";
import { format, parseISO } from "date-fns";

interface AppInstanceUsageTableProps {
    data?: AppInstanceUsage[];
    isLoading: boolean;
}

export function AppInstanceUsageTable({ data, isLoading }: AppInstanceUsageTableProps) {
    const [expandedApps, setExpandedApps] = useState<Record<string, boolean>>({});

    const groupedData = (data || []).reduce((acc, instance) => {
        if (!acc[instance.app_name]) {
            acc[instance.app_name] = [];
        }
        acc[instance.app_name].push(instance);
        return acc;
    }, {} as Record<string, AppInstanceUsage[]>);

    const toggleApp = (appName: string) => {
        setExpandedApps((prev) => ({ ...prev, [appName]: !prev[appName] }));
    };

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>App Instance Breakdown</CardTitle>
                <CardDescription>Detailed usage metrics per deployed instance.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[300px]">Instance / App</TableHead>
                                    <TableHead className="text-right">Conversations</TableHead>
                                    <TableHead className="text-right">Messages</TableHead>
                                    <TableHead className="text-right">Tokens</TableHead>
                                    <TableHead className="text-right">Users</TableHead>
                                    <TableHead className="text-right">Last Activity</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(groupedData).map(([appName, instances]) => {
                                    const isExpanded = expandedApps[appName];
                                    const totalConversations = instances.reduce((sum, i) => sum + i.conversation_count, 0);
                                    const totalMessages = instances.reduce((sum, i) => sum + i.message_count, 0);
                                    const totalTokens = instances.reduce((sum, i) => sum + i.total_tokens, 0);
                                    const totalUsers = instances.reduce((sum, i) => sum + i.unique_users, 0);

                                    return (
                                        <>
                                            <TableRow
                                                key={appName}
                                                className="cursor-pointer hover:bg-muted/30 font-medium"
                                                onClick={() => toggleApp(appName)}
                                            >
                                                <TableCell className="flex items-center gap-2">
                                                    {isExpanded ? (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                    {appName}
                                                    <span className="ml-2 text-xs text-muted-foreground font-normal">
                                                        ({instances.length} instance{instances.length !== 1 ? "s" : ""})
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">{totalConversations}</TableCell>
                                                <TableCell className="text-right">{totalMessages}</TableCell>
                                                <TableCell className="text-right">{totalTokens.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">{totalUsers}</TableCell>
                                                <TableCell className="text-right">—</TableCell>
                                            </TableRow>
                                            {isExpanded &&
                                                instances.map((instance) => (
                                                    <TableRow key={instance.instance_id} className="bg-muted/5">
                                                        <TableCell className="pl-10 text-sm text-muted-foreground">
                                                            {instance.instance_name}
                                                        </TableCell>
                                                        <TableCell className="text-right text-sm">{instance.conversation_count}</TableCell>
                                                        <TableCell className="text-right text-sm">{instance.message_count}</TableCell>
                                                        <TableCell className="text-right text-sm">{instance.total_tokens.toLocaleString()}</TableCell>
                                                        <TableCell className="text-right text-sm">{instance.unique_users}</TableCell>
                                                        <TableCell className="text-right text-sm">
                                                            {instance.last_activity
                                                                ? format(parseISO(instance.last_activity), "MMM dd, HH:mm")
                                                                : "N/A"}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                        </>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
