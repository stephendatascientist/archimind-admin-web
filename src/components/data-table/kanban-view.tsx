"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

interface KanbanCard {
  id: string;
  title: string;
  href?: string;
  subtitle?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
}

interface KanbanGroup {
  label: string;
  items: KanbanCard[];
}

interface KanbanViewProps {
  groups: KanbanGroup[];
  isLoading?: boolean;
}

export function KanbanView({ groups, isLoading }: KanbanViewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (groups.length === 0 || groups.every((g) => g.items.length === 0)) {
    return (
      <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
        No items to display.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <div key={group.label}>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
            {group.label} ({group.items.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.items.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
                      {item.href ? (
                        <Link href={item.href} className="hover:text-primary transition-colors">
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </CardTitle>
                    {item.actions}
                  </div>
                  {item.badges && <div className="flex flex-wrap gap-1 mt-1">{item.badges}</div>}
                </CardHeader>
                {(item.subtitle || item.meta) && (
                  <CardContent className="pt-0 text-xs text-muted-foreground space-y-1">
                    {item.subtitle && <p className="line-clamp-2">{item.subtitle}</p>}
                    {item.meta}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
