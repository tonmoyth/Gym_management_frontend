'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { membershipApi } from '@/lib/api/membership.api';
import { classScheduleApi } from '@/lib/api/classSchedule.api';
import { Membership, ClassBooking, ClassSchedule } from '@/types/api.types';
import { DataTable, Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { CardSkeleton } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import {
  Eye,
  Calendar,
  Building2,
  CalendarCheck,
  CalendarPlus,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function MemberBookingsPage() {
  const [activeTab, setActiveTab] = useState<string>('classes');

  // Memberships State
  const [membershipBookings, setMembershipBookings] = useState<Membership[]>([]);
  const [isLoadingMemberships, setIsLoadingMemberships] = useState(true);

  // Class Bookings State
  const [myClassBookings, setMyClassBookings] = useState<ClassBooking[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassSchedule[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);
  const [bookingClassId, setBookingClassId] = useState<string | null>(null);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [feedbackAlert, setFeedbackAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Gym info for booking new classes
  const [activeGyms, setActiveGyms] = useState<{ id: string; name: string }[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      if (tabParam === 'memberships') {
        setActiveTab('memberships');
      } else if (tabParam === 'classes') {
        setActiveTab('classes');
      }
    }
  }, []);

  // Fetch Memberships
  const fetchMemberships = async () => {
    setIsLoadingMemberships(true);
    try {
      const res = await membershipApi.getMyMemberships();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMembershipBookings(res.data.data);

        // Extract active gym IDs
        const gymsMap = new Map<string, string>();
        res.data.data.forEach((m) => {
          const bId = m.business?.id || m.businessId;
          const bName = m.business?.name || 'Enrolled Gym';
          if (bId && (m.status === 'ACTIVE' || !gymsMap.has(bId))) {
            gymsMap.set(bId, bName);
          }
        });

        const gymsList = Array.from(gymsMap.entries()).map(([id, name]) => ({ id, name }));
        setActiveGyms(gymsList);
        if (gymsList.length > 0 && !selectedGymId) {
          setSelectedGymId(gymsList[0].id);
        }
      }
    } catch {
      setMembershipBookings([]);
    } finally {
      setIsLoadingMemberships(false);
    }
  };

  // Fetch Class Bookings and Available Schedules
  const fetchClassesData = async (gymId?: string) => {
    setIsLoadingClasses(true);
    try {
      // 1. Fetch member's own booked classes
      const myRes = await classScheduleApi.getMyBookings();
      if (myRes.data?.success && Array.isArray(myRes.data.data)) {
        setMyClassBookings(myRes.data.data);
      } else {
        setMyClassBookings([]);
      }

      // 2. Fetch available classes if gym is selected
      const targetGymId = gymId || selectedGymId;
      if (targetGymId) {
        const schedRes = await classScheduleApi.listByBusiness(targetGymId, { limit: 50 });
        if (schedRes.data?.success && Array.isArray(schedRes.data.data)) {
          const classesList = [...schedRes.data.data];
          classesList.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
          setAvailableClasses(classesList);
        } else {
          setAvailableClasses([]);
        }
      }
    } catch (err) {
      console.error('Failed to load class schedules:', err);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  useEffect(() => {
    if (selectedGymId) {
      fetchClassesData(selectedGymId);
    } else {
      fetchClassesData();
    }
  }, [selectedGymId]);

  // Book a class handler
  const handleBookClass = async (classId: string) => {
    setBookingClassId(classId);
    setFeedbackAlert(null);
    try {
      await classScheduleApi.book(classId);
      setFeedbackAlert({
        type: 'success',
        message: '🎉 Class reserved successfully! Added to your schedule.',
      });
      await fetchClassesData(selectedGymId);
    } catch (err: any) {
      setFeedbackAlert({
        type: 'error',
        message:
          err.response?.data?.message ||
          'Failed to book class. Please make sure you have an active membership valid for this class time.',
      });
    } finally {
      setBookingClassId(null);
    }
  };

  // Cancel class booking handler
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel your reservation for this class?')) return;
    setCancellingBookingId(bookingId);
    setFeedbackAlert(null);
    try {
      await classScheduleApi.cancelBooking(bookingId);
      setFeedbackAlert({
        type: 'success',
        message: 'Class reservation cancelled.',
      });
      await fetchClassesData(selectedGymId);
    } catch (err: any) {
      setFeedbackAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to cancel reservation.',
      });
    } finally {
      setCancellingBookingId(null);
    }
  };

  // Memberships Table Columns
  const membershipColumns: Column<Membership>[] = [
    {
      header: 'Gym & Facility',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white">
              {row.business?.name || 'Fitness Club'}
            </p>
            <p className="text-[11px] text-slate-400">
              Ref: {row.id.substring(0, 8)}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Membership Plan',
      cell: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">
            {row.plan?.name || 'Standard Plan'}
          </p>
          <p className="text-xs text-slate-500 font-semibold">
            {formatCurrency(row.plan?.price)}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Dates',
      cell: (row) => (
        <div className="text-xs text-slate-500 space-y-0.5">
          <p className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Requested: {new Date(row.requestedAt).toLocaleDateString()}
          </p>
          {row.endDate && (
            <p className="font-medium text-slate-700 dark:text-slate-300">
              Valid until: {new Date(row.endDate).toLocaleDateString()}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      cell: (row) => (
        <div className="flex justify-end">
          <Link href={`/member/bookings/${row.id}`}>
            <Button variant="outline" size="sm" className="gap-1 rounded-xl">
              <Eye className="w-3.5 h-3.5" /> Details
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  const tabs = [
    {
      id: 'classes',
      label: 'Class Schedules & Bookings',
      icon: <CalendarCheck className="w-4 h-4" />,
      count: myClassBookings.filter((b) => b.status === 'CONFIRMED').length,
    },
    {
      id: 'memberships',
      label: 'Gym Membership Plans',
      icon: <Building2 className="w-4 h-4" />,
      count: membershipBookings.length,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            My Bookings & Schedules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your booked workout classes, trainer schedules, and gym membership plans
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/member/gyms">
            <Button variant="primary" size="sm" className="rounded-xl gap-1.5 shadow-sm">
              <Sparkles className="w-4 h-4" /> Book New Membership
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Feedback Banner */}
      {feedbackAlert && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 animate-in fade-in ${
            feedbackAlert.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedbackAlert.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackAlert(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* ==================== TAB 1: CLASSES ==================== */}
      {activeTab === 'classes' && (
        <div className="space-y-8">
          {/* Section 1: My Booked Classes */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarCheck className="w-5 h-5 text-orange-600" />
                  My Reserved Class Sessions
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your confirmed and past group class bookings
                </p>
              </div>
            </div>

            {isLoadingClasses ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : myClassBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-1">
                <p>You haven&apos;t booked any class sessions yet.</p>
                <p className="text-[11px] text-slate-500">
                  Browse the available classes below to reserve your first workout slot!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myClassBookings.map((booking) => {
                  const schedule = booking.classSchedule;
                  const isCancelled = booking.status === 'CANCELLED';
                  const isUpcoming = schedule ? new Date(schedule.startTime) > new Date() : false;
                  const isCancelling = cancellingBookingId === booking.id;

                  return (
                    <div
                      key={booking.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                        isCancelled
                          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-orange-500/40'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                            {schedule?.title || 'Workout Class'}
                          </h4>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 ${
                              isCancelled
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        {schedule?.business && (
                          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {schedule.business.name}
                          </p>
                        )}

                        {schedule && (
                          <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                            {schedule.daysOfWeek && schedule.daysOfWeek.length > 0 && (
                              <div className="flex flex-wrap gap-1 pb-0.5">
                                {schedule.daysOfWeek.map((day: string) => (
                                  <span
                                    key={day}
                                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                  >
                                    {day.slice(0, 3)}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                              <Clock className="w-3.5 h-3.5 text-orange-500" />
                              {schedule.timeSlot || `${new Date(schedule.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(schedule.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </p>
                            {(schedule.trainers && schedule.trainers.length > 0) ? (
                              <p className="font-medium text-slate-700 dark:text-slate-300">
                                Coaches: {schedule.trainers.map((t: any) => t.name).join(', ')}
                              </p>
                            ) : schedule.trainer?.user?.fullName ? (
                              <p className="font-medium text-slate-700 dark:text-slate-300">
                                Coach: {schedule.trainer.user.fullName}
                              </p>
                            ) : null}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      {!isCancelled && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={isCancelling}
                            onClick={() => handleCancelBooking(booking.id)}
                            className="rounded-xl text-xs gap-1"
                          >
                            {isCancelling ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> Cancelling...
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" /> Cancel Reservation
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Available Classes to Book */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CalendarPlus className="w-5 h-5 text-orange-600" />
                  Available Group Classes to Book
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Browse live workout sessions at your enrolled gym and reserve a slot
                </p>
              </div>

              {/* Gym Selector if multiple active gyms */}
              {activeGyms.length > 1 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="gym-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    Gym:
                  </label>
                  <select
                    id="gym-select"
                    value={selectedGymId}
                    onChange={(e) => setSelectedGymId(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white"
                  >
                    {activeGyms.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {isLoadingClasses ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
                <p className="text-xs text-slate-400">Loading upcoming class schedules...</p>
              </div>
            ) : availableClasses.length === 0 ? (
              <div className="p-10 text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-800/30">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    No Upcoming Classes Found
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {activeGyms.length === 0
                      ? 'You need an active gym membership to browse and book group workout sessions.'
                      : 'There are currently no upcoming classes scheduled at your facility. Please check back later.'}
                  </p>
                </div>
                {activeGyms.length === 0 && (
                  <Link href="/member/gyms">
                    <Button variant="primary" size="sm" className="rounded-xl">
                      Browse Gyms & Memberships
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {availableClasses.map((cls) => {
                  const bookedCount = cls._count?.bookings ?? (cls as any).bookedCount ?? 0;
                  const totalSlots = cls.capacity || 20;
                  const availableSlots = cls.availableSlots !== undefined ? cls.availableSlots : Math.max(0, totalSlots - bookedCount);
                  const isFull = availableSlots <= 0;
                  const isAlreadyBooked = myClassBookings.some(
                    (b) => b.classScheduleId === cls.id && b.status === 'CONFIRMED'
                  );
                  const isBooking = bookingClassId === cls.id;

                  const trainerNames = cls.trainers && cls.trainers.length > 0
                    ? cls.trainers.map((t: any) => t.name).join(', ')
                    : (cls.trainer?.name || (cls.trainer as any)?.user?.fullName || null);

                  return (
                    <div
                      key={cls.id}
                      className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-orange-500/50 hover:shadow-md transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
                            {cls.title}
                          </h4>
                          {isAlreadyBooked ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              Enrolled
                            </span>
                          ) : isFull ? (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                              Full
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              {availableSlots} Open Slots
                            </span>
                          )}
                        </div>

                        {cls.business && (
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            {cls.business.name}
                          </p>
                        )}

                        <div className="text-xs text-slate-500 space-y-1.5 pt-1">
                          {cls.daysOfWeek && cls.daysOfWeek.length > 0 && (
                            <div className="flex flex-wrap gap-1 pb-0.5">
                              {cls.daysOfWeek.map((day) => (
                                <span
                                  key={day}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                                >
                                  {day.slice(0, 3)}
                                </span>
                              ))}
                            </div>
                          )}

                          <p className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                            <Clock className="w-4 h-4 text-orange-500 shrink-0" />
                            <span>
                              {cls.timeSlot || `${new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(cls.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                          </p>

                          {trainerNames && (
                            <p className="font-semibold text-slate-700 dark:text-slate-300 pt-0.5">
                              Coaches: {trainerNames}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 text-xs text-slate-400 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {bookedCount} / {totalSlots} taken
                          </span>
                          <span className={availableSlots > 0 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-rose-500 font-semibold'}>
                            {availableSlots > 0 ? `${availableSlots} slots left` : 'No slots'}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                        {isAlreadyBooked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="w-full rounded-xl text-xs opacity-80"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                            Enrolled
                          </Button>
                        ) : isFull ? (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="w-full rounded-xl text-xs opacity-60"
                          >
                            Class Full
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={isBooking}
                            onClick={() => handleBookClass(cls.id)}
                            className="w-full rounded-xl text-xs font-bold gap-1 shadow-sm"
                          >
                            {isBooking ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                Reserving...
                              </>
                            ) : (
                              <>
                                <CalendarPlus className="w-4 h-4" />
                                Reserve Slot
                              </>
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
        </div>
      )}

      {/* ==================== TAB 2: MEMBERSHIPS ==================== */}
      {activeTab === 'memberships' && (
        <div className="space-y-4">
          <DataTable
            columns={membershipColumns}
            data={membershipBookings}
            isLoading={isLoadingMemberships}
            emptyTitle="No Membership Plans Found"
            emptyDescription="You haven't requested any gym memberships yet. Browse our directory to get started."
          />
        </div>
      )}
    </div>
  );
}
