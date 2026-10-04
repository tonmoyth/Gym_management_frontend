'use client';

import React, { useState, useEffect } from 'react';
import { notificationApi } from '@/lib/api/notification.api';
import { Notification } from '@/types/api.types';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, TableSkeleton } from '@/components/ui/EmptyState';
import { Bell, Check, CheckCheck } from 'lucide-react';

export default function MemberNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await notificationApi.getMyNotifications({ limit: 50 });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setNotifications(res.data.data);
      }
    } catch {
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Stay up to date with booking approvals, class notices, and gym alerts
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllRead}
            variant="outline"
            size="sm"
            className="rounded-xl gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            filter === 'all'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
            filter === 'unread'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={3} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Notifications"
          description="You're all caught up! There are no unread alerts at this time."
          icon={<Bell className="w-6 h-6" />}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !n.isRead
                  ? 'bg-orange-50/40 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/60 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={n.type} />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                  {n.body}
                </p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              {!n.isRead && (
                <Button
                  onClick={() => handleMarkRead(n.id)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1 shrink-0 self-start sm:self-center"
                >
                  <Check className="w-3.5 h-3.5" /> Mark Read
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
