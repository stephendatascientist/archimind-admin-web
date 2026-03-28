"use client";

import { useState } from "react";
import {
    MessageSquare,
    MoreVertical,
    Pencil,
    Trash2,
    Plus,
    Search,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    useConversations,
    useDeleteConversation,
    useRenameConversation,
} from "@/lib/queries/conversations";
import { Skeleton } from "@/components/ui/skeleton";

interface ConversationListProps {
    activeId?: string;
    onSelect: (id: string) => void;
    onNewChat: () => void;
}

export function ConversationList({ activeId, onSelect, onNewChat }: ConversationListProps) {
    const { data: conversations, isLoading } = useConversations();
    const deleteMutation = useDeleteConversation();
    const renameMutation = useRenameConversation();
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");

    const filteredConversations = conversations?.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleRename = async (id: string) => {
        if (!editTitle.trim()) {
            setEditingId(null);
            return;
        }
        try {
            await renameMutation.mutateAsync({ id, title: editTitle.trim() });
            setEditingId(null);
        } catch (error) {
            console.error("Rename failed", error);
        }
    };

    return (
        <div className="flex h-full flex-col border-r bg-muted/10">
            <div className="p-4 space-y-4">
                <Button onClick={onNewChat} className="w-full justify-start gap-2 shadow-sm font-semibold h-10" variant="default">
                    <Plus className="h-4 w-4" />
                    New Chat
                </Button>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search chats..."
                        className="pl-9 bg-background/50 h-9 text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="px-2 py-3 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    ))
                ) : filteredConversations?.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                        <p className="text-xs text-muted-foreground font-medium">No conversations found</p>
                    </div>
                ) : (
                    filteredConversations?.map((conv) => (
                        <div
                            key={conv.id}
                            className={cn(
                                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-muted cursor-pointer border border-transparent",
                                activeId === conv.id ? "bg-primary/5 border-primary/20 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => onSelect(conv.id)}
                        >
                            <MessageSquare className={cn("h-4 w-4 shrink-0 mt-0.5", activeId === conv.id ? "text-primary" : "text-muted-foreground/60")} />

                            <div className="flex-1 min-w-0 pr-6">
                                {editingId === conv.id ? (
                                    <Input
                                        autoFocus
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        onBlur={() => handleRename(conv.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleRename(conv.id);
                                            if (e.key === "Escape") setEditingId(null);
                                        }}
                                        className="h-7 py-0 px-1 text-sm focus-visible:ring-1"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <>
                                        <p className="truncate leading-snug">{conv.title}</p>
                                        <p className="text-[10px] opacity-60 mt-0.5 font-normal">
                                            {new Date(conv.created_at).toLocaleDateString()}
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu modal={false}>
                                    <DropdownMenuTrigger
                                        render={<Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" />}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="h-3.5 w-3.5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingId(conv.id);
                                                setEditTitle(conv.title);
                                            }}
                                            className="gap-2"
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                            Rename
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm("Are you sure you want to delete this conversation?")) {
                                                    deleteMutation.mutate(conv.id);
                                                }
                                            }}
                                            className="gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
