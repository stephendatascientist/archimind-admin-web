"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AppWindow,
  Server,
  Users,
  UsersRound,
  ScrollText,
  Settings,
  BrainCircuit,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/apps", label: "Apps", icon: AppWindow },
  { href: "/app-instances", label: "App Instances", icon: Server },
  { href: "/users", label: "Users", icon: Users },
  { href: "/groups", label: "Groups", icon: UsersRound },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="font-semibold text-base">Orchimind</span>
          <span className="text-xs text-muted-foreground ml-auto font-medium bg-muted px-1.5 py-0.5 rounded">
            Admin
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton render={<Link href={href} />} isActive={isActive} tooltip={label}>
                      <Icon className="h-4 w-4" />
                      <span>{label}</span>
                      {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
                    </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="px-4 py-2 text-xs text-muted-foreground">
          Orchimind Admin v0.1.0
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
