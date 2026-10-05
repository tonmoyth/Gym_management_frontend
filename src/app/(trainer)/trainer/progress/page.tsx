'use strict';
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi, CreateProgressInput, TrainerProgressLogItem } from '@/lib/api/progress.api';
import { dietPlanApi, AssignableMember } from '@/lib/api/dietPlan.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, CardSkeleton } from '@/components/ui/EmptyState';
import {
  TrendingUp,
  Plus,
  Scale,
  Activity,
  Check,
  AlertCircle,
  Ruler,
  Sparkles,
  Building2,
} from 'lucide-react';

// WHO BMI classification helper
export function getBmiCategory(bmiValue?: number | string | null): {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
} {
  if (!bmiValue || isNaN(Number(bmiValue))) {
    return {
      label: 'Unknown',
      colorClass: 'text-slate-400',
      bgClass: 'bg-slate-800/40',
      borderClass: 'border-slate-700',
    };
  }
  const val = Number(bmiValue);
  if (val < 18.5) {
    return {
      label: 'Underweight',
      colorClass: 'text-sky-400',
      bgClass: 'bg-sky-500/10',
      borderClass: 'border-sky-500/30',
    };
  }
  if (val >= 18.5 && val <= 24.9) {
    return {
      label: 'Normal Weight',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/30',
    };
  }
  if (val >= 25 && val <= 29.9) {
    return {
      label: 'Overweight',
      colorClass: 'text-amber-400',
      bgClass: 'bg-amber-500/10',
      borderClass: 'border-amber-500/30',
    };
  }
  return {
    label: 'Obese',
    colorClass: 'text-rose-400',
    bgClass: 'bg-rose-500/10',
    borderClass: 'border-rose-500/30',
  };
}

