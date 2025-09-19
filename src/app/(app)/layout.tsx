import { type ReactNode, Suspense } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
}
