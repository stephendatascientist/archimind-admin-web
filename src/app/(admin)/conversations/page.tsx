"use client";

import { AdminConversationTable } from "@/components/conversations/admin-conversation-table";

export default function ConversationsOversightPage() {
    return (
        <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full">
            <div className="flex flex-col gap-1 px-1">
                <h1 className="text-3xl font-bold tracking-tight">Conversations Oversight</h1>
                <p className="text-muted-foreground text-sm">
                    Monitor and audit all user conversations across the system. Filter by user or search titles to find specific sessions.
                </p>
            </div>

            <div className="flex-1 bg-muted/20 rounded-2xl p-6 border shadow-sm">
                <AdminConversationTable />
            </div>
        </div>
    );
}
