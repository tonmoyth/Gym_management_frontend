'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerApi } from '@/lib/api/trainer.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  ShieldCheck, 
  Plus, 
  Upload, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Trash2 
} from 'lucide-react';
import { TrainerCertification } from '@/types/api.types';

export default function TrainerCertificationsPage() {
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [issuer, setIssuer] = useState('');
  const [credentialId, setCredentialId] = useState('');
  const [credentialUrl, setCredentialUrl] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [credentialFile, setCredentialFile] = useState<File | null>(null);

  // 1. Fetch own certifications
  const { data: certsRes, isLoading } = useQuery({
    queryKey: ['trainer-certifications-me'],
    queryFn: () => trainerApi.getOwnCertifications(),
  });

  const certifications = certsRes?.data?.data || [];

  // Upload Mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!credentialFile) throw new Error('Please select a credential document / certificate file');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('issuer', issuer);
      if (credentialId) formData.append('credentialId', credentialId);
      if (credentialUrl) formData.append('credentialUrl', credentialUrl);
      if (issueDate) formData.append('issueDate', issueDate);
      if (expiryDate) formData.append('expiryDate', expiryDate);
      formData.append('credentialFile', credentialFile);

      return trainerApi.uploadCertification(formData);
    },
    onSuccess: () => {
      setIsUploadOpen(false);
      setTitle('');
      setIssuer('');
      setCredentialId('');
      setCredentialUrl('');
      setIssueDate('');
      setExpiryDate('');
      setCredentialFile(null);
      queryClient.invalidateQueries({ queryKey: ['trainer-certifications-me'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-profile-me'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to upload certification.');
    }
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => trainerApi.deleteCertification(id),
    onSuccess: () => {
      setDeletingCertId(null);
      queryClient.invalidateQueries({ queryKey: ['trainer-certifications-me'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-profile-me'] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to delete certification.');
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    uploadMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-36 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Credentials & Certifications</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Upload professional diplomas, NASM/ISSA accreditations, or CPR/AED credentials for Super Admin audit.
          </p>
        </div>
        <Button
          onClick={() => {
            setErrorMessage(null);
            setIsUploadOpen(true);
          }}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Upload Credential
        </Button>
      </div>

      {certifications.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Certifications Uploaded"
          description="Having at least one verified credential unlocks the Verified Coach badge and permits applying to gym job openings."
          actionLabel="Upload First Credential"
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certifications.map((cert: TrainerCertification) => {
            const isVerified = cert.status === 'VERIFIED';
            const isPending = cert.status === 'PENDING';

            return (
              <div
                key={cert.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-400 border border-slate-700">
                        {cert.issuer}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-2">{cert.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={cert.status} />
                      <button
                        type="button"
                        onClick={() => setDeletingCertId(cert.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete certification"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 py-3 border-y border-slate-800/80 my-3 text-xs text-slate-400">
                    {cert.credentialId && (
                      <p className="font-mono">Credential ID: <strong className="text-slate-200">{cert.credentialId}</strong></p>
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
                </div>

                <div className="flex items-center justify-between pt-2">
                  {cert.fileUrl && (
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-teal-400 hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Certificate File
                    </a>
                  )}

                  {isPending && (
                    <span className="text-xs text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Under Admin Review
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Professional Credential"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Certification Name *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Certified Personal Trainer (CPT), First Aid CPR"
            required
          />

          <Input
            label="Issuing Organization *"
            value={issuer}
            onChange={(e) => setIssuer(e.target.value)}
            placeholder="e.g. NASM, ACE Fitness, ISSA, Red Cross"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Credential ID / License #"
              value={credentialId}
              onChange={(e) => setCredentialId(e.target.value)}
              placeholder="e.g. 1984021"
            />
            <Input
              label="Verification URL"
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date Issued"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
            <Input
              label="Expiration Date"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Upload Certificate Document (PDF or Image) *
            </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setCredentialFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-600/20 file:text-teal-300 hover:file:bg-teal-600/30 cursor-pointer"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={uploadMutation.isPending}
            >
              Submit for Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCertId)}
        onClose={() => setDeletingCertId(null)}
        onConfirm={() => {
          if (deletingCertId) deleteMutation.mutate(deletingCertId);
        }}
        title="Delete Certification"
        message="Are you sure you want to delete this credential? Your profile completion percent will be recalculated accordingly."
        confirmText="Delete Credential"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
