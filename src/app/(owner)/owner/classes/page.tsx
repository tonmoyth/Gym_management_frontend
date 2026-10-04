'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { classScheduleApi, CreateClassInput } from '@/lib/api/classSchedule.api';
import { trainerApi } from '@/lib/api/trainer.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/Modal';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  Calendar, 
  Plus, 
  Clock, 
  Users, 
  Award, 
  Trash2, 
  AlertCircle,
  CheckCircle2,
  CalendarDays,
  Sparkles,
  UserCheck,
  Pencil
} from 'lucide-react';
import { ClassSchedule } from '@/types/api.types';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function OwnerClassesPage() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [cancellingClassId, setCancellingClassId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [startTime, setStartTime] = useState('07:00');
  const [endTime, setEndTime] = useState('08:30');
  const [capacity, setCapacity] = useState('20');
  const [selectedTrainerIds, setSelectedTrainerIds] = useState<string[]>([]);

  // Edit State
  const [editingClass, setEditingClass] = useState<ClassSchedule | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSelectedDays, setEditSelectedDays] = useState<string[]>([]);
  const [editStartTime, setEditStartTime] = useState('07:00');
  const [editEndTime, setEditEndTime] = useState('08:30');
  const [editCapacity, setEditCapacity] = useState('20');
  const [editSelectedTrainerIds, setEditSelectedTrainerIds] = useState<string[]>([]);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Get owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  // 2. Fetch classes
  const { data: classesRes, isLoading: isClassesLoading } = useQuery({
    queryKey: ['business-classes', businessId],
    queryFn: () => classScheduleApi.listByBusiness(businessId!),
    enabled: !!businessId,
  });

  const classes: ClassSchedule[] = classesRes?.data?.data || [];

  // 3. Fetch gym trainers for multiple selection
  const { data: trainersRes } = useQuery({
    queryKey: ['business-trainers', businessId],
    queryFn: () => trainerApi.getBusinessTrainers(businessId!),
    enabled: !!businessId,
  });

  const trainers = trainersRes?.data?.data || [];

  // Toggle Day Selection
  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSelectEveryday = () => {
    if (selectedDays.length === DAYS_OF_WEEK.length) {
      setSelectedDays([]);
    } else {
      setSelectedDays([...DAYS_OF_WEEK]);
    }
  };

  const handleSelectWeekdays = () => {
    setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  };

  const handleSelectWeekend = () => {
    setSelectedDays(['Saturday', 'Sunday']);
  };

  // Toggle Trainer Selection
  const toggleTrainer = (trainerId: string) => {
    setSelectedTrainerIds((prev) =>
      prev.includes(trainerId) ? prev.filter((id) => id !== trainerId) : [...prev, trainerId]
    );
  };

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateClassInput) => classScheduleApi.create(businessId!, data),
    onSuccess: () => {
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      setSelectedDays(['Monday', 'Wednesday', 'Friday']);
      setStartTime('07:00');
      setEndTime('08:30');
      setCapacity('20');
      setSelectedTrainerIds([]);
      queryClient.invalidateQueries({ queryKey: ['business-classes', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to schedule class.');
    }
  });

  // Cancel Mutation
  const cancelMutation = useMutation({
    mutationFn: (classId: string) => classScheduleApi.cancel(businessId!, classId),
    onSuccess: () => {
      setCancellingClassId(null);
      setSuccessMessage('Class batch deleted successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['business-classes', businessId] });
    },
  });

  // Edit Actions & Mutation
  const handleOpenEdit = (c: ClassSchedule) => {
    setEditErrorMessage(null);
    setEditingClass(c);
    setEditTitle(c.title || '');
    setEditDescription(c.description || '');
    setEditSelectedDays(c.daysOfWeek && c.daysOfWeek.length > 0 ? [...c.daysOfWeek] : ['Monday', 'Wednesday', 'Friday']);

    let start = c.startTimeStr || '07:00';
    let end = c.endTimeStr || '08:30';
    if (!c.startTimeStr && c.startTime) {
      try {
        const d = new Date(c.startTime);
        if (!isNaN(d.getTime())) {
          const h = String(d.getHours()).padStart(2, '0');
          const m = String(d.getMinutes()).padStart(2, '0');
          start = `${h}:${m}`;
        }
      } catch (e) {}
    }
    if (!c.endTimeStr && c.endTime) {
      try {
        const d = new Date(c.endTime);
        if (!isNaN(d.getTime())) {
          const h = String(d.getHours()).padStart(2, '0');
          const m = String(d.getMinutes()).padStart(2, '0');
          end = `${h}:${m}`;
        }
      } catch (e) {}
    }
    setEditStartTime(start);
    setEditEndTime(end);
    setEditCapacity(String(c.capacity || 20));

    const trainerIds: string[] = [];
    if (c.trainers && c.trainers.length > 0) {
      c.trainers.forEach((t) => trainerIds.push(t.id));
    } else if (c.trainer?.id) {
      trainerIds.push(c.trainer.id);
    } else if (c.trainerId) {
      trainerIds.push(c.trainerId);
    }
    setEditSelectedTrainerIds(trainerIds);
  };

  const toggleEditDay = (day: string) => {
    setEditSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleEditSelectEveryday = () => {
    if (editSelectedDays.length === DAYS_OF_WEEK.length) {
      setEditSelectedDays([]);
    } else {
      setEditSelectedDays([...DAYS_OF_WEEK]);
    }
  };

  const handleEditSelectWeekdays = () => {
    setEditSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  };

  const handleEditSelectWeekend = () => {
    setEditSelectedDays(['Saturday', 'Sunday']);
  };

  const toggleEditTrainer = (trainerId: string) => {
    setEditSelectedTrainerIds((prev) =>
      prev.includes(trainerId) ? prev.filter((id) => id !== trainerId) : [...prev, trainerId]
    );
  };

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateClassInput>) => {
      if (!businessId || !editingClass) throw new Error('Missing business or class ID');
      return classScheduleApi.update(businessId, editingClass.id, data);
    },
    onSuccess: () => {
      setEditingClass(null);
      setSuccessMessage('Class timetable updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['business-classes', businessId] });
    },
    onError: (err: any) => {
      setEditErrorMessage(err.response?.data?.message || 'Failed to update class schedule.');
    }
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMessage(null);

    if (editSelectedDays.length === 0) {
      setEditErrorMessage('Please select at least one day for this class timetable.');
      return;
    }

    updateMutation.mutate({
      title: editTitle,
      description: editDescription || undefined,
      daysOfWeek: editSelectedDays,
      startTime: editStartTime,
      endTime: editEndTime,
      startTimeStr: editStartTime,
      endTimeStr: editEndTime,
      timeSlot: `${editStartTime} - ${editEndTime}`,
      capacity: parseInt(editCapacity, 10),
      trainerIds: editSelectedTrainerIds,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedDays.length === 0) {
      setErrorMessage('Please select at least one day for this class timetable.');
      return;
    }

    createMutation.mutate({
      title,
      description: description || undefined,
      daysOfWeek: selectedDays,
      startTime,
      endTime,
      timeSlot: `${startTime} - ${endTime}`,
      capacity: parseInt(capacity, 10),
      trainerIds: selectedTrainerIds.length > 0 ? selectedTrainerIds : undefined,
    });
  };

  if (isBusinessLoading || isClassesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-36 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Ongoing Timetable & Slot System
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Class Timetable & Batches</h1>
          <p className="text-slate-400 mt-1 text-sm max-w-2xl">
            Create recurring class batches with days of the week, specific time slots, slot capacities, and assign 1 or more coaches. Classes remain permanently available for member enrollment.
          </p>
        </div>
        <Button
          onClick={() => {
            setErrorMessage(null);
            setIsCreateOpen(true);
          }}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          className="rounded-xl shadow-lg shadow-orange-500/20 shrink-0"
        >
          Create New Class
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {classes.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Ongoing Classes Scheduled"
          description="Create your first class schedule batch with days of week, time slots, and slot capacities so members can reserve their workout timings."
          actionLabel="Schedule First Class"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c: ClassSchedule) => {
            const booked = c.bookedCount ?? c._count?.bookings ?? 0;
            const totalSlots = c.capacity || 20;
            const availableSlots = c.availableSlots !== undefined ? c.availableSlots : Math.max(0, totalSlots - booked);
            const fillPercentage = Math.min(100, Math.round((booked / totalSlots) * 100));

            // Resolve trainers list
            const trainerList = c.trainers && c.trainers.length > 0 
              ? c.trainers 
              : (c.trainer ? [{ id: c.trainer.id, name: c.trainer.user?.fullName || c.trainer.name || 'Coach' }] : []);

            return (
              <div
                key={c.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between transition-all space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      Ongoing Batch
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="text-slate-500 hover:text-orange-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Edit Class Batch"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCancellingClassId(c.id)}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                        title="Delete Class Batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition-colors">
                      {c.title}
                    </h3>
                    {c.description && (
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {c.description}
                      </p>
                    )}
                  </div>

                  {/* Days Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" /> Scheduled Days
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.daysOfWeek && c.daysOfWeek.length > 0 ? (
                        c.daysOfWeek.map((day) => (
                          <span
                            key={day}
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700"
                          >
                            {day.slice(0, 3)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Everyday</span>
                      )}
                    </div>
                  </div>

                  {/* Time & Slot Details */}
                  <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                      <span className="font-semibold text-white">
                        {c.timeSlot || `${c.startTimeStr || ''} - ${c.endTimeStr || ''}`}
                      </span>
                    </div>

                    {/* Assigned Coaches */}
                    <div className="flex items-start gap-2 pt-1">
                      <Award className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400">Coaches: </span>
                        {trainerList.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {trainerList.map((t) => (
                              <span
                                key={t.id}
                                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 inline-flex items-center gap-1"
                              >
                                <UserCheck className="w-3 h-3" /> {t.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No coach assigned</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Slot Capacity & Visual Progress */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        Slot Occupancy
                      </span>
                      <span className="font-bold text-white">
                        {booked} / {totalSlots} Slots
                      </span>
                    </div>

                    {/* Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          fillPercentage >= 100
                            ? 'bg-rose-500'
                            : fillPercentage >= 75
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-semibold ${availableSlots > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {availableSlots > 0 ? `🟢 ${availableSlots} slots open` : '🔴 Fully Booked'}
                      </span>
                      <span className="text-slate-500">
                        {fillPercentage}% capacity
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/60 flex items-center justify-between">
                  <span>Class ID: {c.id.slice(0, 8)}</span>
                  <span>{business?.name}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Ongoing Class Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Ongoing Class Timetable"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Input
              label="Class Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HIIT Morning Burn, CrossFit & Strength, Power Yoga"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this class, target goals, or equipment used..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-hidden focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Day of Week Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-orange-400" />
                Select Scheduled Days *
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleSelectEveryday}
                  className="text-orange-400 hover:underline font-medium"
                >
                  {selectedDays.length === DAYS_OF_WEEK.length ? 'Clear' : 'Everyday'}
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleSelectWeekdays}
                  className="text-slate-400 hover:text-white"
                >
                  Mon-Fri
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleSelectWeekend}
                  className="text-slate-400 hover:text-white"
                >
                  Sat-Sun
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            {selectedDays.length > 0 && (
              <p className="text-[11px] text-slate-500">
                Scheduled on: <strong className="text-slate-300">{selectedDays.join(', ')}</strong>
              </p>
            )}
          </div>

          {/* Specific Time Slot */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              Class Time Slot *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Start Time</span>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">End Time</span>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Time Slot Preview:</span>
              <strong className="text-orange-400 font-bold">{startTime} - {endTime}</strong>
            </div>
          </div>

          {/* Multiple Trainers Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-400" />
                Assign Coaches / Trainers (1 or more)
              </span>
              <span className="text-[11px] text-slate-500">
                {selectedTrainerIds.length} coach(es) selected
              </span>
            </label>

            {trainers.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-900 border border-slate-800">
                No active trainers found for this business. You can still schedule the class and assign trainers later.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {trainers.map((t: any) => {
                  const isChecked = selectedTrainerIds.includes(t.id);
                  const trainerName = t.user?.fullName || t.name || `Trainer (${t.id.slice(0, 6)})`;

                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleTrainer(t.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-500/10 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                          isChecked ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-700'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-medium truncate">{trainerName}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Slot Capacity */}
          <div className="space-y-1.5">
            <Input
              label="Total Slot Capacity (Max Members) *"
              type="number"
              min="1"
              max="200"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              required
            />
            <p className="text-[11px] text-slate-500">
              When new members join, they will be able to book remaining open slots in this class until {capacity} slots are reached.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={createMutation.isPending}
              className="rounded-xl"
            >
              Create Class Batch
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      <Modal
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
        title="Edit Ongoing Class Timetable"
      >
        <form onSubmit={handleUpdate} className="space-y-5">
          {editErrorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{editErrorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Input
              label="Class Title *"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="e.g. HIIT Morning Burn, CrossFit & Strength, Power Yoga"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Description (Optional)
            </label>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Brief description of this class, target goals, or equipment used..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-hidden focus:border-orange-500 transition-colors resize-none"
            />
          </div>

          {/* Day of Week Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-orange-400" />
                Select Scheduled Days *
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={handleEditSelectEveryday}
                  className="text-orange-400 hover:underline font-medium"
                >
                  {editSelectedDays.length === DAYS_OF_WEEK.length ? 'Clear' : 'Everyday'}
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleEditSelectWeekdays}
                  className="text-slate-400 hover:text-white"
                >
                  Mon-Fri
                </button>
                <span className="text-slate-600">|</span>
                <button
                  type="button"
                  onClick={handleEditSelectWeekend}
                  className="text-slate-400 hover:text-white"
                >
                  Sat-Sun
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = editSelectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleEditDay(day)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                );
              })}
            </div>
            {editSelectedDays.length > 0 && (
              <p className="text-[11px] text-slate-500">
                Scheduled on: <strong className="text-slate-300">{editSelectedDays.join(', ')}</strong>
              </p>
            )}
          </div>

          {/* Specific Time Slot */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              Class Time Slot *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Start Time</span>
                <Input
                  type="time"
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">End Time</span>
                <Input
                  type="time"
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Time Slot Preview:</span>
              <strong className="text-orange-400 font-bold">{editStartTime} - {editEndTime}</strong>
            </div>
          </div>

          {/* Multiple Trainers Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-blue-400" />
                Assign Coaches / Trainers
              </span>
              <span className="text-[11px] text-slate-500">
                {editSelectedTrainerIds.length} coach(es) selected
              </span>
            </label>

            {trainers.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 rounded-xl bg-slate-900 border border-slate-800">
                No active trainers found for this business.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
                {trainers.map((t: any) => {
                  const isChecked = editSelectedTrainerIds.includes(t.id);
                  const trainerName = t.user?.fullName || t.name || `Trainer (${t.id.slice(0, 6)})`;

                  return (
                    <div
                      key={t.id}
                      onClick={() => toggleEditTrainer(t.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-500/10 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                          isChecked ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-700'
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-medium truncate">{trainerName}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Slot Capacity */}
          <div className="space-y-1.5">
            <Input
              label="Total Slot Capacity (Max Members) *"
              type="number"
              min="1"
              max="200"
              value={editCapacity}
              onChange={(e) => setEditCapacity(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingClass(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={updateMutation.isPending}
              className="rounded-xl"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!cancellingClassId}
        onClose={() => setCancellingClassId(null)}
        onConfirm={() => cancellingClassId && cancelMutation.mutate(cancellingClassId)}
        title="Delete this Class Batch?"
        description="This ongoing class timetable and all reserved member slots will be permanently removed."
        confirmLabel="Delete Class"
        variant="danger"
        isLoading={cancelMutation.isPending}
      />
    </div>
  );
}
