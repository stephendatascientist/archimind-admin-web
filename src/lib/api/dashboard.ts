import { apiClient } from "./client";
import {
    DashboardResponse,
    DashboardSummary,
    AppUsage,
    AppInstanceUsage,
    UserUsage,
    ExecutionPlanStats,
    DailyActivity,
} from "../types/dashboard";

export const dashboardApi = {
    /**
     * Returns the full dashboard payload in a single request.
     * Ideal for the initial page load.
     */
    getFull: (days = 30) =>
        apiClient.get<DashboardResponse>(`/dashboard?days=${days}`).then((r) => r.data),

    /**
     * Returns only the top-level summary counts.
     */
    getSummary: () =>
        apiClient.get<DashboardSummary>("/dashboard/summary").then((r) => r.data),

    /**
     * Returns usage aggregates for every App.
     */
    getApps: () =>
        apiClient.get<AppUsage[]>("/dashboard/apps").then((r) => r.data),

    /**
     * Returns usage aggregates for every AppInstance.
     */
    getAppInstances: () =>
        apiClient.get<AppInstanceUsage[]>("/dashboard/app-instances").then((r) => r.data),

    /**
     * Returns per-user aggregates sorted by message count descending.
     */
    getUsers: (limit = 50, offset = 0) =>
        apiClient
            .get<UserUsage[]>(`/dashboard/users`, { params: { limit, offset } })
            .then((r) => r.data),

    /**
     * Returns counts of execution plans broken down by lifecycle status.
     */
    getExecutionPlans: () =>
        apiClient.get<ExecutionPlanStats>("/dashboard/execution-plans").then((r) => r.data),

    /**
     * Returns day-by-day conversation and user-message counts for a rolling window.
     */
    getActivity: (days = 30) =>
        apiClient.get<DailyActivity[]>(`/dashboard/activity`, { params: { days } }).then((r) => r.data),
};
