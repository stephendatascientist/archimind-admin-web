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
  ChevronLeft,
  ChevronUp,
  UserPlus,
  Zap,
  SlidersHorizontal,
  User,
  HelpCircle,
  LogOut,
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
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrentUser } from "@/lib/queries/auth";
import { useAuth } from "@/lib/hooks/use-auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/apps", label: "Apps", icon: AppWindow },
  { href: "/app-instances", label: "App Instances", icon: Server },
  { href: "/users", label: "Users", icon: Users },
  { href: "/groups", label: "Groups", icon: UsersRound },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
];

const profileMenuItems = [
  { label: "Add another account", icon: UserPlus, action: "add-account" },
  { label: "Upgrade plan", icon: Zap, action: "upgrade" },
  { label: "Personalization", icon: SlidersHorizontal, action: "personalization" },
  { label: "Profile", icon: User, action: "profile", href: "/users" },
  { label: "Settings", icon: Settings, action: "settings", href: "/settings" },
  { label: "Help", icon: HelpCircle, action: "help" },
];

function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            onClick={toggleSidebar}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          />
        }
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </TooltipTrigger>
      <TooltipContent side="right" className="text-xs">
        {isCollapsed ? "Expand" : "Collapse"}
      </TooltipContent>
    </Tooltip>
  );
}

function UserProfileSection() {
  const { data: user } = useCurrentUser();
  const { logout } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "SR";
  const displayName = user?.username ?? "Stephen Raj";
  const displayEmail = user?.email ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            className={`
              flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left
              transition-colors hover:bg-sidebar-accent
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring
              ${isCollapsed ? "justify-center" : ""}
            `}
          />
        }
      >
        <Avatar className="h-8 w-8 shrink-0 ring-2 ring-sidebar-border">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight">{displayName}</p>
              {displayEmail && (
                <p className="truncate text-xs text-sidebar-foreground/60">{displayEmail}</p>
              )}
            </div>
            <ChevronUp className="h-4 w-4 shrink-0 text-sidebar-foreground/60" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align={isCollapsed ? "start" : "center"}
        sideOffset={8}
        className="w-56 rounded-xl shadow-lg"
      >
        <DropdownMenuLabel className="font-normal px-3 py-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              {displayEmail && (
                <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {profileMenuItems.map(({ label, icon: Icon, href }) =>
          href ? (
            <DropdownMenuItem key={label} render={<Link href={href} />}>
              <Icon className="mr-2.5 h-4 w-4 text-muted-foreground" />
              {label}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem key={label}>
              <Icon className="mr-2.5 h-4 w-4 text-muted-foreground" />
              {label}
            </DropdownMenuItem>
          )
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={logout}
        >
          <LogOut className="mr-2.5 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarHeaderContent() {
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    return (
      <div className="flex items-center justify-center py-1">
        <button
          onClick={toggleSidebar}
          aria-label="Expand sidebar"
          className="group/logo relative flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-sidebar-accent"
        >
          {/* Brain icon fades out on hover */}
          <BrainCircuit className="h-6 w-6 text-primary transition-all duration-200 group-hover/logo:opacity-0 group-hover/logo:scale-50" />
          {/* Expand chevron fades in on hover */}
          <ChevronRight className="absolute h-5 w-5 text-sidebar-foreground opacity-0 scale-50 transition-all duration-200 group-hover/logo:opacity-100 group-hover/logo:scale-100" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-1 py-1">
      <Link href="/dashboard" className="flex flex-1 items-center gap-2 overflow-hidden">
        <BrainCircuit className="h-6 w-6 shrink-0 text-primary" />
        <span className="font-semibold text-base tracking-tight">Archimind</span>
      </Link>
      <SidebarToggle />
    </div>
  );
}


export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      {/* ── Header ── */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarHeaderContent />
      </SidebarHeader>

      {/* ── Nav ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            Navigation
          </SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link href={href} />}
                    isActive={isActive}
                    tooltip={label}
                    className="group/menu-btn"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                    {isActive && (
                      <ChevronRight className="ml-auto h-3 w-3 shrink-0 opacity-60" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: user profile ── */}
      <SidebarFooter className="border-t border-sidebar-border p-2">
        <UserProfileSection />
      </SidebarFooter>
    </Sidebar>
  );
}

