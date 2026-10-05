'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { businessApi } from '@/lib/api/business.api';
import { membershipPlanApi } from '@/lib/api/membershipPlan.api';
import { reviewApi } from '@/lib/api/review.api';
import { Business, MembershipPlan, Review } from '@/types/api.types';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { useAuth } from '@/lib/auth/useAuth';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { favoriteApi } from '@/lib/api/favorite.api';
import { Button } from '@/components/ui/Button';
import { EmptyState, Skeleton } from '@/components/ui/EmptyState';
import {
  MapPin,
  Star,
  Dumbbell,
  Check,
  Calendar,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export default function PublicBusinessProfilePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const unwrappedParams = 'then' in params ? use(params) : params;
  const businessId = unwrappedParams.id;
  const router = useRouter();
  const { user } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [bizRes, plansRes, reviewsRes] = await Promise.allSettled([
          businessApi.getById(businessId),
          membershipPlanApi.listByBusiness(businessId),
          reviewApi.getByBusiness(businessId),
        ]);

        if (bizRes.status === 'fulfilled' && bizRes.value.data?.success) {
          setBusiness(bizRes.value.data.data);
        }
        if (plansRes.status === 'fulfilled' && plansRes.value.data?.success) {
          setPlans(plansRes.value.data.data || []);
        }
        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.data?.success) {
          setReviews(reviewsRes.value.data.data || []);
        }

        if (user?.role === 'MEMBER') {
          try {
            const favRes = await favoriteApi.getMyFavorites({ limit: 100 });
            if (favRes.data?.success && Array.isArray(favRes.data.data)) {
              setIsFavorited(favRes.data.data.some((f) => f.businessId === businessId));
            }
          } catch {
            // ignore
          }
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [businessId]);

  const handleBookPlan = (planId: string) => {
    if (!user) {
      router.push(`/login?returnUrl=/member/checkout/${planId}`);
    } else {
      router.push(`/member/checkout/${planId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans">
        <Navbar />
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans">
        <Navbar />
        <div className="max-w-xl mx-auto p-12 text-center">
          <EmptyState
            title="Gym Not Found"
            description="The requested fitness center does not exist or is currently inactive."
            action={
              <Link href="/">
                <Button variant="primary" size="sm">
                  Back to Discovery
                </Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Gym Directory
        </Link>

        {/* Business Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white shadow-xl">
          <div className="relative h-64 sm:h-80 w-full bg-slate-800">
            {business.photos && business.photos.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.photos[0]}
                alt={business.name}
                className="w-full h-full object-cover opacity-80"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-700">
                <Dumbbell className="w-20 h-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full bg-blue-600 text-white">
                    Verified Facility
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    <Star className="w-3.5 h-3.5 fill-current" /> 4.9
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black">{business.name}</h1>
                <p className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                  {business.address}
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-3">
                <FavoriteButton
                  businessId={business.id}
                  businessName={business.name}
                  initialFavorited={isFavorited}
                  onToggle={setIsFavorited}
                  variant="pill"
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Gym Overview & Amenities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                About the Facility
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {business.description ||
                  'A premier fitness club offering modern training equipment, certified personal instructors, and dedicated workout zones designed to help you achieve your peak health and strength goals.'}
              </p>

              {business.amenities && business.amenities.length > 0 && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-3">
                    Included Amenities & Equipment
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {business.amenities.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Member Reviews */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Member Ratings & Reviews
                </h2>
                <span className="text-xs text-slate-400 font-semibold">
                  {reviews.length} total reviews
                </span>
              </div>

              {reviews.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No member reviews yet. Be the first to join and review!
                </p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {r.member?.user?.fullName || 'Verified Member'}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: r.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-current" />
                          ))}
                        </div>
                      </div>
                      {r.comment && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {r.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Membership Plans */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Available Plans
            </h2>

            {plans.length === 0 ? (
              <EmptyState
                title="No Active Plans"
                description="This gym does not currently have public plans available."
              />
            ) : (
              plans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {plan.durationDays} Days Duration
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                        {formatCurrency(plan.price)}
                      </span>
                    </div>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {plan.description}
                    </p>
                  )}

                  {plan.benefits && plan.benefits.length > 0 && (
                    <ul className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button
                    onClick={() => handleBookPlan(plan.id)}
                    variant="primary"
                    size="md"
                    className="w-full rounded-2xl"
                  >
                    Book Membership
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
