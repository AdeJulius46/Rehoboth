import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { SidebarMobileProvider } from "@/components/layout/sidebar-context";
import { getNotifications } from "@/features/notifications/queries";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const notifications = await getNotifications();

  return (
    <SidebarMobileProvider>
      <div className="flex min-h-screen print:block">
        <div className="print:hidden">
          <Sidebar
            user={{
              name: session.user.name ?? "User",
              email: session.user.email ?? "",
              role: session.user.role,
            }}
          />
        </div>
        <main className="min-w-0 flex-1 overflow-y-auto bg-background p-4 sm:p-6 print:overflow-visible print:bg-white print:p-0">
          <div className="print:hidden">
            <AppHeader notifications={notifications} />
          </div>
          {children}
        </main>
      </div>
    </SidebarMobileProvider>
  );
}
