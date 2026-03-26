"use client";

import {
  AlertCircle,
  CheckCircle,
  ListChecks,
  Shield,
  ShieldAlert,
  ShieldCheck,
  XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PlanMetadata, PlanStep } from "@/lib/types/api";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Markdown } from "./markdown";

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

  // Clean the plan string from potential triple quotes (as seen in user screenshot)
  const cleanPlan = plan.replace(/^["']{3}(sql)?|["']{3}$/g, '').trim();

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-4 space-y-4">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              Review Proposed Plan
            </span>
            <span className="text-[11px] text-muted-foreground">
              Agent requires authorization for this action
            </span>
          </div>
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
          <div className="h-1 w-24 bg-muted rounded-full overflow-hidden">
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

      <div className="space-y-4">
        {/* Description */}
        <div className="rounded-lg bg-muted/30 p-3 border border-border/50">
          <Markdown content={cleanPlan} className="text-sm leading-relaxed" />
        </div>

        {/* Steps List */}
        {steps.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
              <ListChecks className="h-3 w-3 text-primary" />
              Proposed Execution Steps
            </div>
            <div className="grid gap-2.5">
              {steps.map((step) => (
                <div key={step.step_number} className="flex gap-3 p-3 rounded-lg bg-background border border-border transition-colors hover:border-primary/20 shadow-sm">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/5 border border-primary/20 text-[11px] font-bold text-primary">
                    {step.step_number}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-foreground leading-snug">{step.description}</p>
                    <Badge variant="outline" className="h-4.5 px-2 text-[9px] font-semibold uppercase tracking-wider bg-muted/50 text-muted-foreground border-border">
                      {step.action_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-1 px-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[10px] font-bold px-2 py-0.5 rounded-md">
              Target: {workerInfo.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground font-medium">
              Mode: {workerInfo.syntax}
            </span>
          </div>
          {workerInfo.critical && (
            <div className="flex items-center gap-1.5 text-red-500 font-bold text-[10px] uppercase tracking-tighter">
              <AlertCircle className="h-3 w-3" />
              Critical Action
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2.5 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-muted-foreground px-1">
            {showFeedback ? "Instructions for the agent:" : "Optional Instructions:"}
          </p>
          {!showFeedback && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/5"
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
            placeholder="e.g. Looks good, but verify the timestamps before executing..."
            rows={2}
            className="text-sm resize-none bg-background border-border focus:ring-primary/20"
            autoFocus
          />
        )}
      </div>

      <div className="flex gap-2.5 pt-1">
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={isLoading}
          className="gap-2 flex-1 font-semibold shadow-sm"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Approve & Execute
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleReject}
          disabled={isLoading}
          className="gap-2 flex-1 border-border bg-background text-foreground hover:bg-muted hover:text-foreground shadow-sm"
        >
          <XCircle className="h-3.5 w-3.5" />
          {showFeedback ? "Send & Replan" : "Reject Plan"}
        </Button>
      </div>
    </div>
  );
}
