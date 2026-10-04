'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badge';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  AlertTriangle, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  User 
} from 'lucide-react';
import Link from 'next/link';
import { Dispute } from '@/types/api.types';

export default function AdminDisputesPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: disputesRes, isLoading } = useQuery({
    queryKey: ['admin-disputes', statusFilter],
    queryFn: () => adminApi.getDisputes({ status: statusFilter || undefined }),
  });

  const disputes = disputesRes?.data?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Dispute Resolution & Arbitration</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Arbitrate financial escalations, booking cancellation claims, and trainer payout disputes.
          </p>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Disputes' },
              { value: 'OPEN', label: 'Open / Pending' },
              { value: 'RESOLVED', label: 'Resolved' },
              { value: 'DISMISSED', label: 'Dismissed' },
            ]}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : disputes.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Open Disputes"
          description="There are currently no unresolved escalations or complaints in the system."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {disputes.map((d: Dispute) => {
            const userName = (d as any).user?.fullName || 'Platform User';

            return (
              <div
                key={d.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-purple-300">
                      {d.category}
                    </span>
                    <StatusBadge status={d.status} />
                  </div>

                  <h3 className="text-lg font-bold text-white mt-2">{d.subject || 'Platform Dispute'}</h3>

                  <div className="flex items-center gap-4 py-3 border-y border-slate-800/80 my-3 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{userName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-3 mb-4">
                    {d.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-end">
                  <Link href={`/admin/disputes/${d.id}`}>
                    <Button
                      size="sm"
                      variant="primary"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="text-xs"
                    >
                      Arbitrate Dispute
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
