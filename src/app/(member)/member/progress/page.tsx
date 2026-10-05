'use strict';
'use client';

import { useState, useEffect, useMemo } from 'react';
import { progressApi } from '@/lib/api/progress.api';
import { ProgressLog } from '@/types/api.types';
import { Button } from '@/components/ui/Button';
import { DataTable, Column } from '@/components/ui/DataTable';
import {
  TrendingUp,
  Scale,
  Activity,
  Calendar,
  RefreshCw,
  UserCheck,
  ShieldCheck,
  Sparkles,
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
  if (val < 25) {
    return {
      label: 'Healthy Weight',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500/10',
      borderClass: 'border-emerald-500/30',
    };
  }
  if (val < 30) {
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

export default function MemberProgressPage() {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await progressApi.getMyProgress();
      const raw = res.data?.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.progress)
        ? raw.progress
        : [];
      setLogs(list);
    } catch {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const latest = logs[0];
  const latestBmiCat = useMemo(() => getBmiCategory(latest?.bmi), [latest]);
  const latestMeasurements = (latest?.measurements as any) || null;

  const columns: Column<ProgressLog>[] = [
    {
      header: 'Date Logged',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span className="font-bold text-slate-900 dark:text-white">
            {new Date(row.loggedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      ),
    },
    {
      header: 'Weight',
      cell: (row) => (
        <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
          {row.weight ? `${row.weight} kg` : '—'}
        </span>
      ),
    },
    {
      header: 'BMI & Category',
      cell: (row) => {
        if (!row.bmi) return <span className="text-slate-400">—</span>;
        const cat = getBmiCategory(row.bmi);
        return (
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white font-mono">
              {row.bmi}
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${cat.bgClass} ${cat.colorClass} ${cat.borderClass}`}
            >
              {cat.label}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Body Circumferences',
      cell: (row) => {
        const m = row.measurements as any;
        if (!m || Object.keys(m).length === 0) return <span className="text-slate-400">—</span>;
        return (
          <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">
            {m.height && `H: ${m.height}cm `}
            {m.chest && `C: ${m.chest}" `}
            {m.waist && `W: ${m.waist}" `}
            {m.hips && `H: ${m.hips}" `}
            {m.arms && `A: ${m.arms}"`}
          </span>
        );
      },
    },
    {
      header: 'Trainer Notes & Workout Log',
      cell: (row) => (
        <span className="text-xs text-slate-500 line-clamp-2 max-w-sm" title={row.workoutLog || undefined}>
          {row.workoutLog || '—'}
        </span>
      ),
    },
    {
      header: 'Source',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
          <UserCheck className="w-3 h-3" />
          {row.source === 'TRAINER' ? 'Certified Trainer' : 'Self Log'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Trainer Supervised Metrics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            My Fitness Progress & Transformation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            View your body weight, BMI calculation, and circumference measurements recorded by your trainer.
          </p>
        </div>

        <Button
          onClick={fetchLogs}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          className="text-xs"
          title="Refresh progress records"
        >
          Refresh
        </Button>
      </div>

      {/* Trainer Info Notice Card */}
      <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start sm:items-center gap-3 text-xs text-blue-800 dark:text-blue-300 shadow-xs">
        <UserCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
        <div className="flex-1">
          <span className="font-bold">Managed by Your Trainer:</span> Your certified fitness trainer updates your bi-weekly weigh-ins, body circumference measurements, and progressive overload notes during training sessions.
        </div>
      </div>

      {/* Highlights KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Current Weight */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Current Weight</span>
            <Scale className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
            {latest?.weight ? `${latest.weight} kg` : '—'}
          </div>
          <p className="text-[11px] text-slate-400">
            {latest ? `Logged on ${new Date(latest.loggedAt).toLocaleDateString()}` : 'No weigh-in recorded yet'}
          </p>
        </div>

        {/* Card 2: Body Mass Index (BMI) with category */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Body Mass Index (BMI)</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
              {latest?.bmi ? latest.bmi : '—'}
            </div>
            {latest?.bmi && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${latestBmiCat.bgClass} ${latestBmiCat.colorClass} ${latestBmiCat.borderClass}`}
              >
                {latestBmiCat.label}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">Calculated from weight & height</p>
        </div>

        {/* Card 3: Total Recorded Checkpoints */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Total Checkpoints</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
            {logs.length}
          </div>
          <p className="text-[11px] text-slate-400">Trainer verified fitness entries</p>
        </div>
      </div>

      {/* Latest Body Circumference Snapshot (if measurements exist) */}
      {latestMeasurements && Object.keys(latestMeasurements).length > 0 && (
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Latest Body Composition Snapshot
            </h4>
            <span className="text-[11px] text-slate-500">
              {new Date(latest.loggedAt).toLocaleDateString()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {latestMeasurements.height && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block">Height</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {latestMeasurements.height} cm
                </span>
              </div>
            )}
            {latestMeasurements.chest && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block">Chest</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {latestMeasurements.chest}&quot;
                </span>
              </div>
            )}
            {latestMeasurements.waist && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block">Waist</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {latestMeasurements.waist}&quot;
                </span>
              </div>
            )}
            {latestMeasurements.hips && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 block">Hips</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  {latestMeasurements.hips}&quot;
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Progress Data Table */}
      <DataTable
        columns={columns}
        data={logs}
        isLoading={isLoading}
        emptyTitle="No Progress Records Found"
        emptyDescription="Your personal trainer will record your bi-weekly weigh-ins, body circumferences, and progressive overload benchmarks here."
      />
    </div>
  );
}