export default function TrainerProgressPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Fetch Assignable Members for this Trainer
  const {
    data: membersRes,
    isLoading: isLoadingMembers,
  } = useQuery({
    queryKey: ['trainer-assignable-members'],
    queryFn: () => dietPlanApi.getAssignableMembers(),
  });

  const rawMembers = membersRes?.data?.data;
  const assignableMembers: AssignableMember[] = Array.isArray(rawMembers)
    ? rawMembers
    : Array.isArray((rawMembers as any)?.data)
      ? (rawMembers as any).data
      : [];

  // 2. Fetch Logged Progress History for this Trainer
  const {
    data: progressRes,
    isLoading: isLoadingProgress,
  } = useQuery({
    queryKey: ['trainer-logged-progress'],
    queryFn: () => progressApi.getTrainerLoggedProgress(),
  });

  const rawLogs = progressRes?.data?.data;
  const loggedProgress: TrainerProgressLogItem[] = Array.isArray(rawLogs)
    ? rawLogs
    : Array.isArray((rawLogs as any)?.data)
      ? (rawLogs as any).data
      : [];

  // Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'ft'>('cm');
  const [heightCm, setHeightCm] = useState('');
  const [heightFt, setHeightFt] = useState('');
  const [heightIn, setHeightIn] = useState('');

  const [weight, setWeight] = useState('');
  const [bmi, setBmi] = useState('');
  const [isManualBmi, setIsManualBmi] = useState(false);

  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hips, setHips] = useState('');
  const [arms, setArms] = useState('');
  const [workoutLog, setWorkoutLog] = useState('');

  // Find currently selected member details
  const selectedMember = assignableMembers.find((m) => m.id === selectedMemberId);

  // Compute effective height in CM
  const effectiveHeightCm = useMemo(() => {
    if (heightUnit === 'cm') {
      const h = Number(heightCm);
      if (!isNaN(h) && h > 0) {
        // If trainer entered meters (e.g. 1.75m), convert to 175cm
        return h < 3 ? Number((h * 100).toFixed(1)) : h;
      }
      return 0;
    }
    const ft = Number(heightFt) || 0;
    const inch = Number(heightIn) || 0;
    const totalInches = ft * 12 + inch;
    return totalInches > 0 ? Number((totalInches * 2.54).toFixed(1)) : 0;
  }, [heightUnit, heightCm, heightFt, heightIn]);

  // Auto BMI calculation for trainer
  useEffect(() => {
    if (isManualBmi) return;

    const numWeight = Number(weight);
    if (numWeight > 0 && effectiveHeightCm >= 40) {
      const heightM = effectiveHeightCm / 100;
      const rawCalc = numWeight / (heightM * heightM);
      const safeBmi = Math.min(99.9, Math.max(5.0, Number(rawCalc.toFixed(1))));
      setBmi(String(safeBmi));
    } else if (!isManualBmi && !weight) {
      setBmi('');
    }
  }, [weight, effectiveHeightCm, isManualBmi]);

  const bmiCategory = useMemo(() => getBmiCategory(bmi), [bmi]);

  const logMutation = useMutation({
    mutationFn: (data: CreateProgressInput) => progressApi.create(data),
    onSuccess: () => {
      setIsModalOpen(false);
      setSuccessMessage('Client body composition metrics logged successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['trainer-logged-progress'] });

      // Reset form
      setSelectedMemberId('');
      setWeight('');
      setBmi('');
      setIsManualBmi(false);
      setHeightCm('');
      setHeightFt('');
      setHeightIn('');
      setChest('');
      setWaist('');
      setHips('');
      setArms('');
      setWorkoutLog('');
    },
    onError: (err: any) => {
      setErrorMessage(
        err.response?.data?.message ||
        'Failed to record progress metrics. Verify that the Member is assigned to you.'
      );
    },
  });

  const handleOpenModal = () => {
    setErrorMessage(null);
    if (!selectedMemberId && assignableMembers.length > 0) {
      setSelectedMemberId(assignableMembers[0].id);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const numWeight = weight ? Number(parseFloat(weight).toFixed(2)) : undefined;
    const numBmi = bmi ? Math.min(99.9, Math.max(5.0, Number(parseFloat(bmi).toFixed(1)))) : undefined;

    if (!selectedMember) {
      setErrorMessage('Please select an assignable member from the dropdown.');
      return;
    }

    if (!numWeight) {
      setErrorMessage('Body weight is required.');
      return;
    }

    const cleanMeasurements: Record<string, number> = {};
    if (effectiveHeightCm > 0) cleanMeasurements.height = effectiveHeightCm;
    if (chest && !isNaN(Number(chest))) cleanMeasurements.chest = parseFloat(chest);
    if (waist && !isNaN(Number(waist))) cleanMeasurements.waist = parseFloat(waist);
    if (hips && !isNaN(Number(hips))) cleanMeasurements.hips = parseFloat(hips);
    if (arms && !isNaN(Number(arms))) cleanMeasurements.arms = parseFloat(arms);

    logMutation.mutate({
      memberId: selectedMember.id,
      weight: numWeight,
      bmi: numBmi,
      measurements: Object.keys(cleanMeasurements).length > 0 ? cleanMeasurements : undefined,
      workoutLog: workoutLog.trim() || undefined,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Athlete Assessment
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Client Physical Transformation</h1>
          <p className="text-slate-400 mt-1 text-sm max-w-2xl">
            Record body weight, auto-calculated BMI, tape measurements, and workout performance notes for your athletes.
          </p>
        </div>
        <Button
          onClick={handleOpenModal}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4 text-white" />}
          className="bg-teal-600 hover:bg-teal-700 font-bold shrink-0"
        >
          Record Client Measurements
        </Button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Progress Logs Grid */}
      {isLoadingProgress ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : loggedProgress.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No Member Measurements Logged Yet"
          description="Log bi-weekly weigh-ins, body circumferences, and progressive overload benchmarks for your athletes."
          actionLabel="Log First Metrics"
          onAction={handleOpenModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loggedProgress.map((log) => {
            const bmiInfo = getBmiCategory(log.bmi);

            return (
              <div
                key={log.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/30 transition-all shadow-xl space-y-5"
              >
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold shrink-0">
                      {log.memberName ? log.memberName.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">
                          {log.memberName || 'Assigned Member'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{log.memberEmail || `ID: ${log.memberId.slice(0, 8)}...`}</p>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500 shrink-0">
                    {new Date(log.loggedAt || log.date || Date.now()).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Weight & BMI Metrics */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-teal-400" /> Body Weight
                    </span>
                    <p className="text-2xl font-black text-white">
                      {log.weight ? `${log.weight} kg` : '—'}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-blue-400" /> Body Mass Index
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-black text-white">
                        {log.bmi ? log.bmi : '—'}
                      </p>
                      {log.bmi && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bmiInfo.bgClass} ${bmiInfo.colorClass} ${bmiInfo.borderClass}`}>
                          {bmiInfo.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Circumference Measurements */}
                {log.measurements && (
                  <div className="text-xs text-slate-300 flex flex-wrap gap-2 pt-1">
                    {log.measurements.height && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
                        Height: <strong className="text-white">{log.measurements.height} cm</strong>
                      </span>
                    )}
                    {log.measurements.chest && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
                        Chest: <strong className="text-white">{log.measurements.chest}&quot;</strong>
                      </span>
                    )}
                    {log.measurements.waist && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
                        Waist: <strong className="text-white">{log.measurements.waist}&quot;</strong>
                      </span>
                    )}
                    {log.measurements.hips && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
                        Hips: <strong className="text-white">{log.measurements.hips}&quot;</strong>
                      </span>
                    )}
                    {log.measurements.arms && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
                        Arms: <strong className="text-white">{log.measurements.arms}&quot;</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Workout Notes */}
                {log.workoutLog && (
                  <p className="text-xs text-slate-300 bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800 italic leading-relaxed">
                    &ldquo;{log.workoutLog}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Record Measurements Modal with Auto BMI */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Client Progress Metrics"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Member Selection Dropdown (Replaces manual Member ID text input) */}
          <div className="space-y-2">
            <label
              htmlFor="member-select-progress"
              className="block text-xs font-semibold text-slate-200"
            >
              Select Member (Client) <span className="text-rose-400">*</span>
            </label>

            {isLoadingMembers ? (
              <div className="h-10 bg-slate-800 rounded-xl animate-pulse" />
            ) : assignableMembers.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">No Assignable Members Found</p>
                  <p className="mt-0.5 text-slate-400">
                    Clients appear here once they enroll in your affiliated fitness facility or book one of your classes.
                  </p>
                </div>
              </div>
            ) : (
              <select
                id="member-select-progress"
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-900 border border-slate-700 hover:border-slate-600 focus:border-teal-500 rounded-xl text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all cursor-pointer"
              >
                <option value="">-- Choose an assigned member --</option>
                {assignableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.email}) — {m.businessName}
                  </option>
                ))}
              </select>
            )}

            {/* Selected Member Preview Card */}
            {selectedMember && (
              <div className="p-3.5 rounded-xl bg-teal-950/20 border border-teal-500/30 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-sm shrink-0">
                    {selectedMember.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{selectedMember.fullName}</p>
                    <p className="text-[11px] text-slate-400">{selectedMember.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-teal-500/30 font-medium">
                    <Building2 className="w-3 h-3 text-teal-400" />
                    {selectedMember.businessName}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Client Height with CM vs FT/IN Toggle */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Ruler className="w-3.5 h-3.5 text-teal-400" />
                Client Height
              </label>

              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-700 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setHeightUnit('cm')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                    heightUnit === 'cm' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CM
                </button>
                <button
                  type="button"
                  onClick={() => setHeightUnit('ft')}
                  className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                    heightUnit === 'ft' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  FT & IN
                </button>
              </div>
            </div>

            {heightUnit === 'cm' ? (
              <Input
                type="number"
                step="0.5"
                placeholder="e.g. 175"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Feet (e.g. 5)"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Inches (e.g. 10)"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Weight & BMI calculation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Body Weight (kg) *"
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 78.5"
              required
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Body Mass Index (BMI)</label>
                <button
                  type="button"
                  onClick={() => setIsManualBmi(!isManualBmi)}
                  className="text-[10px] text-teal-400 hover:underline cursor-pointer"
                >
                  {isManualBmi ? 'Auto-calculate' : 'Override manual'}
                </button>
              </div>
              <Input
                type="number"
                step="0.1"
                value={bmi}
                onChange={(e) => {
                  setIsManualBmi(true);
                  setBmi(e.target.value);
                }}
                placeholder="e.g. 24.2"
                readOnly={!isManualBmi}
                className={!isManualBmi ? 'bg-slate-800/40 text-slate-300' : ''}
              />
              {bmi && (
                <div className="flex items-center gap-2 pt-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${bmiCategory.bgClass} ${bmiCategory.colorClass} ${bmiCategory.borderClass}`}>
                    {bmiCategory.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Circumference Measurements */}
          <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              Circumference Metrics (inches, optional)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Input
                label="Chest"
                type="number"
                step="0.1"
                placeholder='40.5"'
                value={chest}
                onChange={(e) => setChest(e.target.value)}
              />
              <Input
                label="Waist"
                type="number"
                step="0.1"
                placeholder='32.0"'
                value={waist}
                onChange={(e) => setWaist(e.target.value)}
              />
              <Input
                label="Hips"
                type="number"
                step="0.1"
                placeholder='38.0"'
                value={hips}
                onChange={(e) => setHips(e.target.value)}
              />
              <Input
                label="Arms"
                type="number"
                step="0.1"
                placeholder='15.5"'
                value={arms}
                onChange={(e) => setArms(e.target.value)}
              />
            </div>
          </div>

          {/* Workout & Performance Notes */}
          <Textarea
            label="Workout Performance & Assessment Notes"
            value={workoutLog}
            onChange={(e) => setWorkoutLog(e.target.value)}
            rows={2}
            placeholder="Squat/Bench PR, stamina improvements, form corrections..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={logMutation.isPending}
              disabled={!selectedMemberId || assignableMembers.length === 0}
              className="bg-teal-600 hover:bg-teal-700 font-bold"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Save Metrics
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
