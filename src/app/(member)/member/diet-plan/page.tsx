'use client';

import { useState, useEffect } from 'react';
import { dietPlanApi } from '@/lib/api/dietPlan.api';
import { DietPlan } from '@/types/api.types';
import { EmptyState, Skeleton } from '@/components/ui/EmptyState';
import { Utensils, Clock, Flame, CheckCircle2, Target, Droplet } from 'lucide-react';

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

  // Parse raw meals from either root `meals` or nested `content.meals`
  const rawMeals = dietPlan?.meals || dietPlan?.content?.meals;
  let meals: any[] = [];
  if (Array.isArray(rawMeals)) {
    meals = rawMeals;
  } else if (rawMeals && typeof rawMeals === 'object') {
    meals = Object.entries(rawMeals).map(([mealType, food]: [string, any]) => ({
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
          ? [{ name: food, quantity: '' }]
          : Array.isArray(food)
          ? food
          : [{ name: String(food) }],
    }));
  }

  const title = dietPlan?.title || dietPlan?.content?.title || 'Coach Prescribed Diet';
  const goal = dietPlan?.goal || dietPlan?.content?.goal;
  const coachName = dietPlan?.trainer?.name || dietPlan?.trainer?.user?.fullName;
  const dailyCalories =
    dietPlan?.dailyCalories ||
    dietPlan?.content?.dailyCalories ||
    dietPlan?.content?.targetCalories;
  const macros = dietPlan?.macros || dietPlan?.content?.macros;
  const notes = dietPlan?.notes || dietPlan?.content?.notes;

  const rawGuidelines = dietPlan?.content?.guidelines;
  const guidelines: string[] = Array.isArray(rawGuidelines)
    ? rawGuidelines
    : typeof rawGuidelines === 'string'
    ? rawGuidelines.split('\n').filter(Boolean)
    : [];

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
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-3 py-1 rounded-full inline-block">
                  Active Meal Regimen
                </span>
                <h2 className="text-xl font-black">{title}</h2>
                <p className="text-xs text-emerald-100 flex items-center gap-2">
                  <span>
                    {coachName ? `Assigned by Coach ${coachName}` : 'Coach Prescribed Diet'}
                  </span>
                  {dietPlan.updatedAt && (
                    <>
                      <span>•</span>
                      <span>
                        Last updated: {new Date(dietPlan.updatedAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {dailyCalories ? (
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider block">
                    Daily Target
                  </span>
                  <span className="text-2xl font-black flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5 text-amber-300" />
                    {dailyCalories}
                    <span className="text-xs font-normal text-emerald-200">kcal</span>
                  </span>
                </div>
              ) : null}
            </div>

            {/* Target Goal & Macro Pills */}
            <div className="pt-3 border-t border-white/15 flex flex-wrap items-center gap-2 text-xs">
              {goal && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/25 font-semibold text-emerald-100">
                  <Target className="w-3.5 h-3.5 text-amber-300" />
                  Goal: {goal}
                </span>
              )}
              {macros?.protein && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 font-semibold">
                  🥩 Protein: {macros.protein}
                </span>
              )}
              {macros?.carbs && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 font-semibold">
                  🍚 Carbs: {macros.carbs}
                </span>
              )}
              {macros?.fats && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 font-semibold">
                  🥑 Fats: {macros.fats}
                </span>
              )}
            </div>
          </div>

          {/* Meals Timeline */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Utensils className="w-4 h-4 text-emerald-600" /> Daily Meal Schedule
            </h3>

            {meals.length === 0 ? (
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
                No specific meals configured in this plan.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meals.map((meal, idx) => {
                  const mealName = meal.mealType || meal.name || `Meal ${idx + 1}`;
                  const mealTime = meal.time;
                  const mealCalories = meal.calories;
                  const foodsList: { name: string; quantity?: string }[] = Array.isArray(meal.foods)
                    ? meal.foods.map((f: any) =>
                        typeof f === 'string'
                          ? { name: f }
                          : { name: f.name || f.food || '', quantity: f.quantity }
                      )
                    : Array.isArray(meal.items)
                    ? meal.items.map((item: any) =>
                        typeof item === 'string'
                          ? { name: item }
                          : { name: item.name || '', quantity: item.quantity }
                      )
                    : [];

                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 hover:border-emerald-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-xl">
                          {mealName}
                        </span>
                        {mealTime && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock className="w-3.5 h-3.5" />
                            {mealTime}
                          </div>
                        )}
                      </div>

                      {mealCalories && (
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-lg">
                          <Flame className="w-3.5 h-3.5" /> ~{mealCalories} kcal
                        </div>
                      )}

                      {foodsList.length > 0 && (
                        <ul className="space-y-1.5 pt-1">
                          {foodsList.map((food, i) => (
                            <li
                              key={i}
                              className="text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span>{food.name}</span>
                              </div>
                              {food.quantity && (
                                <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                                  {food.quantity}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}

                      {meal.notes && (
                        <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100 dark:border-slate-800">
                          Note: {meal.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Guidelines & Notes */}
          {(guidelines.length > 0 || notes) && (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-cyan-500" />
                Coach Guidelines & Instructions
              </h4>

              {guidelines.length > 0 && (
                <ul className="space-y-2">
                  {guidelines.map((g, i) => (
                    <li
                      key={i}
                      className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              )}

              {notes && (
                <p className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800 leading-relaxed whitespace-pre-line">
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
