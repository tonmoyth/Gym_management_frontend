'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { X, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/useAuth';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export interface SidebarProps {
  items: NavItem[];
  roleTitle: string;
  roleAccent?: 'blue' | 'teal' | 'coral' | 'purple';
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  items,
  roleTitle,
  roleAccent = 'blue',
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const accentStyles = {
    blue: {
      active:
        'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 font-bold',
      bar: 'bg-blue-600',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    teal: {
      active:
        'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400 font-bold',
      bar: 'bg-teal-600',
      badge: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300',
    },
    coral: {
      active:
        'bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 font-bold',
      bar: 'bg-orange-600',
      badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    },
    purple: {
      active:
        'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 font-bold',
      bar: 'bg-purple-600',
      badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    },
  }[roleAccent];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64">
      {/* Role Heading */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('w-2 h-2 rounded-full', accentStyles.bar)} />
          <span className="text-xs font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">
            {roleTitle}
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close navigation sidebar"
            className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/'));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150',
                isActive
                  ? accentStyles.active
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-medium'
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn('w-4 h-4', isActive ? '' : 'text-slate-400')}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={cn(
                    'text-[10px] px-2 py-0.5 rounded-full font-bold',
                    accentStyles.badge
                  )}
                >
                  {item.badge}
                </span>
              )}

              {isActive && (
                <span
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full',
                    accentStyles.bar
                  )}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Left-Bottom User Profile & Logout Button */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/60 dark:bg-slate-900/60 space-y-2">
        {user && (
          <div className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
              {user.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.profileImage}
                  alt={user.fullName || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.fullName?.charAt(0)?.toUpperCase() || 'M'
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                {user.fullName || 'Member'}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate capitalize">
                {user.role.toLowerCase().replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            if (onClose) onClose();
            logout();
          }}
          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200/60 dark:border-rose-900/40 transition-all cursor-pointer group shadow-xs"
        >
          <span className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-rose-500" />
            <span>Log Out</span>
          </span>
          <span className="text-[10px] opacity-60 uppercase font-semibold">Exit</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
            onClick={onClose}
          />
          <div className="relative z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
