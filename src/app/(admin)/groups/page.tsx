import { PagePlaceholder } from "@/components/shared/page-placeholder";

export default function GroupsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
        <p className="text-muted-foreground text-sm">Manage user groups and access control.</p>
      </div>
      <PagePlaceholder
        title="Groups Management Coming Soon"
        description="Group management endpoints are not yet available in the API. This section will enable creating groups, assigning users, and controlling app access."
      />
    </div>
  );
}
