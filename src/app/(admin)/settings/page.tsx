"use client";

import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="rounded-full bg-primary/10 p-6">
        <Settings className="h-12 w-12 text-primary animate-pulse" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          General application settings are currently under implementation.
          Check back soon for more options!
        </p>
      </div>
    </div>
  );
}

