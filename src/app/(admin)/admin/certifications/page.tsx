'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin.api';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { TrainerCertification } from '@/types/api.types';

export default function AdminCertificationsPage() {
  const queryClient = useQueryClient();
  const [rejectingCert, setRejectingCert] = useState<TrainerCertification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch pending certifications
  const { data: certsRes, isLoading } = useQuery({
    queryKey: ['admin-pending-certs'],
    queryFn: () => adminApi.getPendingCertifications(),
  });

  const certs = certsRes?.data?.data || [];

  // Verify Mutation
  const verifyMutation = useMutation({
    mutationFn: (id: string) => adminApi.verifyCertification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-certs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to verify certification.');
    }
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminApi.rejectCertification(id, reason),
    onSuccess: () => {
      setRejectingCert(null);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-pending-certs'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to reject certification.');
    }
  });

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingCert) return;
    rejectMutation.mutate({ id: rejectingCert.id, reason: rejectionReason });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Trainer Credentials Audit</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Verify accredited diplomas and fitness certifications to grant coaches the official Verified Badge.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : certs.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All Credentials Verified"
          description="There are currently no trainer certifications awaiting audit in the verification queue."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certs.map((cert: TrainerCertification) => {
            const trainerName = (cert as any).trainer?.user?.fullName || 'Fitness Coach';

            return (
              <div
                key={cert.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {cert.issuer}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2">{cert.title}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Uploaded by: <strong className="text-slate-200">{trainerName}</strong>
                      </p>
                    </div>
                    <StatusBadge status={cert.status} />
                  </div>

                  <div className="space-y-1.5 py-3 border-y border-slate-800/80 my-3 text-xs text-slate-400">
                    {cert.credentialId && (
                      <p className="font-mono">License ID: <span className="text-white font-bold">{cert.credentialId}</span></p>
                    )}
                    {cert.issueDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                        {cert.expiryDate && (
                          <span> • Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {cert.fileUrl && (
                    <div className="mb-4">
                      <a
                        href={cert.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-purple-400 hover:underline inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open Uploaded Document
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => verifyMutation.mutate(cert.id)}
                    isLoading={verifyMutation.isPending}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    className="flex-1 text-xs"
                  >
                    Verify & Grant Badge
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRejectingCert(cert);
                      setRejectionReason('');
                    }}
                    leftIcon={<XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    className="flex-1 text-xs text-rose-400 hover:bg-rose-500/10"
                  >
                    Reject Credential
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectingCert}
        onClose={() => setRejectingCert(null)}
        title="Reject Certification"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-sm text-slate-300">
            Provide the audit rejection reason for <strong>{rejectingCert?.title}</strong>. The trainer will receive this notification to re-upload.
          </p>

          <Textarea
            label="Audit Failure Reason *"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="e.g. Unverifiable license ID on issuer registry, or expired credential document."
            rows={3}
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectingCert(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={rejectMutation.isPending}
              className="bg-rose-600 hover:bg-rose-500"
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
