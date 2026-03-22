"use client";

import { useCurrentUser } from "@/lib/queries/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PagePlaceholder } from "@/components/shared/page-placeholder";
import { format } from "@/lib/utils";
import { User, Mail, Calendar, CheckCircle2 } from "lucide-react";

export default function UsersPage() {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground text-sm">Manage user accounts and permissions.</p>
      </div>

      {/* Current User Profile */}
      <div className="max-w-2xl">
        <h2 className="text-base font-semibold mb-3">My Profile</h2>
        {isLoading ? (
          <Card>
            <CardContent className="pt-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : user ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-base font-semibold">{user.username}</p>
                  <p className="text-xs text-muted-foreground font-normal">{user.id}</p>
                </div>
                {user.is_active && (
                  <Badge variant="default" className="ml-auto gap-1 text-xs">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Member since {format(new Date(user.created_at))}</span>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* User Management (Placeholder) */}
      <div>
        <h2 className="text-base font-semibold mb-3">User Management</h2>
        <PagePlaceholder
          title="User Management Coming Soon"
          description="Admin CRUD endpoints for user management are not yet available in the API. This section will enable listing, creating, editing, and deleting user accounts."
        />
      </div>
    </div>
  );
}
