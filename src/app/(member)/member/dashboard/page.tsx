'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { memberApi, MemberDashboardData } from '@/lib/api/member.api';
import { dietPlanApi } from '@/lib/api/dietPlan.api';
import { classScheduleApi } from '@/lib/api/classSchedule.api';
import { membershipApi } from '@/lib/api/membership.api';
import { ClassSchedule, DietPlan } from '@/types/api.types';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CardSkeleton } from '@/components/ui/EmptyState';
import {
  QrCode,
  TrendingUp,
  Utensils,
  Clock,
  Compass,
  CheckCircle2,
  CalendarCheck,
  CalendarPlus,
  Users,
  AlertCircle,
  Loader2,
  Building2,
  Sparkles,
  Flame,
} from 'lucide-react';

export default function MemberDashboardPage() {
  const [dashboard, setDashboard] = useState<MemberDashboardData | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Class Booking Modal State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<ClassSchedule[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [bookingClassId, setBookingClassId] = useState<string | null>(null);
  const [bookingAlert, setBookingAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeGymBusinessId, setActiveGymBusinessId] = useState<string | null>(null);
  const [enrolledGymName, setEnrolledGymName] = useState<string>('');

  const loadDashboard = async () => {
    try {
      const [dashRes, dietRes] = await Promise.allSettled([
        memberApi.getDashboard(),
        dietPlanApi.getMyDietPlan(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.data?.success) {
        setDashboard(dashRes.value.data.data);
      }
      if (dietRes.status === 'fulfilled' && dietRes.value.data?.success && dietRes.value.data.data) {
        setDietPlan(dietRes.value.data.data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await loadDashboard();
      setIsLoading(false);
    }
    init();
  }, []);

  const handleOpenBookModal = async () => {
    setIsBookModalOpen(true);
    setBookingAlert(null);
    setIsLoadingClasses(true);

    try {
      let businessId = dashboard?.membership?.business?.id;
      let gymName = dashboard?.membership?.business?.name || 'Your Enrolled Gym';

      if (!businessId) {
        const memRes = await membershipApi.getMyMemberships();
        if (memRes.data?.success && Array.isArray(memRes.data.data)) {
          const activeMem = memRes.data.data.find((m) => m.status === 'ACTIVE') || memRes.data.data[0];
          if (activeMem) {
            businessId = activeMem.business?.id || activeMem.businessId;
            gymName = activeMem.business?.name || gymName;
          }
        }
      }

      if (!businessId) {
        setActiveGymBusinessId(null);
        setIsLoadingClasses(false);
        return;
      }

      setActiveGymBusinessId(businessId);
      setEnrolledGymName(gymName);

      const res = await classScheduleApi.listByBusiness(businessId, { limit: 50 });
      if (res.data?.success && Array.isArray(res.data.data)) {
        const classesList = [...res.data.data];
        classesList.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        setAvailableClasses(classesList);
      } else {
        setAvailableClasses([]);
      }
    } catch (error) {
      console.error('Failed to load class schedules:', error);
      setAvailableClasses([]);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const handleBookClass = async (classId: string) => {
    setBookingClassId(classId);
    setBookingAlert(null);
    try {
      await classScheduleApi.book(classId);
      setBookingAlert({
        type: 'success',
        message: '🎉 Class booked successfully! Slot reserved.',
      });
      await loadDashboard();

      if (activeGymBusinessId) {
        const classRes = await classScheduleApi.listByBusiness(activeGymBusinessId, { limit: 50 });
        if (classRes.data?.success && Array.isArray(classRes.data.data)) {
          const classesList = [...classRes.data.data];
          classesList.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          setAvailableClasses(classesList);
        }
      }
    } catch (err: any) {
      setBookingAlert({
        type: 'error',
        message:
          err.response?.data?.message ||
          'Failed to book class. Please ensure you have an active membership with this gym.',
      });
    } finally {
      setBookingClassId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  const membership = dashboard?.membership;
  const attendance = dashboard?.attendance;
  const classes = dashboard?.upcomingClasses || [];

  const rawDietMeals = dietPlan?.meals || dietPlan?.content?.meals;
  let dietMeals: any[] = [];
  if (Array.isArray(rawDietMeals)) {
    dietMeals = rawDietMeals;
  } else if (rawDietMeals && typeof rawDietMeals === 'object') {
    dietMeals = Object.entries(rawDietMeals).map(([mealType, food]: [string, any]) => ({
      mealType: mealType.charAt(0).toUpperCase() + mealType.slice(1),
      time:
        mealType.toLowerCase() === 'breakfast'
          ? '08:00 AM'
          : mealType.toLowerCase() === 'lunch'
          ? '01:00 PM'
          : mealType.toLowerCase() === 'dinner'
          ? '08:00 PM'
          : '04:30 PM',
      foods:
        typeof food === 'string'
          ? [{ name: food }]
          : Array.isArray(food)
          ? food
          : [{ name: String(food) }],
    }));
  }

  const dietTitle = dietPlan?.title || dietPlan?.content?.title || 'Coach Prescribed Diet';
  const dietCoach = dietPlan?.trainer?.name || dietPlan?.trainer?.user?.fullName;
  const dietCalories =
    dietPlan?.dailyCalories ||
    dietPlan?.content?.dailyCalories ||
    dietPlan?.content?.targetCalories;
  const dietMacros = dietPlan?.macros || dietPlan?.content?.macros;
  const dietGoal = dietPlan?.goal || dietPlan?.content?.goal;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> Member Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome back, {dashboard?.member?.name || 'Athlete'}!
          </h1>
          <p className="text-xs sm:text-sm text-orange-100 max-w-lg">
            Ready for today&apos;s workout? Scan the gym&apos;s QR code when you arrive to log your attendance streak.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/member/attendance">
            <Button
              variant="secondary"
              size="md"
              className="bg-white text-slate-900 hover:bg-orange-50 font-bold rounded-2xl shadow-lg"
            >
              <QrCode className="w-4 h-4 mr-1.5 text-orange-600" />
              Check In
            </Button>
          </Link>
          <Link href="/member/gyms">
            <Button
              variant="outline"
              size="md"
              className="border-white/40 text-white hover:bg-white/10 rounded-2xl font-bold"
            >
              <Compass className="w-4 h-4 mr-1.5" />
              Find Gyms
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Active Membership Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Plan
              </span>
              <StatusBadge status={membership ? membership.status : 'NO_PLAN'} />
            </div>

            {membership ? (
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {membership.plan.name}
                </h3>
                <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                  {membership.business.name}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No Active Plan
                </h3>
                <p className="text-xs text-slate-500">
                  You do not have an active gym membership yet.
                </p>
              </div>
            )}
          </div>

          {membership ? (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Renews on</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {membership.renewalDate
                    ? new Date(membership.renewalDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Days remaining</span>
                <span className="font-black text-orange-600">
                  {membership.daysRemaining} days
                </span>
              </div>
              <div className="pt-2">
                <Link href={`/member/bookings/${membership.id}`}>
                  <Button variant="outline" size="sm" className="w-full rounded-xl">
                    View Membership Details
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Link href="/member/gyms">
              <Button variant="primary" size="sm" className="w-full rounded-xl">
                Browse Gym Plans
              </Button>
            </Link>
          )}
        </div>

        {/* Attendance Stats Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Attendance Summary
            </span>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {attendance?.thisMonth || 0}
              </h3>
              <span className="text-xs text-slate-400 font-medium">
                days this month
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Total Lifetime</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {attendance?.total || 0} sessions
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Today&apos;s Status</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {attendance?.today.checkedIn ? (
                  <span className="text-emerald-600 font-bold">Checked In</span>
                ) : (
                  <span className="text-slate-400">Not Checked In</span>
                )}
              </span>
            </div>
            <div className="pt-2">
              <Link href="/member/attendance">
                <Button variant="outline" size="sm" className="w-full rounded-xl">
                  Attendance History
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Fitness Tracking Shortcuts / Active Diet Overview */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Health & Nutrition
              </span>
              {dietPlan && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  Plan Active
                </span>
              )}
            </div>

            {dietPlan ? (
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                  {dietTitle}
                </h3>
                <p className="text-xs text-slate-500">
                  {dietCoach ? `Assigned by Coach ${dietCoach}` : 'Coach Prescribed Plan'}
                </p>
                {dietCalories && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    ~{dietCalories} kcal daily target
                  </div>
                )}
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Routine & Nutrition
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Track your daily weight, review meal plans from your personal coach, or schedule workout sessions.
                </p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <Link href="/member/diet-plan">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-950/60 transition-colors text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer">
                <span className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-600" />
                  {dietPlan ? 'View Active Meal Plan' : 'View Meal Schedule'}
                </span>
                <span>→</span>
              </div>
            </Link>
            <Link href="/member/progress">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-orange-50/50 transition-colors text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" /> Log Body Metrics
                </span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Nutrition Plan Showcase Banner on Dashboard */}
      {dietPlan && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/30 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                  <Utensils className="w-3 h-3 text-emerald-400" />
                  Active Nutritional Regimen
                </span>
                {dietGoal && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    • Goal: {dietGoal}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-white">{dietTitle}</h2>
              <p className="text-xs text-slate-400">
                {dietCoach ? `Prescribed by Coach ${dietCoach}` : 'Prescribed by Personal Coach'}
                {dietPlan.updatedAt &&
                  ` • Last updated: ${new Date(dietPlan.updatedAt).toLocaleDateString()}`}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {dietCalories && (
                <div className="px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Daily Target
                  </span>
                  <span className="text-base font-black text-amber-300 flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 text-amber-400" />
                    {dietCalories}
                    <span className="text-[10px] font-normal text-slate-400">kcal</span>
                  </span>
                </div>
              )}
              <Link href="/member/diet-plan">
                <Button
                  variant="primary"
                  size="sm"
                  className="rounded-xl gap-1.5 shadow-sm bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Utensils className="w-3.5 h-3.5" /> Full Plan →
                </Button>
              </Link>
            </div>
          </div>

          {/* Macros Pills */}
          {dietMacros && (dietMacros.protein || dietMacros.carbs || dietMacros.fats) && (
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
              {dietMacros.protein && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-semibold">
                  🥩 Protein: <span className="text-emerald-400">{dietMacros.protein}</span>
                </span>
              )}
              {dietMacros.carbs && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-semibold">
                  🍚 Carbs: <span className="text-amber-400">{dietMacros.carbs}</span>
                </span>
              )}
              {dietMacros.fats && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-200 font-semibold">
                  🥑 Fats: <span className="text-teal-400">{dietMacros.fats}</span>
                </span>
              )}
            </div>
          )}

          {/* Quick Meals Grid */}
          {dietMeals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {dietMeals.slice(0, 4).map((meal: any, idx: number) => {
                const mealName = meal.mealType || meal.name || `Meal ${idx + 1}`;
                const mealTime = meal.time;
                const topFoods = Array.isArray(meal.foods)
                  ? meal.foods
                      .map((f: any) => (typeof f === 'string' ? f : f.name))
                      .filter(Boolean)
                  : Array.isArray(meal.items)
                  ? meal.items
                      .map((i: any) => (typeof i === 'string' ? i : i.name))
                      .filter(Boolean)
                  : [];

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        {mealName}
                      </span>
                      {mealTime && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {mealTime}
                        </span>
                      )}
                    </div>
                    {topFoods.length > 0 ? (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {topFoods.join(', ')}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Prescribed meal target</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Classes Timetable */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-orange-600" />
              Upcoming Class Sessions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live group workouts and trainer sessions you are booked for
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenBookModal}
              variant="primary"
              size="sm"
              className="rounded-xl gap-1.5 shadow-sm"
            >
              <CalendarPlus className="w-4 h-4" />
              Book a Class
            </Button>
            <Link href="/member/bookings?tab=classes">
              <Button variant="outline" size="sm" className="rounded-xl text-xs">
                All Bookings
              </Button>
            </Link>
          </div>
        </div>

        {classes.length === 0 ? (
          <div className="p-8 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400">
              No upcoming booked classes. Check your gym&apos;s schedule to reserve a slot.
            </p>
            <Button
              onClick={handleOpenBookModal}
              variant="outline"
              size="sm"
              className="rounded-xl text-xs gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Browse & Book Class Session
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls: any) => {
              const trainerNames = cls.trainers && cls.trainers.length > 0
                ? cls.trainers.map((t: any) => t.name).join(', ')
                : (cls.trainer?.name || cls.trainer?.user?.fullName || null);

              return (
                <div
                  key={cls.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {cls.title}
                    </h4>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                      Enrolled
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    {cls.daysOfWeek && cls.daysOfWeek.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {cls.daysOfWeek.map((day: string) => (
                          <span
                            key={day}
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="flex items-center gap-1.5 pt-0.5 font-medium text-slate-700 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      {cls.timeSlot || `${new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(cls.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                    {trainerNames && (
                      <p className="text-[11px] text-slate-500 pt-0.5">
                        Coach: <strong className="text-slate-700 dark:text-slate-300">{trainerNames}</strong>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Book Class Modal */}
      <Modal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        title="Book a Workout Class Slot"
        description="Browse ongoing timetable sessions at your gym and reserve an open slot"
        maxWidth="lg"
      >
        <div className="space-y-4">
          {bookingAlert && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                bookingAlert.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bookingAlert.message}</span>
            </div>
          )}

          {!activeGymBusinessId && !isLoadingClasses ? (
            <div className="p-8 text-center space-y-3 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No Active Gym Membership Found
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                To reserve group classes, you need an active membership plan at a registered gym.
              </p>
              <Link href="/gyms">
                <Button variant="primary" size="sm" className="rounded-xl">
                  Browse Gyms & Plans
                </Button>
              </Link>
            </div>
          ) : isLoadingClasses ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                Fetching class timetable and open slots for {enrolledGymName}...
              </p>
            </div>
          ) : availableClasses.length === 0 ? (
            <div className="p-8 text-center space-y-3 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <CalendarCheck className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No Classes Scheduled Currently
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {enrolledGymName} has not scheduled any group class timetable batches yet. Please check back soon or contact the front desk.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              <div className="text-xs text-slate-500 font-semibold flex items-center justify-between pb-1">
                <span>Available batches at {enrolledGymName}</span>
                <span className="text-[11px] text-orange-600 font-bold">
                  {availableClasses.length} session(s)
                </span>
              </div>

              {availableClasses.map((cls) => {
                const bookedCount = cls._count?.bookings ?? (cls as any).bookedCount ?? 0;
                const totalSlots = cls.capacity || 20;
                const availableSlots = cls.availableSlots !== undefined ? cls.availableSlots : Math.max(0, totalSlots - bookedCount);
                const isFull = availableSlots <= 0;
                const isAlreadyBooked = classes.some((c) => c.id === cls.id);
                const isBookingThis = bookingClassId === cls.id;

                const trainerNames = cls.trainers && cls.trainers.length > 0
                  ? cls.trainers.map((t: any) => t.name).join(', ')
                  : (cls.trainer?.name || (cls.trainer as any)?.user?.fullName || null);

                return (
                  <div
                    key={cls.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-400/50 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {cls.title}
                        </h4>
                        {isAlreadyBooked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            Enrolled
                          </span>
                        )}
                        {isFull && !isAlreadyBooked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                            Fully Booked
                          </span>
                        )}
                      </div>

                      {/* Days chips */}
                      {cls.daysOfWeek && cls.daysOfWeek.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cls.daysOfWeek.map((day) => (
                            <span
                              key={day}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              {day.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                          <Clock className="w-3.5 h-3.5 text-orange-500" />
                          {cls.timeSlot || `${new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(cls.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                        {trainerNames && (
                          <span className="text-slate-600 dark:text-slate-300 font-medium">
                            Coaches: {trainerNames}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] pt-0.5 flex items-center gap-3">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {bookedCount} / {totalSlots} slots taken
                        </span>
                        <span className={`font-semibold ${availableSlots > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                          {availableSlots > 0 ? `🟢 ${availableSlots} open slots remaining` : '🔴 No slots left'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAlreadyBooked ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="rounded-xl text-xs opacity-75"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Enrolled
                        </Button>
                      ) : isFull ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="rounded-xl text-xs opacity-50"
                        >
                          Class Full
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={isBookingThis}
                          onClick={() => handleBookClass(cls.id)}
                          className="rounded-xl text-xs font-bold shadow-sm"
                        >
                          {isBookingThis ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              Booking...
                            </>
                          ) : (
                            'Book Slot'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
