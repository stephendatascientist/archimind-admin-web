"use client";

import { useState } from "react";
import { KPIStats } from "@/components/dashboard/kpi-stats";
import { ActivityChart } from "@/components/dashboard/activity-chart";
import { AppLeaderboard } from "@/components/dashboard/app-leaderboard";
import { ExecutionPlanDonut } from "@/components/dashboard/execution-plan-donut";
import { AppInstanceUsageTable } from "@/components/dashboard/app-instance-usage-table";
import { UserUsageTable } from "@/components/dashboard/user-usage-table";
import { useDashboard } from "@/lib/queries/dashboard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

export default function DashboardPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useDashboard(days);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm">
            Insights and performance metrics for the Archimind platform.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select
            value={days.toString()}
            onValueChange={(val) => setDays(parseInt(val || "30"))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select window" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Stats Top Row */}
      <KPIStats summary={data?.summary} isLoading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Main Chart */}
        <ActivityChart data={data?.daily_activity} isLoading={isLoading} />

        {/* Breakdown Row */}
        <AppLeaderboard data={data?.app_usage} isLoading={isLoading} />
        <ExecutionPlanDonut stats={data?.execution_plan_stats} isLoading={isLoading} />

        {/* Tables */}
        <AppInstanceUsageTable data={data?.app_instance_usage} isLoading={isLoading} />
        <UserUsageTable initialData={data?.user_usage} />
      </div>
    </div>
  );
}
