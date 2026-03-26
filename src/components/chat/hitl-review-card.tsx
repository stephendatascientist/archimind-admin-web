"use client";

import { AlertTriangle, CheckCircle, ListChecks, Shield, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PlanMetadata, PlanStep } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
  steps?: PlanStep[];
  confidence?: number;
  planMetadata?: PlanMetadata;
  onApprove: (feedback?: string) => void;
  onReject: (feedback?: string) => void;
  isLoading?: boolean;
}

export function HitlReviewCard({
  plan,
  steps = [],
  confidence = 1.0,
  planMetadata,
  onApprove,
  onReject,
  isLoading,
}: HitlReviewCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  const workerInfo = planMetadata ? (WORKER_LABELS[planMetadata.worker] ?? {
    label: planMetadata.worker,
    syntax: planMetadata.type,
  }) : { label: "Agent", syntax: "Execution" };

  function handleApprove() {
    onApprove(feedback.trim() || undefined);
  }

  function handleReject() {
    if (!showFeedback && !feedback.trim()) {
      setShowFeedback(true);
      return;
    }
    onReject(feedback.trim() || undefined);
  }

  const confidencePercentage = Math.round(confidence * 100);
  const isHighConfidence = confidence >= 0.9;
  const isLowConfidence = confidence < 0.7;

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Agent plan requires your approval
          </span>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider",
            isHighConfidence
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
              : isLowConfidence
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800"
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
          )}>
            {isHighConfidence ? <ShieldCheck className="h-3 w-3" /> : isLowConfidence ? <ShieldAlert className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
            {confidencePercentage}% Confidence
          </div>
          <div className="h-1 w-24 bg-amber-200/50 dark:bg-amber-800/50 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-500",
                isHighConfidence ? "bg-emerald-500" : isLowConfidence ? "bg-red-500" : "bg-blue-500"
              )}
              style={{ width: `${confidencePercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Description */}
        <div className="text-xs text-amber-900/80 dark:text-amber-200/80 italic leading-relaxed">
          "{plan}"
        </div>

        {/* Steps List */}
        {steps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              <ListChecks className="h-3 w-3" />
              Proposed Steps
            </div>
            <div className="grid gap-2">
              {steps.map((step) => (
                <div key={step.step_number} className="flex gap-3 p-2.5 rounded-md bg-white/50 dark:bg-black/20 border border-amber-200/50 dark:border-amber-800/50 shadow-sm">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                    {step.step_number}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">{step.description}</p>
                    <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-normal uppercase bg-muted/30">
                      {step.action_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Badge variant="secondary" className="text-[10px] font-medium px-2 py-0">
            {workerInfo.label} — {workerInfo.syntax}
          </Badge>
          {workerInfo.critical && (
            <Badge variant="destructive" className="text-[10px] h-5">
              CRITICAL ACTION
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-amber-200/50 dark:border-amber-800/50">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium text-muted-foreground">
            {showFeedback ? "Provide feedback to the agent:" : "Add optional feedback:"}
          </p>
          {!showFeedback && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] text-amber-700 dark:text-amber-400"
              onClick={() => setShowFeedback(true)}
            >
              Add instructions
            </Button>
          )}
        </div>
        {showFeedback && (
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. Looks good, but also check the logs..."
            rows={2}
            className="text-sm resize-none bg-white dark:bg-black/40 border-amber-200 dark:border-amber-800"
            autoFocus
          />
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={isLoading}
          className="gap-1.5 flex-1 sm:flex-none shadow-sm"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Approve & Execute
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={isLoading}
          className="gap-1.5 flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40 shadow-sm"
        >
          <XCircle className="h-3.5 w-3.5" />
          {showFeedback ? "Send feedback & replan" : "Reject"}
        </Button>
      </div>
    </div>
  );
}
