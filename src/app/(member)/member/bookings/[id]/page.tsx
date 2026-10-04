'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { membershipApi } from '@/lib/api/membership.api';
import { Membership } from '@/types/api.types';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Skeleton } from '@/components/ui/EmptyState';
import {
  ArrowLeft,
  Calendar,
  Building2,
  Receipt,
  AlertOctagon,
  CheckCircle2,
} from 'lucide-react';

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const unwrappedParams = 'then' in params ? use(params) : params;
  const bookingId = unwrappedParams.id;
  const router = useRouter();

  const [booking, setBooking] = useState<Membership | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchBooking = async () => {
    setIsLoading(true);
    try {
      const res = await membershipApi.getById(bookingId);
      if (res.data?.success && res.data.data) {
        setBooking(res.data.data);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const handleCancelBooking = async () => {
    setIsCancelling(true);
    try {
      await membershipApi.cancel(bookingId);
      setActionMessage('Booking was cancelled successfully.');
      setIsCancelOpen(false);
      fetchBooking();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4">
        <p className="text-sm text-slate-500">Booking not found.</p>
        <Link href="/member/bookings">
          <Button variant="outline" size="sm">
            Back to Bookings
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/member/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Bookings
      </Link>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionMessage}
        </div>
      )}

      {/* Main Detail Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Booking Details
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {booking.plan?.name || 'Membership'}
            </h1>
            <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <Building2 className="w-3.5 h-3.5 text-orange-600" />
              {booking.business?.name || 'Fitness Club'}
            </p>
          </div>

          <div>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Price</span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              {formatCurrency(booking.plan?.price)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Plan Duration</span>
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {booking.plan?.durationDays || 30} Days
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Requested On</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {new Date(booking.requestedAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">End Date</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {booking.endDate ? new Date(booking.endDate).toLocaleDateString() : 'Pending Confirmation'}
            </span>
          </div>
        </div>

        {booking.rejectionReason && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            <span className="font-bold">Rejection Note: </span>
            {booking.rejectionReason}
          </div>
        )}

        {/* Benefits list */}
        {booking.plan?.benefits && booking.plan.benefits.length > 0 && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Included Membership Benefits
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {booking.plan.benefits.map((b, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {booking.status === 'ACTIVE' || booking.status === 'PENDING_APPROVAL' ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsCancelOpen(true)}
              className="rounded-xl"
            >
              <AlertOctagon className="w-3.5 h-3.5 mr-1" /> Cancel Membership
            </Button>
          ) : (
            <div />
          )}

          <Link href="/member/attendance">
            <Button variant="primary" size="sm" className="rounded-xl">
              Go to Check-in
            </Button>
          </Link>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancelBooking}
        title="Cancel Membership?"
        message="Are you sure you want to cancel this membership? Your access to the facility will end upon confirmation."
        confirmText="Yes, Cancel"
        variant="danger"
        isLoading={isCancelling}
      />
    </div>
  );
}
