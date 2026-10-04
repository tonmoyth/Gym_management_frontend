'use client';

import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar, NavItem } from './Sidebar';
import { AuthProvider, AuthUser } from '@/lib/auth/AuthContext';

export interface RoleShellProps {
  user: AuthUser;
  roleTitle: string;
  roleAccent: 'blue' | 'teal' | 'coral' | 'purple';
  navItems: NavItem[];
  children: React.ReactNode;
}

export function RoleShell({
  user,
  roleTitle,
  roleAccent,
  navItems,
  children,
}: RoleShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthProvider initialUser={user}>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col font-sans">
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          roleAccent={roleAccent}
        />

        <div className="flex-1 flex w-full">
          <Sidebar
            items={navItems}
            roleTitle={roleTitle}
            roleAccent={roleAccent}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10 overflow-y-auto">
            <div className="w-full max-w-(screen-2xl) mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
