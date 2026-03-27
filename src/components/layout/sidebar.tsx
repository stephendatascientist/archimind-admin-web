"use client";

import * as React from "react";
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
  Plus,
  Sparkles,
  LifeBuoy,
  UserCircle,
  PanelLeft,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  UserPlus,
  Zap,
  SlidersHorizontal,
  User,
  HelpCircle,
  LogOut,
  MessageSquare,
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCurrentUser } from "@/lib/queries/auth";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/apps", label: "Apps", icon: AppWindow },
  { href: "/app-instances", label: "App Instances", icon: Server },
  { href: "/users", label: "Users", icon: Users },
  { href: "/groups", label: "Groups", icon: UsersRound },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/settings", label: "Settings", icon: Settings },
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
          >
            <PanelLeft className={cn("h-4 w-4", isCollapsed ? "rotate-180" : "")} />
          </button>
        }
      />
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

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "UN";
  const displayName = user?.username ?? "";
  const displayEmail = user?.email ?? "";

  const menuItems = [
    { label: "General", icon: SlidersHorizontal, href: "/settings" },
    { label: "Profile", icon: User, href: "/settings/profile" },
    { label: "Instructions", icon: BrainCircuit, href: "/settings/instructions" },
    { label: "Help", icon: LifeBuoy, href: "/help", hasChevron: true },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        nativeButton={true}
        render={(props: React.ComponentPropsWithoutRef<"button">) => (
          <button
            {...props}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
              isCollapsed ? "justify-center" : "",
              props.className
            )}
          >
            <Avatar className="h-8 w-8 shrink-0 ring-2 ring-sidebar-border">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <span className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold leading-tight">{displayName}</p>
                  <p className="truncate text-xs text-sidebar-foreground/60">Free</p>
                </span>
                <ChevronUp className="h-4 w-4 shrink-0 text-sidebar-foreground/60" />
              </>
            )}
          </button>
        )}
      />

      <DropdownMenuContent
        side="top"
        align={isCollapsed ? "start" : "center"}
        sideOffset={8}
        className="w-56 rounded-xl shadow-lg"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal px-3 py-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">Free</p>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        {menuItems.map(({ label, icon: Icon, href, hasChevron, onClick }: any, index: number) => (
          <React.Fragment key={label}>
            {index === 3 ? <DropdownMenuSeparator /> : null}
            {href ? (
              <DropdownMenuItem
                render={
                  <Link href={href} className="flex-1 flex items-center">
                    <Icon className="mr-2.5 h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{label}</span>
                    {hasChevron && (
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50" />
                    )}
                  </Link>
                }
              />
            ) : (
              <DropdownMenuItem className="flex items-center" onClick={onClick}>
                <Icon className="mr-2.5 h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{label}</span>
                {hasChevron && (
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/50" />
                )}
              </DropdownMenuItem>
            )}
          </React.Fragment>
        ))}

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
          {/* Expand icon fades in on hover */}
          <PanelLeft className="absolute h-5 w-5 text-sidebar-foreground opacity-0 scale-50 transition-all duration-200 group-hover/logo:opacity-100 group-hover/logo:scale-100" />
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

