import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard";

export const dashboardKeys = {
    all: ["dashboard"] as const,
    full: (days: number) => [...dashboardKeys.all, "full", days] as const,
    summary: () => [...dashboardKeys.all, "summary"] as const,
    apps: () => [...dashboardKeys.all, "apps"] as const,
    instances: () => [...dashboardKeys.all, "instances"] as const,
    users: (limit: number, offset: number) => [...dashboardKeys.all, "users", limit, offset] as const,
    executionPlans: () => [...dashboardKeys.all, "execution-plans"] as const,
    activity: (days: number) => [...dashboardKeys.all, "activity", days] as const,
};

export function useDashboard(days = 30) {
    return useQuery({
        queryKey: dashboardKeys.full(days),
        queryFn: () => dashboardApi.getFull(days),
        staleTime: 60_000,
    });
}

export function useDashboardSummary() {
    return useQuery({
        queryKey: dashboardKeys.summary(),
        queryFn: () => dashboardApi.getSummary(),
        staleTime: 60_000,
    });
}

export function useDashboardApps() {
    return useQuery({
        queryKey: dashboardKeys.apps(),
        queryFn: () => dashboardApi.getApps(),
        staleTime: 60_000,
    });
}

export function useDashboardInstances() {
    return useQuery({
        queryKey: dashboardKeys.instances(),
        queryFn: () => dashboardApi.getAppInstances(),
        staleTime: 60_000,
    });
}

export function useDashboardUsers(limit = 50, offset = 0) {
    return useQuery({
        queryKey: dashboardKeys.users(limit, offset),
        queryFn: () => dashboardApi.getUsers(limit, offset),
        staleTime: 60_000,
    });
}

export function useExecutionPlanStats() {
    return useQuery({
        queryKey: dashboardKeys.executionPlans(),
        queryFn: () => dashboardApi.getExecutionPlans(),
        staleTime: 60_000,
    });
}

export function useDashboardActivity(days = 30) {
    return useQuery({
        queryKey: dashboardKeys.activity(days),
        queryFn: () => dashboardApi.getActivity(days),
        staleTime: 60_000,
    });
}
