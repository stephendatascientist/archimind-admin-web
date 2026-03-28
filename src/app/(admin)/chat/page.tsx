"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ConversationList } from "@/components/chat/conversation-list";

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>();

  return (
    <div className="flex flex-1 h-full overflow-hidden -m-4 sm:-m-6">
      <aside className="w-80 border-r flex flex-col bg-background">
        <ConversationList
          activeId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          onNewChat={() => setSelectedId(undefined)}
        />
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-background">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground text-xs">
            Interact with your agentic app instances. Plans requiring approval will appear inline.
          </p>
        </div>
        <div className="flex-1 min-h-0 bg-muted/5">
          <ChatInterface
            conversationId={selectedId}
            onConversationIdChange={(id) => setSelectedId(id)}
          />
        </div>
      </main>
    </div>
  );
}
