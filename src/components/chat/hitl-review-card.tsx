"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { PlanMetadata } from "@/lib/types/api";

const WORKER_LABELS: Record<string, { label: string; syntax: string; critical?: boolean }> = {
  database: { label: "Database", syntax: "SQL" },
  gitlab: { label: "GitLab", syntax: "CI / Action Plan" },
  jira: { label: "Jira", syntax: "JQL / Task" },
  superset: { label: "Superset", syntax: "SQL / Chart Config" },
  grafana: { label: "Grafana", syntax: "PromQL / LogQL" },
  kibana: { label: "Kibana", syntax: "KQL / DSL" },
  servicenow: { label: "ServiceNow", syntax: "ITSM Action Plan" },
  confluence: { label: "Confluence", syntax: "Document Plan" },
  network_router: { label: "Network Router", syntax: "Config Change", critical: true },
};

interface HitlReviewCardProps {
  plan: string;
  planMetadata: PlanMetadata;
  onApprove: () => void;
  onReject: (feedback?: string) => void;
  isLoading?: boolean;
}

export function HitlReviewCard({
  plan,
  planMetadata,
  onApprove,
  onReject,
  isLoading,
}: HitlReviewCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  const workerInfo = WORKER_LABELS[planMetadata.worker] ?? {
    label: planMetadata.worker,
    syntax: planMetadata.type,
  };

  function handleReject() {
    if (!showFeedback) {
      setShowFeedback(true);
      return;
    }
    onReject(feedback.trim() || undefined);
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
        <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Agent plan requires your approval
        </span>
        <Badge variant="outline" className="ml-auto text-xs">
          {workerInfo.label} — {workerInfo.syntax}
        </Badge>
        {workerInfo.critical && (
          <Badge variant="destructive" className="text-xs">
            Critical
          </Badge>
        )}
      </div>

      <pre className="rounded-md bg-zinc-900 text-zinc-100 text-xs p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
        {plan}
      </pre>

      {showFeedback && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">
            Optional feedback — the agent will use this to replan:
          </p>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. Don't use SELECT *, add a WHERE clause..."
            rows={2}
            className="text-sm resize-none"
            autoFocus
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onApprove}
          disabled={isLoading}
          className="gap-1.5"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={isLoading}
          className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40"
        >
          <XCircle className="h-3.5 w-3.5" />
          {showFeedback ? "Send feedback & replan" : "Reject"}
        </Button>
      </div>
    </div>
  );
}
