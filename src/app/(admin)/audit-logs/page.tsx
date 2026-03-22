import { PagePlaceholder } from "@/components/shared/page-placeholder";

export default function AuditLogsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground text-sm">Review a complete activity trail of admin actions.</p>
      </div>
      <PagePlaceholder
        title="Audit Logs Coming Soon"
        description="Audit log endpoints are not yet available in the API. This section will provide a searchable timeline of all admin actions performed on the platform."
      />
    </div>
  );
}
