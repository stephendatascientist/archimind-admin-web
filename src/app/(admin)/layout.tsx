import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/sidebar";
import { AdminHeader } from "@/components/layout/header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex flex-col h-svh">
        <AdminHeader />
        <main className="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-auto">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
