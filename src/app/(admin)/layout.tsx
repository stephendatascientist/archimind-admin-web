import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/layout/sidebar";
import { AdminHeader } from "@/components/layout/header";
import { AdminFooter } from "@/components/layout/footer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="flex flex-col min-h-screen">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
        <AdminFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
