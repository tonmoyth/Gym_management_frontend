'use client';

import React, { useState, useEffect } from 'react';
import { dietPlanApi } from '@/lib/api/dietPlan.api';
import { DietPlan } from '@/types/api.types';
import { EmptyState, Skeleton } from '@/components/ui/EmptyState';
import { Utensils, Clock, Flame, CheckCircle2 } from 'lucide-react';

export default function MemberDietPlanPage() {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDiet() {
      setIsLoading(true);
      try {
        const res = await dietPlanApi.getMyDietPlan();
        if (res.data?.success && res.data.data) {
          setDietPlan(res.data.data);
        }
      } catch {
        setDietPlan(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadDiet();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  const meals = dietPlan?.content?.meals || [];
  const guidelines = dietPlan?.content?.guidelines || [];
  const notes = dietPlan?.content?.notes;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          My Nutritional Plan
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Custom dietary targets and meal schedules designed by your certified coach
        </p>
      </div>

      {!dietPlan ? (
        <EmptyState
          title="No Diet Plan Assigned"
          description="Your trainer has not yet assigned an active nutrition plan. Check in with your coach to get personalized meal targets."
          icon={<Utensils className="w-6 h-6 text-orange-500" />}
        />
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full">
                Active Meal Regimen
              </span>
              <h2 className="text-xl font-black">
                {dietPlan.trainer?.user?.fullName
                  ? `Assigned by Coach ${dietPlan.trainer.user.fullName}`
                  : 'Coach Prescribed Diet'}
              </h2>
              <p className="text-xs text-emerald-100">
                Last updated: {new Date(dietPlan.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Meals Timeline */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" /> Daily Meal Schedule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meals.map((meal, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {meal.name}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {meal.time}
                    </div>
                  </div>

                  {meal.calories && (
                    <div className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-lg">
                      <Flame className="w-3.5 h-3.5" /> ~{meal.calories} kcal
                    </div>
                  )}

                  <ul className="space-y-1.5 pt-1">
                    {meal.items?.map((item, i) => (
                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {meal.notes && (
                    <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100 dark:border-slate-800">
                      Note: {meal.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines & Notes */}
          {(guidelines.length > 0 || notes) && (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Coach Guidelines & Hydration Rules
              </h4>

              {guidelines.length > 0 && (
                <ul className="space-y-2">
                  {guidelines.map((g, i) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              )}

              {notes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 leading-relaxed">
                  {notes}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
