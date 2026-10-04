'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { userApi } from '@/lib/api/user.api';
import { disputeApi } from '@/lib/api/dispute.api';
import { reviewApi } from '@/lib/api/review.api';
import { membershipApi } from '@/lib/api/membership.api';
import { businessApi } from '@/lib/api/business.api';
import { Dispute, DisputeCategory } from '@/types/api.types';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  User,
  ShieldAlert,
  Star,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Building2,
  Loader2,
} from 'lucide-react';

export default function MemberProfilePage() {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Dispute modal state
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeCategory, setDisputeCategory] = useState<DisputeCategory>('SERVICE');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputes, setDisputes] = useState<Dispute[]>([]);

  // Review modal state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewBusinessId, setReviewBusinessId] = useState('');
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // Gym selection state for review
  const [gymOptions, setGymOptions] = useState<{
    enrolledGyms: { id: string; name: string; address?: string }[];
    otherGyms: { id: string; name: string; address?: string }[];
  }>({
    enrolledGyms: [],
    otherGyms: [],
  });
  const [isLoadingGyms, setIsLoadingGyms] = useState(false);

  useEffect(() => {
    if (user?.fullName) setFullName(user.fullName);
  }, [user]);

  const fetchDisputes = async () => {
    try {
      const res = await disputeApi.getMyDisputes();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setDisputes(res.data.data);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      await userApi.updateProfile({ fullName });
      await refreshUser();
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch {
      alert('Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDispute(true);
    try {
      await disputeApi.create({
        subject: disputeSubject,
        description: disputeDescription,
        category: disputeCategory,
      });
      setIsDisputeOpen(false);
      setDisputeSubject('');
      setDisputeDescription('');
      fetchDisputes();
      alert('Dispute raised successfully. Our administration will review it.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to raise dispute');
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  const fetchGymOptions = async () => {
    setIsLoadingGyms(true);
    try {
      const [membershipsRes, businessesRes] = await Promise.allSettled([
        membershipApi.getMyMemberships(),
        businessApi.getAll({ limit: 100 }),
      ]);

      const enrolledMap = new Map<string, { id: string; name: string; address?: string }>();
      if (membershipsRes.status === 'fulfilled' && membershipsRes.value.data?.success) {
        const memberships = Array.isArray(membershipsRes.value.data.data)
          ? membershipsRes.value.data.data
          : [];
        memberships.forEach((m: any) => {
          const bizId = m.business?.id || m.businessId;
          const bizName = m.business?.name || 'Enrolled Fitness Club';
          const bizAddress = m.business?.address;
          if (bizId) {
            enrolledMap.set(bizId, {
              id: bizId,
              name: bizName,
              address: bizAddress,
            });
          }
        });
      }

      const otherList: { id: string; name: string; address?: string }[] = [];
      if (businessesRes.status === 'fulfilled' && businessesRes.value.data?.success) {
        const allBiz = Array.isArray(businessesRes.value.data.data)
          ? businessesRes.value.data.data
          : [];
        allBiz.forEach((b: any) => {
          if (b.id && !enrolledMap.has(b.id)) {
            otherList.push({
              id: b.id,
              name: b.name,
              address: b.address,
            });
          }
        });
      }

      const enrolledList = Array.from(enrolledMap.values());
      setGymOptions({
        enrolledGyms: enrolledList,
        otherGyms: otherList,
      });

      // Pre-select first enrolled gym if not already chosen
      if (!reviewBusinessId) {
        if (enrolledList.length > 0) {
          setReviewBusinessId(enrolledList[0].id);
        } else if (otherList.length > 0) {
          setReviewBusinessId(otherList[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load gyms for review:', err);
    } finally {
      setIsLoadingGyms(false);
    }
  };

  const handleOpenReviewModal = () => {
    setIsReviewOpen(true);
    setReviewMessage(null);
    fetchGymOptions();
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBusinessId) {
      setReviewMessage('Please select a fitness center from the dropdown.');
      return;
    }

    setIsSubmittingReview(true);
    setReviewMessage(null);
    try {
      await reviewApi.create({
        businessId: reviewBusinessId,
        rating: Number(reviewRating),
        comment: reviewComment,
      });
      setIsReviewOpen(false);
      setReviewComment('');
      setReviewBusinessId('');
      alert('Review submitted successfully! Thank you for your feedback.');
    } catch (err: any) {
      setReviewMessage(
        err.response?.data?.message ||
          'Failed to submit review. You must have an active or past membership with this gym.'
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const allAvailableGyms = [...gymOptions.enrolledGyms, ...gymOptions.otherGyms];
  const selectedGym = allAvailableGyms.find((g) => g.id === reviewBusinessId);
  const isEnrolledGym = gymOptions.enrolledGyms.some((g) => g.id === reviewBusinessId);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Account & Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, leave gym feedback, or resolve disputes
        </p>
      </div>

      {profileSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
        </div>
      )}

      {/* Edit Profile Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-orange-500" /> Personal Information
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email Address"
              disabled
              value={user?.email || ''}
              helperText="Email cannot be changed directly"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingProfile}
              className="rounded-xl"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Quick Actions for Reviews & Disputes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            Write Gym Review
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Share ratings and reviews for gyms you have trained at to help other members.
          </p>
          <Button
            onClick={handleOpenReviewModal}
            variant="outline"
            size="sm"
            className="w-full rounded-xl"
          >
            Leave a Review
          </Button>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            Dispute Resolution
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Experience billing or facility issues? Open a formal dispute with administration.
          </p>
          <Button
            onClick={() => setIsDisputeOpen(true)}
            variant="outline"
            size="sm"
            className="w-full rounded-xl"
          >
            Raise a Dispute
          </Button>
        </div>
      </div>

      {/* Disputes History */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          My Raised Disputes ({disputes.length})
        </h3>

        {disputes.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            You have no active or historical disputes on record.
          </p>
        ) : (
          <div className="space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {d.subject || d.category}
                  </span>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-slate-600 dark:text-slate-400">{d.description}</p>
                {d.resolutionNote && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                    <span className="font-bold">Admin Resolution: </span>
                    {d.resolutionNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        title="Write a Review"
        description="Rate your training experience"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          {reviewMessage && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {reviewMessage}
            </div>
          )}

          {/* Gym Selection Dropdown */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="review-gym-select"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Select Gym / Fitness Center <span className="text-red-500">*</span>
              </label>
              {gymOptions.enrolledGyms.length > 0 && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ {gymOptions.enrolledGyms.length} Enrolled Gym(s)
                </span>
              )}
            </div>

            {isLoadingGyms ? (
              <div className="flex items-center gap-2 p-3 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
                Loading your registered gyms...
              </div>
            ) : (
              <select
                id="review-gym-select"
                required
                value={reviewBusinessId}
                onChange={(e) => {
                  setReviewBusinessId(e.target.value);
                  setReviewMessage(null);
                }}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-white"
              >
                <option value="">-- Choose a Fitness Center --</option>
                {gymOptions.enrolledGyms.length > 0 && (
                  <optgroup label="⭐ Your Enrolled Gyms (Eligible for Review)">
                    {gymOptions.enrolledGyms.map((gym) => (
                      <option key={gym.id} value={gym.id}>
                        {gym.name} {gym.address ? `• ${gym.address}` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {gymOptions.otherGyms.length > 0 && (
                  <optgroup label="🏢 Other Registered Gyms">
                    {gymOptions.otherGyms.map((gym) => (
                      <option key={gym.id} value={gym.id}>
                        {gym.name} {gym.address ? `• ${gym.address}` : ''}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            )}

            {/* Selected Gym Preview Card */}
            {selectedGym && (
              <div className="mt-2 p-3 rounded-2xl bg-orange-50/70 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {selectedGym.name}
                    </span>
                    {selectedGym.address && (
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {selectedGym.address}
                      </p>
                    )}
                  </div>
                </div>

                {isEnrolledGym ? (
                  <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Enrolled Member
                  </span>
                ) : (
                  <span className="shrink-0 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                    Platform Gym
                  </span>
                )}
              </div>
            )}

            {selectedGym && !isEnrolledGym && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 pt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Notice: You must have an active or past membership with this gym to submit a verified review.
              </p>
            )}
          </div>

          <Select
            label="Rating (1 to 5 Stars)"
            value={reviewRating}
            onChange={(e) => setReviewRating(e.target.value)}
            options={[
              { value: '5', label: '★★★★★ 5 - Excellent' },
              { value: '4', label: '★★★★☆ 4 - Very Good' },
              { value: '3', label: '★★★☆☆ 3 - Average' },
              { value: '2', label: '★★☆☆☆ 2 - Poor' },
              { value: '1', label: '★☆☆☆☆ 1 - Terrible' },
            ]}
          />

          <Textarea
            label="Review Comment"
            rows={3}
            placeholder="Share your thoughts on the trainers, cleanliness, and facilities..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsReviewOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingReview}
            >
              Submit Review
            </Button>
          </div>
        </form>
      </Modal>

      {/* Dispute Modal */}
      <Modal
        isOpen={isDisputeOpen}
        onClose={() => setIsDisputeOpen(false)}
        title="Raise a Platform Dispute"
        description="Formal complaint submission for admin review"
        maxWidth="md"
      >
        <form onSubmit={handleRaiseDispute} className="space-y-4">
          <Input
            label="Dispute Subject"
            required
            placeholder="e.g. Unauthorized booking charge or facility closure"
            value={disputeSubject}
            onChange={(e) => setDisputeSubject(e.target.value)}
          />

          <Select
            label="Category"
            value={disputeCategory}
            onChange={(e) => setDisputeCategory(e.target.value as DisputeCategory)}
            options={[
              { value: 'BILLING', label: 'Billing & Payment' },
              { value: 'SERVICE', label: 'Facility Service & Cleanliness' },
              { value: 'CONDUCT', label: 'Trainer or Staff Conduct' },
              { value: 'OTHER', label: 'Other Issue' },
            ]}
          />

          <Textarea
            label="Detailed Explanation"
            required
            rows={4}
            placeholder="Provide dates, booking refs, and detailed facts..."
            value={disputeDescription}
            onChange={(e) => setDisputeDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDisputeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isSubmittingDispute}
            >
              File Dispute
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
