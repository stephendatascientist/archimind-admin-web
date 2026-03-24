"use client";

import { ExternalLink, Table as TableIcon, LayoutDashboard, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SupersetExecutionResult } from "@/lib/types/api";

interface SupersetResultProps {
    result: SupersetExecutionResult;
}

export function SupersetResult({ result }: SupersetResultProps) {
    const { action, status, output } = result;

    if (status === "error") {
        return (
            <Card className="border-destructive/50 bg-destructive/5 mt-2">
                <CardContent className="pt-4 text-sm text-destructive font-medium">
                    Error executing Superset action: {output?.message || JSON.stringify(output)}
                </CardContent>
            </Card>
        );
    }

    // Use environment variable for Superset URL if available, otherwise fallback
    const supersetUrl = process.env.NEXT_PUBLIC_SUPERSET_URL || "https://superset.example.com";

    if (action === "GET_CHART_DATA") {
        const data = Array.isArray(output) ? output : (output?.data || []);
        if (!data.length) return <div className="text-xs text-muted-foreground mt-2 italic">No data returned from chart.</div>;

        const columns = Object.keys(data[0]);

        return (
            <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <TableIcon className="h-3 w-3" />
                    Chart Data
                </div>
                <div className="rounded-lg border bg-background overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                {columns.map((col) => (
                                    <TableHead key={col} className="h-8 py-0 text-[11px] font-bold">
                                        {col}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.slice(0, 10).map((row: any, i: number) => (
                                <TableRow key={i}>
                                    {columns.map((col) => (
                                        <TableCell key={col} className="py-2 text-[11px]">
                                            {String(row[col])}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {data.length > 10 && (
                        <div className="p-2 text-center border-t text-[10px] text-muted-foreground italic bg-muted/20">
                            Showing first 10 rows of {data.length} total.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (action === "CREATE_CHART") {
        const chartId = output?.id || output;
        const chartName = output?.slice_name || "New Superset Chart";
        const chartUrl = `${supersetUrl}/explore/?slice_id=${chartId}`;

        return (
            <Card className="mt-4 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-sm font-semibold">Chart Created</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground mb-3">
                        Your new chart "{chartName}" is ready in Apache Superset.
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-8 gap-1.5"
                        onClick={() => window.open(chartUrl, "_blank", "noopener,noreferrer")}
                    >
                        Open in Superset
                        <ExternalLink className="h-3 w-3" />
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (action === "CREATE_DASHBOARD") {
        const dashboardId = output?.id || output;
        const dashboardTitle = output?.dashboard_title || "New Superset Dashboard";
        const dashboardUrl = `${supersetUrl}/superset/dashboard/${dashboardId}/`;

        return (
            <Card className="mt-4 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <LayoutDashboard className="h-5 w-5 text-primary" />
                            <CardTitle className="text-sm font-semibold">Dashboard Created</CardTitle>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-xs text-muted-foreground mb-3">
                        Your new dashboard "{dashboardTitle}" has been organized with the requested charts.
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs h-8 gap-1.5"
                        onClick={() => window.open(dashboardUrl, "_blank", "noopener,noreferrer")}
                    >
                        Open Dashboard
                        <ExternalLink className="h-3 w-3" />
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return null;
}
