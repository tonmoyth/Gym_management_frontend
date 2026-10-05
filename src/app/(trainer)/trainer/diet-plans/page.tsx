'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dietPlanApi, AssignableMember, TrainerDietPlanItem } from '@/lib/api/dietPlan.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { EmptyState, CardSkeleton } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { 
  Apple, 
  Plus, 
  Flame, 
  Check, 
  AlertCircle, 
  Building2,
  Sparkles,
} from 'lucide-react';

export default function TrainerDietPlansPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Fetch Prescribed Diet Plans for this Trainer
  const {
    data: plansRes,
    isLoading: isLoadingPlans,
  } = useQuery({
    queryKey: ['trainer-diet-plans'],
    queryFn: () => dietPlanApi.getTrainerDietPlans(),
  });

  const rawPlans = plansRes?.data?.data;
  const dietPlans: TrainerDietPlanItem[] = Array.isArray(rawPlans)
    ? rawPlans
    : Array.isArray((rawPlans as any)?.data)
      ? (rawPlans as any).data
      : [];

  // 2. Fetch Assignable Members for this Trainer (linked via gym membership or class bookings)
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

  // Form State
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [planTitle, setPlanTitle] = useState('Lean Muscle & Strength Nutrition');
  const [goal, setGoal] = useState('Hypertrophy & Fat Loss');
  const [calories, setCalories] = useState('2200');
  const [protein, setProtein] = useState('160g');
  const [carbs, setCarbs] = useState('220g');
  const [fats, setFats] = useState('65g');
  const [breakfast, setBreakfast] = useState('Oatmeal with whey protein, chia seeds, and sliced banana');
  const [lunch, setLunch] = useState('Grilled chicken breast with brown rice and mixed green salad');
  const [dinner, setDinner] = useState('Baked salmon with sweet potato mash and steamed broccoli');
  const [snacks, setSnacks] = useState('Greek yogurt with almonds and green apple');
  const [guidelines, setGuidelines] = useState('Drink at least 3.5L of water daily. Avoid sugary sodas and processed fast food.');

  // Find currently selected member details
  const selectedMember = assignableMembers.find((m) => m.id === selectedMemberId);

  // Mutation to prescribe new diet plan
  const createMutation = useMutation({
    mutationFn: (payload: any) => dietPlanApi.create(payload),
    onSuccess: () => {
      setIsModalOpen(false);
      setSuccessMessage('Diet & nutrition chart prescribed successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['trainer-diet-plans'] });
      // Reset form
      setSelectedMemberId('');
      setPlanTitle('Lean Muscle & Strength Nutrition');
      setGoal('Hypertrophy & Fat Loss');
    },
    onError: (err: any) => {
      setErrorMessage(
        err.response?.data?.message || 'Failed to prescribe diet plan. Please ensure the member is valid.'
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

    if (!selectedMember) {
      setErrorMessage('Please select an assignable member from the dropdown.');
      return;
    }

    const payload = {
      memberId: selectedMember.id,
      businessId: selectedMember.businessId,
      title: planTitle.trim() || `Nutrition Plan for ${selectedMember.fullName}`,
      goal: goal.trim() || 'General Fitness',
      dailyCalories: parseInt(calories, 10) || 2000,
      macros: { protein, carbs, fats },
      startDate: new Date().toISOString(),
      notes: guidelines,
      meals: [
        {
          mealType: 'Breakfast',
          time: '08:00 AM',
          foods: [{ name: breakfast, quantity: '1 serving' }],
        },
        {
          mealType: 'Lunch',
          time: '01:00 PM',
          foods: [{ name: lunch, quantity: '1 serving' }],
        },
        {
          mealType: 'Dinner',
          time: '08:00 PM',
          foods: [{ name: dinner, quantity: '1 serving' }],
        },
        ...(snacks
          ? [
              {
                mealType: 'Snacks',
                time: '04:30 PM',
                foods: [{ name: snacks, quantity: '1 serving' }],
              },
            ]
          : []),
      ],
      content: {
        targetCalories: parseInt(calories, 10) || 2000,
        macros: { protein, carbs, fats },
        meals: {
          breakfast,
          lunch,
          dinner,
          snacks,
        },
        guidelines,
      },
    };

    createMutation.mutate(payload);
  };

  // Helper to extract meal description from meal objects or legacy structure
  const getMealString = (meals: any, mealName: string) => {
    if (!meals) return '';
    if (typeof meals === 'object' && !Array.isArray(meals)) {
      return meals[mealName.toLowerCase()] || '';
    }
    if (Array.isArray(meals)) {
      const found = meals.find(
        (m: any) => (m.mealType || '').toLowerCase() === mealName.toLowerCase()
      );
      if (found) {
        if (Array.isArray(found.foods)) {
          return found.foods.map((f: any) => f.name || f).join(', ');
        }
        return found.name || '';
      }
    }
    return '';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
              Coaching & Nutrition
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Member Diet & Nutrition</h1>
          <p className="text-slate-400 mt-1 text-sm max-w-2xl">
            Prescribe tailored calorie targets, macronutrient goals, and structured daily meal plans for clients assigned to your facility.
          </p>
        </div>
        <Button
          onClick={handleOpenModal}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          className="shrink-0"
        >
          Prescribe Diet Plan
        </Button>
      </div>

      {/* Success Alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-sm animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Prescribed Plans Grid */}
      {isLoadingPlans ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : dietPlans.length === 0 ? (
        <EmptyState
          icon={Apple}
          title="No Active Diet Plans Prescribed"
          description="Create customized calorie targets, meal times, and coaching hydration guidelines for your assigned personal training clients."
          actionLabel="Prescribe First Plan"
          onAction={handleOpenModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dietPlans.map((plan) => {
            const bFast = getMealString(plan.meals, 'breakfast');
            const lUnch = getMealString(plan.meals, 'lunch');
            const dInner = getMealString(plan.meals, 'dinner');
            const sNacks = getMealString(plan.meals, 'snacks');

            return (
              <div
                key={plan.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/30 transition-all shadow-xl space-y-5"
              >
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold shrink-0">
                      {plan.memberName ? plan.memberName.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">
                          {plan.memberName || 'Assigned Member'}
                        </span>
                        {plan.businessName && (
                          <Badge variant="neutral" size="sm" className="lowercase text-[10px]">
                            {plan.businessName}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{plan.memberEmail || plan.title}</p>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500 shrink-0">
                    {new Date(plan.createdAt || plan.updatedAt || Date.now()).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Calorie & Macros Banner */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-amber-400">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                        Daily Energy Target
                      </span>
                      <span className="font-black text-xl text-white">
                        {plan.dailyCalories ? `${plan.dailyCalories} kcal` : '2,200 kcal'}
                      </span>
                    </div>
                  </div>

                  {plan.macros && (
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      {plan.macros.protein && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-teal-300 border border-slate-700">
                          P: {plan.macros.protein}
                        </span>
                      )}
                      {plan.macros.carbs && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-blue-300 border border-slate-700">
                          C: {plan.macros.carbs}
                        </span>
                      )}
                      {plan.macros.fats && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 border border-slate-700">
                          F: {plan.macros.fats}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Meals Breakdown */}
                <div className="space-y-2 text-xs bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                  {bFast && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="font-bold text-teal-400 w-16 shrink-0">Breakfast:</span>
                      <span className="leading-relaxed">{bFast}</span>
                    </div>
                  )}
                  {lUnch && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="font-bold text-blue-400 w-16 shrink-0">Lunch:</span>
                      <span className="leading-relaxed">{lUnch}</span>
                    </div>
                  )}
                  {dInner && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="font-bold text-purple-400 w-16 shrink-0">Dinner:</span>
                      <span className="leading-relaxed">{dInner}</span>
                    </div>
                  )}
                  {sNacks && (
                    <div className="flex items-start gap-2 text-slate-300">
                      <span className="font-bold text-amber-400 w-16 shrink-0">Snacks:</span>
                      <span className="leading-relaxed">{sNacks}</span>
                    </div>
                  )}
                </div>

                {/* Coaching Guidelines */}
                {plan.notes && (
                  <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-800/80 leading-relaxed">
                    &ldquo;{plan.notes}&rdquo;
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Prescribe Diet Plan Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Prescribe Client Nutrition Chart"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Member Selection Dropdown (Replaces old manual memberId & businessId text inputs) */}
          <div className="space-y-2">
            <label
              htmlFor="member-select"
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
                    Clients appear here once they enroll in your affiliated fitness center or book one of your group/personal classes.
                  </p>
                </div>
              </div>
            ) : (
              <select
                id="member-select"
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

          {/* Plan Title & Goal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Chart Title *"
              value={planTitle}
              onChange={(e) => setPlanTitle(e.target.value)}
              placeholder="e.g. Muscle Gain & Strength Plan"
              required
            />

            <Input
              label="Fitness Objective *"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Weight Loss / Hypertrophy"
              required
            />
          </div>

          {/* Daily Calories & Macronutrients */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input
              label="Calories (kcal)"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="2200"
              required
            />
            <Input
              label="Protein"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              placeholder="160g"
              required
            />
            <Input
              label="Carbohydrates"
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              placeholder="220g"
              required
            />
            <Input
              label="Fats"
              value={fats}
              onChange={(e) => setFats(e.target.value)}
              placeholder="65g"
              required
            />
          </div>

          {/* Meal Schedule Inputs */}
          <div className="space-y-3 pt-1">
            <Input
              label="Breakfast Plan *"
              value={breakfast}
              onChange={(e) => setBreakfast(e.target.value)}
              placeholder="e.g. Oatmeal with whey protein & sliced fruit"
              required
            />

            <Input
              label="Lunch Plan *"
              value={lunch}
              onChange={(e) => setLunch(e.target.value)}
              placeholder="e.g. Grilled chicken breast, brown rice & steamed veggies"
              required
            />

            <Input
              label="Dinner Plan *"
              value={dinner}
              onChange={(e) => setDinner(e.target.value)}
              placeholder="e.g. Baked salmon fillet with quinoa & asparagus"
              required
            />

            <Input
              label="Daily Healthy Snacks"
              value={snacks}
              onChange={(e) => setSnacks(e.target.value)}
              placeholder="e.g. Greek yogurt, raw almonds, or whey protein shake"
            />
          </div>

          {/* Coaching Guidelines */}
          <Textarea
            label="Coaching Guidelines & Hydration"
            value={guidelines}
            onChange={(e) => setGuidelines(e.target.value)}
            rows={2}
            placeholder="Hydration targets, timing instructions, foods to avoid..."
          />

          {/* Modal Actions */}
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
              isLoading={createMutation.isPending}
              disabled={!selectedMemberId || assignableMembers.length === 0}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Prescribe Chart
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
