"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AppUsage } from "@/lib/types/dashboard";

interface AppLeaderboardProps {
    data?: AppUsage[];
    isLoading: boolean;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe", "#00c49f"];

export function AppLeaderboard({ data, isLoading }: AppLeaderboardProps) {
    const sortedData = [...(data || [])]
        .sort((a, b) => b.conversation_count - a.conversation_count)
        .slice(0, 6);

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Top Apps</CardTitle>
                <CardDescription>Apps by conversation volume.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-[300px] w-full" />
                ) : (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={sortedData}
                                layout="vertical"
                                margin={{ left: 40, right: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f5f5f5" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="app_name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: "#888" }}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: "transparent" }}
                                    contentStyle={{
                                        backgroundColor: "#fff",
                                        borderRadius: "8px",
                                        border: "1px solid #e5e7eb",
                                    }}
                                />
                                <Bar
                                    dataKey="conversation_count"
                                    name="Conversations"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                >
                                    {sortedData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
