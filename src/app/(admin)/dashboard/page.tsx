"use client";

import Link from "next/link";
import { AppWindow, Server, Plus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useApps } from "@/lib/queries/apps";
import { useInstances } from "@/lib/queries/app-instances";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  isLoading,
  href,
}: {
  title: string;
  value: number | undefined;
  description: string;
  icon: React.ElementType;
  isLoading: boolean;
  href: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-3xl font-bold">{value ?? 0}</div>
        )}
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <Button variant="link" className="px-0 mt-2 h-auto text-xs" render={<Link href={href} />}>
          View all <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: apps = [], isLoading: appsLoading } = useApps();
  const { data: instances = [], isLoading: instancesLoading } = useInstances();

  const quickActions = [
    {
      label: "New App",
      description: "Define a new AI application template",
      href: "/apps",
      icon: AppWindow,
    },
    {
      label: "New Instance",
      description: "Deploy an app instance with a custom pipeline",
      href: "/app-instances",
      icon: Server,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome to the Archimind Admin panel.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Apps"
          value={apps.length}
          description="Global AI application templates"
          icon={AppWindow}
          isLoading={appsLoading}
          href="/apps"
        />
        <StatCard
          title="Total Instances"
          value={instances.length}
          description="Deployed app instances"
          icon={Server}
          isLoading={instancesLoading}
          href="/app-instances"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map(({ label, description, href, icon: Icon }) => (
            <Card key={label} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-primary/10 p-2">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-sm">{label}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs mb-3">{description}</CardDescription>
                <Button size="sm" variant="outline" render={<Link href={href} />}>
                    <Plus className="mr-1 h-3 w-3" />
                    Go to {label}
                  </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Apps */}
      {apps.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold">Recent Apps</h2>
            <Button variant="ghost" size="sm" render={<Link href="/apps" />}>View all <ArrowRight className="ml-1 h-3 w-3" /></Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {apps.slice(0, 6).map((app) => (
              <Link
                key={app.id}
                href={`/apps/${app.id}`}
                className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors text-sm"
              >
                <AppWindow className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{app.name}</p>
                  <p className="text-xs text-muted-foreground font-mono truncate">{app.slug}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
