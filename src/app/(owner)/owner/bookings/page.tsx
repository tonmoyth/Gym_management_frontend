'use client';

import React, { useState, useEffect } from 'react';
import { businessApi } from '@/lib/api/business.api';
import { membershipApi } from '@/lib/api/membership.api';
import { Membership } from '@/types/api.types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { cn } from '@/lib/utils/cn';
import { 
  CheckCircle2, 
  XCircle, 
  User, 
  Clock, 
  Copy, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  AlertCircle
} from 'lucide-react';

export default function OwnerBookingsPage() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [pendingBookings, setPendingBookings] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Approve modal
  const [selectedApproveBooking, setSelectedApproveBooking] = useState<Membership | null>(null);
  const [isApproving, setIsApproving] = useState(false);

  // Reject modal
  const [selectedRejectBooking, setSelectedRejectBooking] = useState<Membership | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 2000);
  };

  const fetchPending = async (bizId: string) => {
    setIsLoading(true);
    try {
      const res = await membershipApi.getPendingBookings(bizId);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setPendingBookings(res.data.data);
      }
    } catch {
      setPendingBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadBiz() {
      try {
        const myBiz = await businessApi.getMyBusiness();
        if (myBiz.data?.success && myBiz.data.data) {
          const id = myBiz.data.data.id;
          setBusinessId(id);
          fetchPending(id);
        }
      } catch {
        setIsLoading(false);
      }
    }
    loadBiz();
  }, []);

  const handleApprove = async () => {
    if (!selectedApproveBooking || !businessId) return;
    setIsApproving(true);
    try {
      await membershipApi.approve(selectedApproveBooking.id);
      setSelectedApproveBooking(null);
      fetchPending(businessId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve booking');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRejectBooking || !businessId) return;
    setIsRejecting(true);
    try {
      await membershipApi.reject(selectedRejectBooking.id, rejectReason);
      setSelectedRejectBooking(null);
      setRejectReason('');
      fetchPending(businessId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject booking');
    } finally {
      setIsRejecting(false);
    }
  };

  // Helper to safely parse and separate payment details
  const parsePaymentInfo = (payment: any) => {
    if (!payment) return null;
    let trxId = payment.transactionId || '';
    let sender = payment.senderPhone || '';

    // If still packed in combined string format: "TRX123 (Sender: 01700000000)"
    if (trxId && trxId.includes('(Sender:')) {
      const match = trxId.match(/^(.*?)\s*\(Sender:\s*([^\)]+)\)$/i);
      if (match) {
        trxId = match[1].trim();
        sender = sender || match[2].trim();
      }
    }

    const gateway = (payment.gateway || 'MANUAL').toUpperCase();
    return {
      id: payment.id,
      gateway,
      amount: payment.amount,
      trxId,
      sender,
      status: payment.status || 'PENDING',
    };
  };

  // Brand style helper for payment methods
  const getGatewayBadge = (gateway: string) => {
    switch (gateway) {
      case 'BKASH':
        return {
          label: 'bKash',
          badgeClass: 'bg-[#e2136e]/10 text-[#e2136e] dark:text-pink-400 border-[#e2136e]/30',
          dotClass: 'bg-[#e2136e]',
        };
      case 'NAGAD':
        return {
          label: 'Nagad',
          badgeClass: 'bg-[#f7931e]/10 text-[#f7931e] dark:text-orange-400 border-[#f7931e]/30',
          dotClass: 'bg-[#f7931e]',
        };
      case 'ROCKET':
        return {
          label: 'Rocket',
          badgeClass: 'bg-[#8c3494]/10 text-[#8c3494] dark:text-purple-400 border-[#8c3494]/30',
          dotClass: 'bg-[#8c3494]',
        };
      case 'UPAY':
        return {
          label: 'Upay',
          badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
          dotClass: 'bg-amber-500',
        };
      case 'BANK':
        return {
          label: 'Bank Transfer',
          badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          dotClass: 'bg-emerald-500',
        };
      case 'STRIPE':
      case 'CARD':
        return {
          label: 'Card / Stripe',
          badgeClass: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30',
          dotClass: 'bg-indigo-500',
        };
      default:
        return {
          label: gateway,
          badgeClass: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
          dotClass: 'bg-slate-400',
        };
    }
  };

  const columns: Column<Membership>[] = [
    {
      header: 'Applicant Member',
      cell: (row) => {
        const memberName = row.member?.user?.fullName || (row.member as any)?.name || 'Athlete';
        const memberEmail =
          row.member?.user?.email ||
          (row.member as any)?.email ||
          (row.memberId ? `ID: ${row.memberId.substring(0, 8)}` : (row.id ? `ID: ${row.id.substring(0, 8)}` : '—'));

        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">
                {memberName}
              </p>
              <p className="text-[11px] text-slate-400">
                {memberEmail}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Selected Plan',
      cell: (row) => {
        const plan = row.plan || (row as any).membershipPlan;
        return (
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              {plan?.name || 'Standard Plan'}
            </p>
            <p className="text-xs font-semibold text-blue-600">
              {formatCurrency(plan?.price)} · {plan?.durationDays || 30} Days
            </p>
          </div>
        );
      },
    },
    {
      header: 'Submission Time',
      cell: (row) => {
        const dateVal = row.requestedAt || (row as any).bookingDate || row.createdAt;
        return (
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{dateVal ? new Date(dateVal).toLocaleString() : '—'}</span>
          </div>
        );
      },
    },
    {
      header: 'Payment Verification',
      className: 'min-w-[260px]',
      cell: (row: any) => {
        const payInfo = parsePaymentInfo(row.payment);
        if (!payInfo) {
          return (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 italic">
              <Clock className="w-3.5 h-3.5" />
              <span>Awaiting Details</span>
            </div>
          );
        }

        const badge = getGatewayBadge(payInfo.gateway);
        const trxKey = `table-trx-${row.id}`;
        const senderKey = `table-sender-${row.id}`;

        return (
          <div className="space-y-1.5 py-1">
            {/* Row 1: Gateway Badge & Amount */}
            <div className="flex items-center justify-between gap-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-bold border shadow-2xs tracking-wide",
                badge.badgeClass
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", badge.dotClass)} />
                {badge.label}
              </span>

              {payInfo.amount && (
                <span className="font-black text-sm text-slate-900 dark:text-white font-mono tracking-tight bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  ৳ {Number(payInfo.amount).toLocaleString()}
                </span>
              )}
            </div>

            {/* Row 2: Monospace TrxID with Quick Copy */}
            {payInfo.trxId ? (
              <div className="flex items-center justify-between gap-1.5 bg-slate-100/90 dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200/90 dark:border-slate-700/80">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 select-none">
                    TrxID:
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 select-all">
                    {payInfo.trxId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payInfo.trxId, trxKey)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors shrink-0"
                  title="Copy TrxID"
                >
                  {copiedKey === trxKey ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 italic">Trx: Pending</p>
            )}

            {/* Row 3: Sender Phone with Quick Copy */}
            {payInfo.sender && (
              <div className="flex items-center justify-between gap-1.5 text-xs bg-slate-50 dark:bg-slate-900/50 px-2.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Sender:</span>
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200 select-all">
                    {payInfo.sender}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(payInfo.sender, senderKey)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded transition-colors shrink-0"
                  title="Copy Sender Number"
                >
                  {copiedKey === senderKey ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                      <Check className="w-3 h-3" /> Copied!
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => setSelectedApproveBooking(row)}
            variant="success"
            size="sm"
            className="rounded-xl gap-1 text-xs font-semibold"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
          </Button>

          <Button
            onClick={() => setSelectedRejectBooking(row)}
            variant="danger"
            size="sm"
            className="rounded-xl gap-1 text-xs font-semibold"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Booking Approval Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review incoming membership booking requests and verify payment before granting facility check-in access
        </p>
      </div>

      <DataTable
        columns={columns}
        data={pendingBookings}
        isLoading={isLoading}
        emptyTitle="Queue is Clear"
        emptyDescription="There are no pending booking requests awaiting your review right now."
      />

      {/* Enhanced Approve Verification Modal */}
      <Modal
        isOpen={Boolean(selectedApproveBooking)}
        onClose={() => setSelectedApproveBooking(null)}
        title="Verify Payment & Approve Booking"
        description="Carefully double-check the member's payment details below before activating their membership access."
        maxWidth="md"
      >
        {selectedApproveBooking && (() => {
          const booking = selectedApproveBooking;
          const payInfo = parsePaymentInfo(booking.payment);
          const plan = booking.plan || (booking as any).membershipPlan;
          const memberName = booking.member?.user?.fullName || (booking.member as any)?.name || 'Athlete';
          const memberEmail = booking.member?.user?.email || (booking.member as any)?.email || '—';
          const badge = payInfo ? getGatewayBadge(payInfo.gateway) : null;
          const modalTrxKey = `modal-trx-${booking.id}`;
          const modalSenderKey = `modal-sender-${booking.id}`;

          return (
            <div className="space-y-4 pt-1">
              {/* Member & Plan Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Applicant Member</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{memberName}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">{memberEmail}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Selected Plan</span>
                  <p className="font-bold text-blue-600 dark:text-blue-400 text-sm">{plan?.name || 'Standard Plan'}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    {formatCurrency(plan?.price)} · {plan?.durationDays || 30} Days
                  </p>
                </div>
              </div>

              {/* Payment Verification Card */}
              {payInfo ? (
                <div className="p-4 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 rounded-xl border border-blue-500/20 dark:border-blue-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Payment Verification Details
                      </span>
                    </div>
                    {badge && (
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-2xs",
                        badge.badgeClass
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", badge.dotClass)} />
                        {badge.label}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Amount */}
                    <div className="flex items-center justify-between py-1 px-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-medium">Expected Amount:</span>
                      <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400 font-mono">
                        ৳ {Number(payInfo.amount || plan?.price || 0).toLocaleString()}
                      </span>
                    </div>

                    {/* TrxID */}
                    {payInfo.trxId && (
                      <div className="flex items-center justify-between py-1.5 px-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 font-medium">Transaction ID (TrxID):</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded select-all">
                            {payInfo.trxId}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(payInfo.trxId, modalTrxKey)}
                            className="h-7 px-2 text-xs gap-1"
                          >
                            {copiedKey === modalTrxKey ? (
                              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                                <Check className="w-3 h-3" /> Copied
                              </span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Sender Phone */}
                    {payInfo.sender && (
                      <div className="flex items-center justify-between py-1.5 px-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 font-medium">Sender Number / Account:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded select-all">
                            {payInfo.sender}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(payInfo.sender, modalSenderKey)}
                            className="h-7 px-2 text-xs gap-1"
                          >
                            {copiedKey === modalSenderKey ? (
                              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                                <Check className="w-3 h-3" /> Copied
                              </span>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 leading-relaxed flex items-start gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>অনুগ্রহ করে আপনার {badge?.label || 'পেমেন্ট'} স্টেটমেন্টে TrxID এবং টাকার পরিমাণ মিলিয়ে নিশ্চিত হয়ে Approve করুন। Approve করলে মেম্বারশিপ সাথে সাথে একটিভ হয়ে যাবে।</span>
                  </p>
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  No payment details attached to this booking.
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedApproveBooking(null)}
                  disabled={isApproving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  onClick={handleApprove}
                  isLoading={isApproving}
                  className="gap-1.5 px-4 font-bold"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Approve Booking
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(selectedRejectBooking)}
        onClose={() => setSelectedRejectBooking(null)}
        title="Reject Membership Request"
        description="Provide a reason for rejecting this booking request."
        maxWidth="sm"
      >
        {selectedRejectBooking && (
          <form onSubmit={handleReject} className="space-y-4">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-0.5">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {selectedRejectBooking.member?.user?.fullName || (selectedRejectBooking.member as any)?.name || 'Athlete'}
              </p>
              <p className="text-slate-400 text-[11px]">
                Plan: {selectedRejectBooking.plan?.name || (selectedRejectBooking as any).membershipPlan?.name || 'Standard'}
              </p>
            </div>

            <Textarea
              label="Rejection Reason"
              required
              placeholder="e.g. TrxID not matching received amount, payment not found..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedRejectBooking(null)}
                disabled={isRejecting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                isLoading={isRejecting}
              >
                Reject Booking
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
