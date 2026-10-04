'use strict';
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { History, Shield, Clock, User, Globe } from 'lucide-react';
import { AuditLog } from '@/types/api.types';

export default function AdminAuditLogsPage() {
  const { data: logsRes, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  const logs = logsRes?.data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <TableSkeleton rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Security & Operational Audit Logs</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Tamper-evident trace of Super Admin actions, login attempts, financial transactions, and credential approvals.
        </p>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Audit Records Available"
          description="Security and operational activities will automatically populate this audit journal."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Action / Event</th>
                  <th className="py-4 px-6">Actor / User</th>
                  <th className="py-4 px-6">IP Address</th>
                  <th className="py-4 px-6">Details / Entity</th>
                  <th className="py-4 px-6 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {logs.map((log: AuditLog) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-white">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{(log as any).user?.fullName || log.userId || 'System'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-500" />
                        <span>{log.ipAddress || '127.0.0.1'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300">
                      {log.entityType ? `${log.entityType} (${log.entityId?.slice(0, 8)}...)` : '—'}
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-slate-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
