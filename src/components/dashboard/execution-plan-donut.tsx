"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExecutionPlanStats } from "@/lib/types/dashboard";

interface ExecutionPlanDonutProps {
    stats?: ExecutionPlanStats;
    isLoading: boolean;
}

export function ExecutionPlanDonut({ stats, isLoading }: ExecutionPlanDonutProps) {
    const data = stats
        ? [
            { name: "Pending", value: stats.pending, color: "#f59e0b" }, // Amber
            { name: "Approved", value: stats.approved, color: "#3b82f6" }, // Blue
            { name: "Executed", value: stats.executed, color: "#10b981" }, // Green
            { name: "Rejected", value: stats.rejected, color: "#ef4444" }, // Red
        ].filter((d) => d.value > 0)
        : [];

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Execution Plans</CardTitle>
                <CardDescription>Status breakdown of agent plans.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
                {isLoading ? (
                    <Skeleton className="h-[250px] w-full rounded-full" />
                ) : data.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                        No data available
                    </div>
                ) : (
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #e5e7eb",
                                    }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
                {!isLoading && stats && (
                    <div className="mt-4 text-center">
                        <p className="text-2xl font-bold">{stats.total}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Plans</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
