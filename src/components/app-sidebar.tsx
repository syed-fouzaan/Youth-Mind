"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookText, Users } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import YouthMindLogo from '@/components/youthmind-logo';
import { LanguageSelector } from '@/components/language-selector';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };
  
  const navItems = [
    { href: '/', icon: <Home />, label: 'Home' },
    { href: '/journal', icon: <BookText />, label: 'Journal' },
    { href: '/support', icon: <Users />, label: 'Peer Support' },
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-center p-4 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <YouthMindLogo />
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
             <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)}>
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <LanguageSelector />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
