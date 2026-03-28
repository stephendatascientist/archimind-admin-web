// ── Primitives ────────────────────────────────────────────────────────────────

export type UUID = string;       // "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export type ISODate = string;    // "YYYY-MM-DD"
export type ISODatetime = string; // ISO-8601 datetime with timezone

// ── Summary ───────────────────────────────────────────────────────────────────

export interface DashboardSummary {
    total_users: number;
    active_users: number;
    total_apps: number;
    total_app_instances: number;
    total_conversations: number;
    total_messages: number;
    total_tokens: number;
}

// ── App-wise usage ────────────────────────────────────────────────────────────

export interface AppUsage {
    app_id: UUID;
    app_slug: string;
    app_name: string;
    conversation_count: number;
    message_count: number;
    total_tokens: number;
    unique_users: number;
    last_activity: ISODatetime | null;
}

// ── App Instance-wise usage ───────────────────────────────────────────────────

export interface AppInstanceUsage {
    instance_id: UUID;
    instance_name: string;
    app_id: UUID;
    app_slug: string;
    app_name: string;
    conversation_count: number;
    message_count: number;
    total_tokens: number;
    unique_users: number;
    last_activity: ISODatetime | null;
}

// ── User-wise usage ───────────────────────────────────────────────────────────

export interface UserUsage {
    user_id: UUID;
    username: string;
    email: string;
    conversation_count: number;
    message_count: number;
    total_tokens: number;
    last_activity: ISODatetime | null;
}

// ── Execution-plan stats ──────────────────────────────────────────────────────

export interface ExecutionPlanStats {
    pending: number;
    approved: number;
    rejected: number;
    executed: number;
    total: number;
}

// ── Daily activity ────────────────────────────────────────────────────────────

export interface DailyActivity {
    date: ISODate;         // "2026-03-01"
    conversations: number;
    messages: number;      // user messages only
}

// ── Full dashboard ────────────────────────────────────────────────────────────

export interface DashboardResponse {
    summary: DashboardSummary;
    app_usage: AppUsage[];
    app_instance_usage: AppInstanceUsage[];
    user_usage: UserUsage[];
    execution_plan_stats: ExecutionPlanStats;
    daily_activity: DailyActivity[];
}
