'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { trainerApi } from '@/lib/api/trainer.api';
import { specializationTagApi } from '@/lib/api/specializationTag.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/EmptyState';
import { 
  User, 
  Award, 
  Upload, 
  Check, 
  AlertCircle, 
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Clock,
  FileText,
  Calendar
} from 'lucide-react';
import { Gender, SpecializationTag, TrainerCertification } from '@/types/api.types';

export default function TrainerProfilePage() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Certificate Modal & Delete state
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
  const [certErrorMessage, setCertErrorMessage] = useState<string | null>(null);

  // Certificate form state
  const [certTitle, setCertTitle] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certIssueDate, setCertIssueDate] = useState('');
  const [certExpiryDate, setCertExpiryDate] = useState('');
  const [certCredentialId, setCertCredentialId] = useState('');
  const [certCredentialUrl, setCertCredentialUrl] = useState('');
  const [certFile, setCertFile] = useState<File | null>(null);

  // 1. Fetch own profile
  const { data: profileRes, isLoading: isProfileLoading } = useQuery({
    queryKey: ['trainer-profile-me'],
    queryFn: () => trainerApi.getOwnProfile(),
  });

  const profile = profileRes?.data?.data;

  // 2. Fetch all real specialization tags from backend
  const { data: tagsRes, isLoading: isTagsLoading } = useQuery({
    queryKey: ['specialization-tags'],
    queryFn: () => specializationTagApi.getAll(),
  });

  const availableTags: SpecializationTag[] = tagsRes?.data?.data || [];

  // 3. Fetch certifications
  const { data: certsRes, isLoading: isCertsLoading } = useQuery({
    queryKey: ['trainer-certifications-me'],
    queryFn: () => trainerApi.getOwnCertifications(),
  });

  const certifications: TrainerCertification[] =
    certsRes?.data?.data || (profile as any)?.certifications || [];

  // Form states
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [experience, setExperience] = useState('0');
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>([]);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setGender(profile.gender || 'MALE');
      setExperience(
        (profile as any).experience !== undefined
          ? (profile as any).experience.toString()
          : '0'
      );
      if (profile.specializations && profile.specializations.length > 0) {
        setSelectedSpecializations(
          profile.specializations.map((s: any) => s.id || s.tag?.id || s.tagId)
        );
      }
    }
  }, [profile]);

  const toggleSpecialization = (id: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Profile completion criteria calculations
  const hasBio = Boolean(bio && bio.trim().length > 0);
  const hasPhoto = Boolean(
    profilePhotoFile || (profile as any)?.profilePhoto || profile?.user?.profileImage
  );
  const hasGender = Boolean(gender);
  const hasSpecializations = selectedSpecializations.length > 0;
  const hasCertifications = certifications.length > 0;

  const currentPercent = profile?.profileCompletionPercent ?? (
    (hasBio ? 20 : 0) +
    (hasPhoto ? 20 : 0) +
    (hasGender ? 10 : 0) +
    (hasSpecializations ? 25 : 0) +
    (hasCertifications ? 25 : 0)
  );

  // Update Profile Mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      // 1. Update Profile (Bio, Gender, Experience, Profile Photo, Specializations)
      if (profilePhotoFile) {
        const formData = new FormData();
        formData.append('bio', bio);
        formData.append('gender', gender);
        formData.append('experience', experience);
        formData.append('profilePhoto', profilePhotoFile);
        if (selectedSpecializations.length > 0) {
          formData.append('specializationIds', JSON.stringify(selectedSpecializations));
        }
        await trainerApi.updateProfile(formData);
      } else {
        await trainerApi.updateProfile({
          bio,
          gender,
          experience: parseInt(experience, 10) || 0,
          specializationIds: selectedSpecializations,
        });
      }
    },
    onSuccess: () => {
      setSuccessMessage('Trainer profile updated successfully!');
      setErrorMessage(null);
      setProfilePhotoFile(null);
      queryClient.invalidateQueries({ queryKey: ['trainer-profile-me'] });
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(
        err.response?.data?.message || 'Failed to update profile.'
      );
    },
  });

  // Upload Certification Mutation
  const uploadCertMutation = useMutation({
    mutationFn: async () => {
      if (!certFile) {
        throw new Error('Please select a credential document or certificate file.');
      }

      const formData = new FormData();
      formData.append('title', certTitle);
      formData.append('issuer', certIssuer);
      formData.append('issueDate', certIssueDate);
      if (certExpiryDate) formData.append('expiryDate', certExpiryDate);
      if (certCredentialId) formData.append('credentialId', certCredentialId);
      if (certCredentialUrl) formData.append('credentialUrl', certCredentialUrl);
      formData.append('credentialFile', certFile);

      return trainerApi.uploadCertification(formData);
    },
    onSuccess: () => {
      setIsCertModalOpen(false);
      setCertTitle('');
      setCertIssuer('');
      setCertIssueDate('');
      setCertExpiryDate('');
      setCertCredentialId('');
      setCertCredentialUrl('');
      setCertFile(null);
      setCertErrorMessage(null);
      setSuccessMessage('Certificate uploaded successfully! Profile completion updated.');
      queryClient.invalidateQueries({ queryKey: ['trainer-certifications-me'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-profile-me'] });
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setCertErrorMessage(
        err.response?.data?.message || err.message || 'Failed to upload certification.'
      );
    },
  });

  // Delete Certification Mutation
  const deleteCertMutation = useMutation({
    mutationFn: (certId: string) => trainerApi.deleteCertification(certId),
    onSuccess: () => {
      setDeletingCertId(null);
      setSuccessMessage('Certificate removed.');
      queryClient.invalidateQueries({ queryKey: ['trainer-certifications-me'] });
      queryClient.invalidateQueries({ queryKey: ['trainer-profile-me'] });
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(
        err.response?.data?.message || 'Failed to delete certification.'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    updateMutation.mutate();
  };

  const handleUploadCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCertErrorMessage(null);
    uploadCertMutation.mutate();
  };

  if (isProfileLoading || isTagsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-white tracking-tight">Coach Profile</h1>
            {profile?.verifiedBadge && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Badge
              </span>
            )}
          </div>
          <p className="text-slate-400 mt-1 text-sm">
            Maintain your professional coaching bio, training disciplines, and verified certifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/trainer/dashboard"
            className="px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            Skip to Dashboard &rarr;
          </Link>
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl shadow-lg">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Profile Completion</span>
              <span className={`text-xl font-black ${currentPercent === 100 ? 'text-emerald-400' : currentPercent >= 80 ? 'text-teal-400' : 'text-amber-400'}`}>
                {currentPercent}%
              </span>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${currentPercent === 100 ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400' : 'bg-teal-500/10 border border-teal-500/20 text-teal-400'}`}>
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Guidance Banner if profile is under 100% */}
      {currentPercent < 100 && (
        <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-teal-300 text-xs">
            <Sparkles className="w-5 h-5 shrink-0 text-teal-400" />
            <span>
              Welcome, Coach! Please update your profile to <strong>100%</strong> and upload your certificate for admin verification. 100% completion and at least one verified certificate are required to apply for gym jobs.
            </span>
          </div>
          <Link
            href="/trainer/dashboard"
            className="shrink-0 text-xs font-semibold text-teal-400 hover:text-teal-300 underline"
          >
            Skip to Dashboard &rarr;
          </Link>
        </div>
      )}

      {/* Profile Completion Checklist Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              100% Profile Completion Breakdown
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Requirement to apply for Gym Jobs: 100% &amp; Verified Certificate
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              currentPercent === 100
                ? 'bg-emerald-500'
                : currentPercent >= 80
                ? 'bg-teal-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${currentPercent}%` }}
          />
        </div>

        {/* 5 Breakdown Items */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
          <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-1.5 transition-all ${
            hasBio ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-800/40 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">+20%</span>
              {hasBio ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-slate-600" />}
            </div>
            <span className="text-[11px] font-medium">Bio & Philosophy</span>
          </div>

          <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-1.5 transition-all ${
            hasPhoto ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-800/40 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">+20%</span>
              {hasPhoto ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-slate-600" />}
            </div>
            <span className="text-[11px] font-medium">Profile Photo</span>
          </div>

          <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-1.5 transition-all ${
            hasGender ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-800/40 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">+10%</span>
              {hasGender ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-slate-600" />}
            </div>
            <span className="text-[11px] font-medium">Gender</span>
          </div>

          <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-1.5 transition-all ${
            hasSpecializations ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-800/40 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">+25%</span>
              {hasSpecializations ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-slate-600" />}
            </div>
            <span className="text-[11px] font-medium">Disciplines</span>
          </div>

          <div className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-1.5 transition-all ${
            hasCertifications ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-slate-800/40 border-slate-800 text-slate-400'
          }`}>
            <div className="flex items-center justify-between">
              <span className="font-bold">+25%</span>
              {hasCertifications ? <Check className="w-4 h-4 text-emerald-400" /> : <span className="w-2 h-2 rounded-full bg-slate-600" />}
            </div>
            <span className="text-[11px] font-medium">Certifications</span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Information Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <User className="w-5 h-5 text-teal-400" />
            <h2 className="text-lg font-bold text-white">General Information</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {profilePhotoFile ? (
              <img
                src={URL.createObjectURL(profilePhotoFile)}
                alt="New Profile Preview"
                className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-500 shadow-lg"
              />
            ) : (profile?.user?.profileImage || (profile as any)?.profilePhoto) ? (
              <img
                src={profile?.user?.profileImage || (profile as any)?.profilePhoto}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover border border-slate-700 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-black text-2xl">
                {profile?.user?.fullName ? profile.user.fullName.slice(0, 2).toUpperCase() : 'TR'}
              </div>
            )}

            <div className="space-y-2 text-center sm:text-left flex-1">
              <h3 className="text-lg font-bold text-white">{profile?.user?.fullName || 'Personal Trainer'}</h3>
              <p className="text-xs text-slate-400">{profile?.user?.email || 'Email'}</p>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Change Avatar / Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePhotoFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-600/20 file:text-teal-300 hover:file:bg-teal-600/30 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <Select
              label="Gender *"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
                { value: 'OTHER', label: 'Other' },
              ]}
            />

            <Input
              label="Years of Coaching Experience *"
              type="number"
              min="0"
              max="50"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              required
            />
          </div>

          <Textarea
            label="Professional Bio & Philosophy *"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Introduce yourself to prospective gym employers and private clients. Share your coaching philosophies, transformation successes, and client handling methodologies..."
            rows={4}
            required
          />
        </div>

        {/* Real Specialization Tags Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Training Disciplines & Specialties</h2>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{selectedSpecializations.length} selected</span>
          </div>

          <p className="text-xs text-slate-400">
            Select the fitness specialties you coach. Gym owners recruiting coaches filter specifically by these disciplines.
          </p>

          {availableTags.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No specialization tags available.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {availableTags.map((spec) => {
                const isSelected = selectedSpecializations.includes(spec.id);
                return (
                  <button
                    type="button"
                    key={spec.id}
                    onClick={() => toggleSpecialization(spec.id)}
                    className={`p-3.5 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-teal-600/15 border-teal-500/60 text-teal-300 shadow-sm'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <span>{spec.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-teal-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Save Profile Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={updateMutation.isPending}
            className="px-8"
          >
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* Certifications Management Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Professional Certifications</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload verified fitness certifications (e.g. NASM, ACE, ISSA, CSCS) to achieve 100% completion.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setCertErrorMessage(null);
              setIsCertModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Certificate
          </Button>
        </div>

        {certifications.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">No Certifications Uploaded Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Upload at least one certified fitness credential document to earn +25% profile completion and unlock verified trainer badges.
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsCertModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
              className="mt-2 text-xs"
            >
              Upload Your First Certificate
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certifications.map((cert: any) => {
              const docUrl = cert.documentUrl || cert.fileUrl;
              const status = cert.status || 'PENDING';
              return (
                <div
                  key={cert.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{cert.title}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          status === 'VERIFIED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {status === 'VERIFIED' ? 'Verified' : status === 'REJECTED' ? 'Rejected' : 'Pending Review'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-medium">Issuer: {cert.issuer}</p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>
                      </div>
                      {cert.expiryDate && (
                        <span>Expires: {new Date(cert.expiryDate).toLocaleDateString()}</span>
                      )}
                    </div>

                    {cert.credentialId && (
                      <p className="text-[11px] text-slate-500 font-mono">ID: {cert.credentialId}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    {docUrl ? (
                      <a
                        href={docUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" /> View Document <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">No document attached</span>
                    )}

                    <button
                      type="button"
                      onClick={() => setDeletingCertId(cert.id)}
                      className="text-xs text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
                      title="Remove Certificate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Certificate Modal */}
      <Modal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        title="Upload Fitness Certification"
        description="Provide certificate credential details and upload your diploma or document proof."
        maxWidth="md"
      >
        <form onSubmit={handleUploadCertSubmit} className="space-y-4">
          {certErrorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{certErrorMessage}</span>
            </div>
          )}

          <Input
            label="Certificate Title *"
            value={certTitle}
            onChange={(e) => setCertTitle(e.target.value)}
            placeholder="e.g. Certified Personal Trainer (CPT)"
            required
          />

          <Input
            label="Issuing Organization *"
            value={certIssuer}
            onChange={(e) => setCertIssuer(e.target.value)}
            placeholder="e.g. NASM, ACE, ISSA, CSCS"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Issue Date *"
              type="date"
              value={certIssueDate}
              onChange={(e) => setCertIssueDate(e.target.value)}
              required
            />

            <Input
              label="Expiry Date (Optional)"
              type="date"
              value={certExpiryDate}
              onChange={(e) => setCertExpiryDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Credential ID (Optional)"
              value={certCredentialId}
              onChange={(e) => setCertCredentialId(e.target.value)}
              placeholder="e.g. CERT-982341"
            />

            <Input
              label="Verification URL (Optional)"
              type="url"
              value={certCredentialUrl}
              onChange={(e) => setCertCredentialUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Certificate Document / Proof (PDF, PNG, JPG) *
            </label>
            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) => setCertFile(e.target.files?.[0] || null)}
              required
              className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-600/20 file:text-teal-300 hover:file:bg-teal-600/30 cursor-pointer w-full"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsCertModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={uploadCertMutation.isPending}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload Certification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Certificate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCertId}
        onClose={() => setDeletingCertId(null)}
        onConfirm={() => deletingCertId && deleteCertMutation.mutate(deletingCertId)}
        title="Remove Certification?"
        description="Are you sure you want to delete this certificate? Profile completion will be recalculated automatically."
        confirmLabel="Delete Certificate"
        variant="danger"
        isLoading={deleteCertMutation.isPending}
      />
    </div>
  );
}
