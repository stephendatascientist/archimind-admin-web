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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UserUsage } from "@/lib/types/dashboard";
import { format, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { useDashboardUsers } from "@/lib/queries/dashboard";

interface UserUsageTableProps {
    initialData?: UserUsage[];
}

const PAGE_SIZE = 10;

export function UserUsageTable({ initialData }: UserUsageTableProps) {
    const [page, setPage] = useState(0);
    const offset = page * PAGE_SIZE;

    // We use the hook here to support pagination, even if initialData exists from a full payload
    const { data: users, isLoading } = useDashboardUsers(PAGE_SIZE, offset);

    const displayData = users || initialData?.slice(offset, offset + PAGE_SIZE) || [];

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Top Users</CardTitle>
                <CardDescription>Most active users by message count.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading && !users ? (
                    <div className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-right">Conversations</TableHead>
                                        <TableHead className="text-right">Messages</TableHead>
                                        <TableHead className="text-right">Tokens</TableHead>
                                        <TableHead className="text-right">Last Activity</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {displayData.map((user) => (
                                        <TableRow key={user.user_id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <div>{user.username}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">{user.conversation_count}</TableCell>
                                            <TableCell className="text-right">{user.message_count}</TableCell>
                                            <TableCell className="text-right">{user.total_tokens.toLocaleString()}</TableCell>
                                            <TableCell className="text-right text-sm text-muted-foreground">
                                                {user.last_activity
                                                    ? format(parseISO(user.last_activity), "MMM dd, HH:mm")
                                                    : "N/A"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {displayData.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                No user activity found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                                Showing {offset + 1} to {offset + displayData.length} users
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={displayData.length < PAGE_SIZE}
                                >
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
