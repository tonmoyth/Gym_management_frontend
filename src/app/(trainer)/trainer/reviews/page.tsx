'use strict';
'use client';

import { useQuery } from '@tanstack/react-query';
import { trainerApi } from '@/lib/api/trainer.api';
import { reviewApi } from '@/lib/api/review.api';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { Star } from 'lucide-react';
import { Review } from '@/types/api.types';

export default function TrainerReviewsPage() {
  // 1. Fetch own profile to get trainer ID
  const { data: profileRes, isLoading: isProfileLoading } = useQuery({
    queryKey: ['trainer-profile-me'],
    queryFn: () => trainerApi.getOwnProfile(),
  });

  const profile = profileRes?.data?.data;
  const trainerId = profile?.id;

  // 2. Fetch reviews
  const { data: reviewsRes, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['trainer-reviews', trainerId],
    queryFn: () => reviewApi.getByTrainer(trainerId!),
    enabled: !!trainerId,
  });

  const reviews = reviewsRes?.data?.data || [];

  if (isProfileLoading || isReviewsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const avgRating = profile?.avgRating || (reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Client Testimonials & Reviews</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Feedback and ratings submitted by members who have completed personal training sessions with you.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-5 py-3 rounded-2xl">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Star className="w-5 h-5 fill-amber-400" />
            <span className="text-2xl font-black text-white">{avgRating}</span>
          </div>
          <span className="text-xs text-slate-400">({reviews.length} reviews)</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No Reviews Received Yet"
          description="Client ratings and testimonials will appear here once members review their personal training experience."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev: Review) => {
            const memberName = (rev as any).member?.user?.fullName || 'Gym Member';

            return (
              <div
                key={rev.id}
                className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-sm">
                      {memberName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">{memberName}</p>
                      <span className="text-xs text-slate-500">Verified Client</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.comment && (
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                )}

                <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/80">
                  Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
