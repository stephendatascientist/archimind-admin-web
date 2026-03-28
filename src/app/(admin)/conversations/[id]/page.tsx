"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, MessageSquare, User, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAnyConversation } from "@/lib/queries/conversations";
import { MessageBubble } from "@/components/chat/message-bubble";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ConversationAuditPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const { data: conversation, isLoading } = useAnyConversation(id);

    if (isLoading) {
        return (
            <div className="flex flex-col h-full space-y-6 max-w-5xl mx-auto w-full p-4">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-12 w-full" />
                </div>
                <div className="flex-1 space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <p className="text-muted-foreground">Conversation not found or access denied.</p>
                <Button onClick={() => router.push("/conversations")}>Back to List</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto w-full">
            {/* Header */}
            <div className="p-4 border-b bg-background/50 backdrop-blur sticky top-0 z-10 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold truncate">{conversation.title}</h1>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {conversation.user?.username || "Unknown"} ({conversation.user?.email || "No Email"})
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(conversation.created_at).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(conversation.created_at).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                    <Badge variant="outline" className="h-6">Audit Mode</Badge>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {conversation.messages.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground space-y-2">
                        <MessageSquare className="h-8 w-8 opacity-20" />
                        <p className="text-sm">No messages in this conversation.</p>
                    </div>
                ) : (
                    conversation.messages.map((m, idx) => (
                        <MessageBubble
                            key={idx}
                            role={m.role === "assistant" ? "assistant" : "user"}
                            content={m.content}
                        />
                    ))
                )}
            </div>

            {/* Footer info */}
            <div className="p-4 border-t bg-muted/30 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                    End of Audit Log — Conversation ID: {conversation.id}
                </p>
            </div>
        </div>
    );
}
