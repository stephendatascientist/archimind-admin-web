import { PagePlaceholder } from "@/components/shared/page-placeholder";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Global platform configuration.</p>
      </div>
      <PagePlaceholder
        title="Settings Coming Soon"
        description="Platform settings will allow configuring global defaults, LLM providers, integrations, and system preferences."
      />
    </div>
  );
}
