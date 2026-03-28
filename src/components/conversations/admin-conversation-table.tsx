"use client";

import { useState } from "react";
import {
    Search,
    User,
    MessageSquare,
    Calendar,
    ExternalLink,
    Trash2,
    ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    useAllConversations,
    useDeleteAnyConversation,
} from "@/lib/queries/conversations";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function AdminConversationTable() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const { data: conversations, isLoading } = useAllConversations();
    const deleteMutation = useDeleteAnyConversation();

    const filtered = conversations?.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
        const matchesUser = !userFilter || c.user?.username.toLowerCase().includes(userFilter.toLowerCase()) || c.user?.email.toLowerCase().includes(userFilter.toLowerCase());
        return matchesSearch && matchesUser;
    });

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Search Titles</label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search conversation titles..."
                            className="pl-9 h-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-full sm:w-64 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground ml-1">Filter by User</label>
                    <div className="relative">
                        <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Username or Email..."
                            className="pl-9 h-10"
                            value={userFilter}
                            onChange={(e) => setUserFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[300px]">Conversation</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-center">Messages</TableHead>
                            <TableHead>Last Activity</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-8 mx-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : filtered?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                    No conversations found matching your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filtered?.map((conv) => (
                                <TableRow key={conv.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <MessageSquare className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-sm truncate">{conv.title}</p>
                                                <p className="text-[10px] text-muted-foreground font-mono truncate opacity-60">ID: {conv.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {conv.user ? (
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-medium">{conv.user.username}</p>
                                                <p className="text-xs text-muted-foreground">{conv.user.email}</p>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-muted-foreground italic">Anonymous/Deleted</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="font-mono">{conv.message_count}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(conv.updated_at).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="sm" className="h-8" onClick={() => router.push(`/conversations/${conv.id}`)}>
                                                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                                Audit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => {
                                                    if (confirm("Permanently delete this user's conversation?")) {
                                                        deleteMutation.mutate(conv.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
