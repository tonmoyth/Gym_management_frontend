'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { useAuth } from '@/lib/auth/useAuth';
import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '@/lib/api/subscription.api';
import { SubscriptionPlan } from '@/types/api.types';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Building2,
  Award,
  CreditCard,
  QrCode,
  CheckCircle2,
  Utensils,
  BarChart3,
  BellRing,
  Cpu,
  ChevronRight,
  Check,
  X,
  Play,
  Clock,
  Fingerprint,
  Activity,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [pricingCycle, setPricingCycle] = useState<'all' | 'monthly' | 'yearly'>('all');

  // Fetch real subscription plans created by Super Admin from backend
  const { data: plansRes, isLoading: isLoadingPlans } = useQuery({
    queryKey: ['public-subscription-plans'],
    queryFn: async () => {
      const res = await subscriptionApi.getActivePlans();
      return res.data;
    },
  });

  const plans: SubscriptionPlan[] = Array.isArray(plansRes?.data)
    ? plansRes.data
    : (plansRes as any)?.data?.data || [];

  const getBillingCycleLabel = (cycle: string) => {
    switch (cycle?.toUpperCase()) {
      case 'MONTHLY':
        return 'মাসিক প্যাকেজ';
      case 'YEARLY':
        return 'বার্ষিক প্যাকেজ';
      case 'QUARTERLY':
        return 'ত্রৈমাসিক প্যাকেজ';
      case 'BIANNUAL':
        return 'অর্ধ-বার্ষিক প্যাকেজ';
      case 'LIFETIME':
        return 'লাইফটাইম প্যাকেজ';
      default:
        return cycle || 'কাস্টম প্যাকেজ';
    }
  };

  const getCycleSuffix = (cycle: string) => {
    switch (cycle?.toUpperCase()) {
      case 'MONTHLY':
        return '/ মাস';
      case 'YEARLY':
        return '/ বছর';
      case 'QUARTERLY':
        return '/ ৩ মাস';
      default:
        return '';
    }
  };

  const filteredPlans = plans.filter((plan) => {
    if (pricingCycle === 'monthly') return plan.billingCycle === 'MONTHLY';
    if (pricingCycle === 'yearly') return plan.billingCycle === 'YEARLY';
    return true;
  });

  const displayPlans = filteredPlans.length > 0 ? filteredPlans : plans;

  const getPlanCtaLink = () => {
    if (!user) return '/register';
    if (user.role === 'BUSINESS_OWNER') return '/owner/subscription';
    return getDashboardUrl();
  };

  const getDashboardUrl = () => {
    if (!user) return '/register';
    switch (user.role) {
      case 'SUPER_ADMIN':
      case 'ADMIN':
      case 'STAFF':
        return '/admin/dashboard';
      case 'BUSINESS_OWNER':
        return '/owner/dashboard';
      case 'TRAINER':
        return '/trainer/dashboard';
      case 'MEMBER':
      default:
        return '/member/dashboard';
    }
  };

  return (
    <div id="top" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-600 selection:text-white">
      {/* 1. Navbar */}
      <LandingNavbar />

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(234,88,12,0.18),rgba(15,23,42,0))]" />
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto space-y-12">
          {/* Hero Content */}
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              কমপ্লিট জিম ম্যানেজমেন্ট SaaS প্ল্যাটফর্ম
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15]">
              আপনার জিম, এখন আরও{' '}
              <span className="text-orange-500">
                স্মার্টভাবে পরিচালনা করুন
              </span>
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
              Member Management, Trainer Management, Attendance, Booking, Payment, Reports এবং Fitness Tracking – জিম ব্যবসার প্রতিটি অপারেশন এখন একটি মাত্র ক্লাউড প্ল্যাটফর্মে।
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  href={getDashboardUrl()}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-orange-600 hover:bg-orange-500 active:scale-95 text-white shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2.5"
                >
                  ড্যাশবোর্ডে প্রবেশ করুন <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-orange-600 hover:bg-orange-500 active:scale-95 text-white shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2.5"
                  >
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/demo"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-orange-500 text-orange-500" /> ডেমো দেখুন
                  </Link>
                </>
              )}
            </div>

            {/* Value Props */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-orange-400" /> ১০০% সিকিউর ক্লাউড আর্কিটেকচার
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-orange-400" /> bKash / Nagad / Bank পেমেন্ট গেটওয়ে
              </span>
              <span className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-orange-400" /> ZKTeco বায়োমেট্রিক ও QR অ্যাটেনডেন্স
              </span>
            </div>
          </div>

          {/* 3. Hero Visual — Realistic Gym Management Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto pt-6">
            <div className="rounded-3xl bg-slate-900 border border-slate-800 p-3 sm:p-5 shadow-2xl shadow-black/80 relative">
              {/* Mock Window Top Bar */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800/80 px-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                  <div className="w-3 h-3 rounded-full bg-slate-700" />
                </div>
                <div className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  FitnessPro Cloud Operations • Live Telemetry
                </div>
                <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
                  v2.4 Production
                </div>
              </div>

              {/* Mock Dashboard Body */}
              <div className="pt-4 space-y-4">
                {/* 4 Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400">সক্রিয় মেম্বার</p>
                    <p className="text-xl sm:text-2xl font-black text-white">১,২৪৮ <span className="text-xs font-bold text-orange-400">+১২%</span></p>
                    <p className="text-[10px] text-slate-500">চলতি মাসের নিবন্ধন</p>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400">আজকের উপস্থিতি</p>
                    <p className="text-xl sm:text-2xl font-black text-white">৩১৮ জন</p>
                    <p className="text-[10px] text-orange-400 font-medium">৯৪.২% পাঞ্চ রেট</p>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400">মাসিক রাজস্ব</p>
                    <p className="text-xl sm:text-2xl font-black text-white">৳ ৪,৮৫,০০০</p>
                    <p className="text-[10px] text-slate-500">bKash/Nagad/Bank সহ</p>
                  </div>
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-[11px] font-semibold text-slate-400">সার্টিফাইড ট্রেইনার</p>
                    <p className="text-xl sm:text-2xl font-black text-white">১৮ জন</p>
                    <p className="text-[10px] text-orange-400 font-medium">সবাই অডিটেড</p>
                  </div>
                </div>

                {/* Dashboard Inner Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Left: Live Attendance Stream */}
                  <div className="lg:col-span-2 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-orange-500" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          লাইভ অ্যাটেনডেন্স গেট স্ট্রিম (ZKTeco Sync)
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-orange-400 bg-orange-600/10 px-2 py-0.5 rounded border border-orange-500/20">
                        টার্নস্টাইল সক্রিয়
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-orange-600/20 text-orange-400 font-bold flex items-center justify-center text-[11px]">
                            তা
                          </div>
                          <div>
                            <p className="font-semibold text-white">তানভীর আহমেদ</p>
                            <p className="text-[10px] text-slate-400">মেম্বারশিপ: গোল্ড বার্ষিক প্যাকেজ</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-orange-400">গেট এন্ট্রি সফল</span>
                          <p className="text-[10px] text-slate-500">০৭:৪৫ AM • ZKTeco #1</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-orange-600/20 text-orange-400 font-bold flex items-center justify-center text-[11px]">
                            সা
                          </div>
                          <div>
                            <p className="font-semibold text-white">সাবরিনা আক্তার</p>
                            <p className="text-[10px] text-slate-400">মেম্বারশিপ: উইমেন্স মর্নিং স্লট</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-orange-400">গেট এন্ট্রি সফল</span>
                          <p className="text-[10px] text-slate-500">০৭:৫২ AM • QR Mobile</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[11px]">
                            রা
                          </div>
                          <div>
                            <p className="font-semibold text-white">রাকিবুল হাসান (কোচ)</p>
                            <p className="text-[10px] text-slate-400">সেশন: স্ট্রেন্থ ও কন্ডিশনিং</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-300">ট্রেইনার চেক-ইন</span>
                          <p className="text-[10px] text-slate-500">০৮:০০ AM • RFID Scan</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Revenue Chart & Quick KPIs */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                          <BarChart3 className="w-4 h-4 text-orange-500" /> রাজস্ব সারসংক্ষেপ
                        </span>
                        <span className="text-[10px] text-slate-400">দৈনিক ও মাসিক</span>
                      </div>
                      <p className="text-2xl font-black text-white">৳ ৯২,৪০০</p>
                      <p className="text-[10px] text-orange-400 font-medium">আজকের সংগৃহীত পেমেন্ট</p>
                    </div>

                    {/* Chart Bars */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>bKash / Nagad</span>
                        <span className="font-bold text-white">৳ ৫৮,২০০ (৬৩%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-orange-600 rounded-full" style={{ width: '63%' }} />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                        <span>ব্যাংক ট্রান্সফার</span>
                        <span className="font-bold text-white">৳ ২৩,০০০ (২৫%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-orange-500/80 rounded-full" style={{ width: '25%' }} />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                        <span>ক্যাশ পেমেন্ট</span>
                        <span className="font-bold text-white">৳ ১১,২০০ (১২%)</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-slate-600 rounded-full" style={{ width: '12%' }} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>অটো রসিদ তৈরি</span>
                      <span className="text-orange-400 font-bold">১০০% ভেরিফাইড</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge Left */}
              <div className="hidden sm:flex absolute -top-4 -left-4 items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl text-xs font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                বায়োমেট্রিক টার্নস্টাইল সিঙ্কড
              </div>

              {/* Floating Badge Right */}
              <div className="hidden sm:flex absolute -bottom-4 -right-4 items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl text-xs font-bold text-white">
                <Activity className="w-4 h-4 text-orange-400" />
                সরাসরি উপস্থিতি ট্র্যাকিং
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Section 2 — Problem / Solution */}
      <section id="solution" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/40">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
              সমস্যা ও সমাধান
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              জিম পরিচালনায় প্রতিদিনের ঝামেলা কমান
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              ম্যানুয়াল খাতা-কলমের হিসাবের দিন শেষ। একটি আধুনিক প্ল্যাটফর্মে পুরো জিম অপারেশন নিয়ে আসুন।
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left: The Problems */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 border border-slate-800 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-400 flex items-center justify-center">
                  <X className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">সাধারণ জিমের প্রতিদিনের সমস্যা</h3>
                  <p className="text-xs text-slate-400">ম্যানুয়াল সিস্টেমে সময় ও রাজস্বের অপচয়</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                {[
                  'খাতায় মেম্বারদের তথ্য ও ফি ট্র্যাক করার জটিলতা',
                  'ম্যানুয়ালি উপস্থিতি হিসাব রাখা ও কার্ড হারানোর ঝামেলা',
                  'ট্রেইনারদের শিডিউল ও ক্লায়েন্ট ট্র্যাকিং কঠিন হওয়া',
                  'পেমেন্ট বকেয়া ও ক্যাশ টাকার সঠিক হিসাব গুলিয়ে ফেলা',
                  'মেম্বারদের ক্লাস বা ট্রেইনার সেশন বুকিংয়ে বিশৃঙ্খলা',
                  'দিন শেষে ম্যানুয়াল রিপোর্ট তৈরিতে ঘণ্টার পর ঘণ্টা সময় অপচয়',
                ].map((problem, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-sm text-slate-300">
                    <X className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>{problem}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: The Solution */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-orange-500/40 space-y-6 relative overflow-hidden shadow-xl shadow-orange-600/5">
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/20">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">একটি প্ল্যাটফর্মেই সবকিছু</h3>
                  <p className="text-xs text-orange-400 font-semibold">FitnessPro ক্লাউড সমাধান</p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2 relative z-10">
                {[
                  'ক্লাউড ডাটাবেসে নির্ভুল মেম্বার প্রোফাইল ও সাবস্ক্রিপশন',
                  'ZKTeco বায়োমেট্রিক ও QR কোডে স্বয়ংক্রিয় টার্নস্টাইল চেক-ইন',
                  'ট্রেইনারদের ডিজিটাল পোর্টাল, ডায়েট ও ওয়ার্কআউট প্ল্যানার',
                  'bKash, Nagad ও ব্যাংকে অটোমেটিক পেমেন্ট হিস্ট্রি ও রসিদ',
                  'ওয়ান-ক্লিক ক্লাস বুকিং ও ট্রেইনার শিডিউলিং সিস্টেম',
                  'ইনস্ট্যান্ট রিয়েল-টাইম রেভিনিউ, মেম্বার গ্রোথ ও বিজনেস রিপোর্ট',
                ].map((solution, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/80 border border-orange-500/20 text-sm text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{solution}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Section 3 — Complete Features */}
      <section id="features" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
              সম্পূর্ণ ফিচার ওভারভিউ
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              জিম পরিচালনার প্রতিটি প্রয়োজনের পরিপূর্ণ সমাধান
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              সিস্টেমটিতে রয়েছে জিম মালিক, ট্রেইনার ও সদস্যদের জন্য বিশেষভাবে ডিজাইন করা শক্তিশালী মডিউলসমূহ।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Gym Management */}
            <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Gym Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                জিমের দৈনন্দিন সব কার্যক্রম, সদস্য তালিকা ও শিডিউল এক নজরে ম্যানেজ করুন।
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Member Management & Profiles</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Trainer Management & Roaster</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Membership Packages & Expiry</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Class Scheduling & Bookings</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Equipment & Facility Tracking</li>
              </ul>
            </div>

            {/* 2. Financial Management */}
            <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Financial Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                লোকাল পেমেন্ট গেটওয়ে এবং স্বচ্ছ রাজস্ব অডিট ট্রেইল দিয়ে আয়-ব্যয় নিয়ন্ত্রণে রাখুন।
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> bKash, Nagad ও Bank Transfer</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Automatic Revenue Tracking</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Trainer Payouts & Commission</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Invoice & Subscription Verification</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Real-time Audit Trail</li>
              </ul>
            </div>

            {/* 3. Fitness Management */}
            <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Fitness Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                সদস্যদের ফিটনেস লক্ষ্য পূরণ করতে ট্রেইনারদের তৈরি ডায়েট ও ওয়ার্কআউট প্ল্যান।
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> কাস্টমাইজড Diet Plans</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Workout Progress Logging</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Fitness Goals & Milestones</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Trainer Reviews & Ratings</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Body Metrics Tracking</li>
              </ul>
            </div>

            {/* 4. Communication */}
            <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <BellRing className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Communication</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                জিম ওনার, ট্রেইনার ও সদস্যদের মধ্যে সার্বক্ষণিক সংযোগ ও তাৎক্ষণিক নোটিফিকেশন।
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Real-time In-App Chat</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> System Bell Notifications</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Gym Announcements & Broadcast</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Dedicated Member Support</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Package Renewal Alerts</li>
              </ul>
            </div>

            {/* 5. Automation */}
            <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Automation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                হার্ডওয়্যার গেট সিঙ্ক ও ব্যাকগ্রাউন্ড প্রসেসিংয়ের মাধ্যমে সম্পূর্ণ অটোমেশন।
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> QR Code Fast Check-In</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> ZKTeco Biometric Turnstile Sync</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Automated Gate Pass Control</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Background Expiry Processing</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Instant Push Triggers</li>
              </ul>
            </div>

            {/* 6. Audited Security */}
            <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Enterprise Security</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                সুপার অ্যাডমিন ভেরিফিকেশন, রোল-বেসড এক্সেস এবং সুরক্ষিত ডেটাবেস আর্কিটেকচার।
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 border-t border-slate-800">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Super Admin Gym Audit & Approval</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Role-Based Access Control (RBAC)</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Encrypted Credentials & Tokens</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Dispute Resolution & Arbitration</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-orange-400" /> Daily Cloud Backups</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section 4 — For Business Owners */}
      <section id="owners" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                সুনির্দিষ্ট সুবিধা
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                জিম মালিকদের জন্য
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                একটি কেন্দ্রীয় ড্যাশবোর্ড থেকে আপনার জিমের প্রতিটি সদস্য, ট্রেইনার, টার্নস্টাইল গেট ও পেমেন্টের হিসাব নিখুঁতভাবে পরিচালনা করুন।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> পুরো জিম নিয়ন্ত্রণ
                  </h4>
                  <p className="text-xs text-slate-400">এক জায়গা থেকে সদস্য ও ট্রেইনারদের কার্যক্রম পর্যবেক্ষণ</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> স্বয়ংক্রিয় গেট পাস
                  </h4>
                  <p className="text-xs text-slate-400">বায়োমেট্রিক ও টার্নস্টাইল সিঙ্কে আনঅথরাইজড এন্ট্রি বন্ধ</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> স্বচ্ছ আয় ও পে-আউট
                  </h4>
                  <p className="text-xs text-slate-400">দৈনিক রাজস্ব হিসাব ও ট্রেইনারদের কমিশন বণ্টন</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> ব্যবসায়িক অ্যানালিটিক্স
                  </h4>
                  <p className="text-xs text-slate-400">মেম্বার রিটেনশন, পিক আওয়ার ও মাসিক বৃদ্ধির গ্রাফ</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={user?.role === 'BUSINESS_OWNER' ? '/owner/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/25 transition-all"
                >
                  {user?.role === 'BUSINESS_OWNER' ? 'ওনার ড্যাশবোর্ডে যান' : 'আপনার জিম নিবন্ধন করুন'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Box for Owners */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-500" /> ওনার কমান্ড সেন্টার
                </span>
                <span className="text-[11px] text-orange-400 font-semibold bg-orange-600/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  রিয়েল-টাইম সিঙ্ক
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">সদস্য সাবস্ক্রিপশন স্ট্যাটাস</p>
                    <p className="text-[11px] text-slate-400">১,১৮০ অ্যাক্টিভ • ৬৮ রিনিউয়াল পেন্ডিং</p>
                  </div>
                  <span className="text-xs font-bold text-orange-400 bg-orange-600/10 px-2 py-1 rounded">
                    ৯৪.৫% অ্যাক্টিভ
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">টার্নস্টাইল গেট টেলিমেট্রি</p>
                    <p className="text-[11px] text-slate-400">ডিভাইস ZKTeco Pro 01 • অনলাইন</p>
                  </div>
                  <span className="text-xs font-bold text-orange-400">সংযুক্ত</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">ট্রেইনার কমিশন পে-আউট</p>
                    <p className="text-[11px] text-slate-400">এই মাসে পরিশোধিত: ৳ ১,৪৫,০০০</p>
                  </div>
                  <span className="text-xs font-bold text-slate-300">অডিট কমপ্লিট</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Section 5 — For Trainers */}
      <section id="trainers" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Box for Trainers */}
            <div className="lg:col-span-6 order-2 lg:order-1 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-orange-500" /> ট্রেইনার পোর্টাল প্রিভিউ
                </span>
                <span className="text-[11px] text-orange-400 font-semibold bg-orange-600/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  অডিটেড সার্টিফিকেট
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">অ্যাসাইন করা ক্লায়েন্ট মেম্বার</span>
                    <span className="text-xs font-bold text-orange-400">২৪ জন সক্রিয়</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">ডায়েট চার্ট ডেলিভারি</p>
                    <p className="text-[11px] text-slate-400">কাস্টম ক্যালোরি ও নিউট্রিশন প্ল্যানিং</p>
                  </div>
                  <span className="text-xs font-bold text-orange-400">আপ টু ডেট</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">সাপ্তাহিক কমিশন পে-আউট</p>
                    <p className="text-[11px] text-slate-400">স্বচ্ছ হিস্ট্রি ও ব্যালেন্স ট্রান্সফার</p>
                  </div>
                  <span className="text-xs font-bold text-slate-200">৳ ২৮,৫০০</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                কোচ ও ট্রেইনারদের জন্য
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                ট্রেইনারদের জন্য
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                সার্টিফাইড ফিটনেস কোচদের জন্য সম্পূর্ণ পেশাদার ক্যারিয়ার প্ল্যাটফর্ম। মেম্বারদের ডায়েট তৈরি করুন, অগ্রগতি মাপুন এবং স্বচ্ছভাবে পে-আউট গ্রহণ করুন।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> অডিটেড প্রোফাইল
                  </h4>
                  <p className="text-xs text-slate-400">সার্টিফিকেশন ভেরিফিকেশন ব্যাজ ও নির্ভরযোগ্যতা</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> ডায়েট ও ওয়ার্কআউট প্ল্যান
                  </h4>
                  <p className="text-xs text-slate-400">মেম্বারদের জন্য সরাসরি পুষ্টি চার্ট অ্যাসাইন</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> জিম জবের সুযোগ
                  </h4>
                  <p className="text-xs text-slate-400">পার্টনার জিমগুলোতে সরাসরি আবেদন ও কাজ শুরু</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> কমিশন ও পে-আউট ট্র্যাকিং
                  </h4>
                  <p className="text-xs text-slate-400">স্বচ্ছ পে-আউট হিস্ট্রি ও ডিরেক্ট ক্যাশআউট</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={user?.role === 'TRAINER' ? '/trainer/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/25 transition-all"
                >
                  {user?.role === 'TRAINER' ? 'ট্রেইনার ড্যাশবোর্ডে যান' : 'কোচ হিসেবে যুক্ত হোন'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Section 6 — For Members */}
      <section id="members" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5" />
                সদস্যদের ফিটনেস জার্নি
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                জিম মেম্বারদের জন্য
              </h2>
              <p className="text-base text-slate-300 leading-relaxed">
                জিম খোঁজা, মেম্বারশিপ নেওয়া, ইনস্ট্যান্ট QR চেক-ইন এবং ট্রেইনারের কাছ থেকে পার্সোনালাইজড ডায়েট চার্ট পাওয়ার সবকিছুই এখন আপনার ফোনে।
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> জিম ডিসকভারি
                  </h4>
                  <p className="text-xs text-slate-400">ভেরিফাইড ও প্রত্যয়িত জিম ক্লাব খুঁজে বের করুন</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> দ্রুত QR চেক-ইন
                  </h4>
                  <p className="text-xs text-slate-400">লাইনে না দাঁড়িয়ে ১ সেকেন্ডে টার্নস্টাইল এন্ট্রি</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> ডায়েট ও ওয়ার্কআউট প্ল্যান
                  </h4>
                  <p className="text-xs text-slate-400">ট্রেইনার কর্তৃক নির্ধারিত পুষ্টি তালিকা ও প্রগ্রেস লগ</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-500" /> ক্লাস ও সেশন বুকিং
                  </h4>
                  <p className="text-xs text-slate-400">পছন্দের স্লটে সহজে ক্লাস বুকিং ও রিভিউ প্রদান</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href={user?.role === 'MEMBER' ? '/member/dashboard' : '/register'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/25 transition-all"
                >
                  {user?.role === 'MEMBER' ? 'মেম্বার ড্যাশবোর্ডে যান' : 'মেম্বার হিসেবে জয়েন করুন'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Box for Members */}
            <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-orange-500" /> মেম্বার মোবাইল পোর্টাল প্রিভিউ
                </span>
                <span className="text-[11px] text-orange-400 font-semibold bg-orange-600/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
                  ডিজিটাল পাস সক্রিয়
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">আমার ডিজিটাল গেট QR কোড</p>
                      <p className="text-[10px] text-slate-400">টার্নস্টাইল বা মোবাইল স্ক্যানারে দেখান</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-400 bg-orange-600/10 px-2 py-1 rounded">
                    ট্যাপ টু ভিউ
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">দৈনিক ডায়েট ক্যালোরি টার্গেট</p>
                    <p className="text-[11px] text-slate-400">ট্রেইনার কর্তৃক নির্ধারিত: ২,২৫০ kcal</p>
                  </div>
                  <span className="text-xs font-bold text-orange-400">৮২% কমপ্লিট</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">পরবর্তী ক্লাস শিডিউল</p>
                    <p className="text-[11px] text-slate-400">HIIT কার্ডিও সেশন • আগামীকাল সকাল ৮:০০</p>
                  </div>
                  <span className="text-xs font-bold text-slate-200">বুকড</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Section 7 — How It Works */}
      <section id="how-it-works" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
              সহজ প্রক্রিয়া
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              কীভাবে কাজ করে
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              মাত্র ৫টি সহজ ধাপে আপনার জিমকে সম্পূর্ণ ক্লাউড অপারেটিং সিস্টেমে রূপান্তর করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              {
                step: '০১',
                title: 'অ্যাকাউন্ট তৈরি করুন',
                desc: 'ইমেইল ও পাসওয়ার্ড দিয়ে আপনার ওনার বা মেম্বার অ্যাকাউন্ট খুলুন।',
              },
              {
                step: '০২',
                title: 'আপনার জিম সেটআপ করুন',
                desc: 'জিমের নাম, লোকেশন, প্যাকেজ ও টার্নস্টাইল ডিটেইলস কনফিগার করুন।',
              },
              {
                step: '০৩',
                title: 'Subscription নির্বাচন করুন',
                desc: 'আপনার জিমের মেম্বার সংখ্যা ও ফিচার অনুযায়ী উপযুক্ত প্ল্যান বেছে নিন।',
              },
              {
                step: '০৪',
                title: 'Payment সম্পন্ন করুন',
                desc: 'bKash, Nagad বা ব্যাংক ট্রান্সফারের মাধ্যমে নিরাপদ পেমেন্ট করুন।',
              },
              {
                step: '০৫',
                title: 'জিম পরিচালনা শুরু করুন',
                desc: 'অ্যাডমিন ভেরিফিকেশনের পর সরাসরি সব ফিচার ব্যবহার শুরু করুন।',
              },
            ].map((st, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-orange-500/40 transition-all space-y-3 relative group"
              >
                <div className="text-3xl font-black text-orange-500/40 group-hover:text-orange-500 transition-colors">
                  {st.step}
                </div>
                <h4 className="text-base font-bold text-white pt-1">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Section 8 — Smart Attendance */}
      <section id="attendance" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider">
              <Fingerprint className="w-3.5 h-3.5" />
              হার্ডওয়্যার ও ক্লাউড সিঙ্ক
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              স্মার্ট অ্যাটেনডেন্স সিস্টেম
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              সদস্য প্রবেশ দ্বারে ZKTeco বায়োমেট্রিক ডিভাইস ও QR কোডের সরাসরি ইন্টিগ্রেশন।
            </p>
          </div>

          {/* Visual Flow: Member -> Attendance -> System -> Gym Dashboard -> Reports */}
          <div className="p-8 sm:p-10 rounded-3xl bg-slate-950 border border-slate-800 space-y-8">
            <h4 className="text-center text-xs font-bold uppercase tracking-widest text-orange-400">
              অটোমেটেড অ্যাটেনডেন্স ওয়ার্কফ্লো
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center text-center">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <Users className="w-6 h-6 text-orange-500 mx-auto" />
                <h5 className="text-sm font-bold text-white">Member</h5>
                <p className="text-[11px] text-slate-400">জিম এন্ট্রি গেটে উপস্থিতি</p>
              </div>

              <div className="hidden md:flex justify-center text-orange-500">
                <ChevronRight className="w-6 h-6" />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-orange-500/30 space-y-2">
                <Fingerprint className="w-6 h-6 text-orange-500 mx-auto" />
                <h5 className="text-sm font-bold text-white">Attendance Gate</h5>
                <p className="text-[11px] text-orange-400">QR বা ZKTeco ফিঙ্গারপ্রিন্ট</p>
              </div>

              <div className="hidden md:flex justify-center text-orange-500">
                <ChevronRight className="w-6 h-6" />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <BarChart3 className="w-6 h-6 text-orange-500 mx-auto" />
                <h5 className="text-sm font-bold text-white">Reports & Telemetry</h5>
                <p className="text-[11px] text-slate-400">ড্যাশবোর্ডে ইনস্ট্যান্ট এন্ট্রি লগ</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
              <div className="space-y-2">
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" /> ZKTeco টার্নস্টাইল ইন্টিগ্রেশন
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  মেম্বারশিপ ভ্যালিড থাকলে অটোমেটিক গেট ওপেন হয়, মেয়াদোত্তীর্ণ মেম্বারের ক্ষেত্রে এন্ট্রি ব্লক করে।
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" /> ইনস্ট্যান্ট কিউআর কোড স্ক্যান
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  মোবাইল স্ক্রিনে ডায়নামিক QR কোড স্ক্যান করে দ্রুত উপস্থিতি গ্রহণ ও জিম ট্রাফিক পর্যবেক্ষণ।
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-500" /> এক্সপোর্টযোগ্য অ্যাটেনডেন্স রিপোর্ট
                </h5>
                <p className="text-xs text-slate-400 leading-relaxed">
                  দৈনিক ও মাসিক উপস্থিতি হিস্ট্রি এক্সেল বা পিডিএফ ফরম্যাটে ডাউনলোড ও অডিট করার সুবিধা।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Section 9 — Reports & Business Insights */}
      <section id="reports" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
              অ্যানালিটিক্স ও রিপোর্ট
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              বিজনেস রিপোর্ট ও অ্যানালিটিক্স
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              সঠিক তথ্যের ভিত্তিতে সিদ্ধান্ত নিন। আপনার জিমের প্রবৃদ্ধি ও আয়ের পরিষ্কার চিত্র সবসময় হাতের মুঠোয়।
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">মেম্বার গ্রোথ অ্যানালিটিক্স</span>
                <span className="text-xs font-bold text-orange-400">+২৪% এই মাসে</span>
              </div>
              <p className="text-2xl font-black text-white">১,২৪৮ জন সদস্য</p>
              <div className="space-y-2 pt-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>নতুন ভর্তি</span>
                  <span className="text-white font-bold">১২০ জন</span>
                </div>
                <div className="flex justify-between">
                  <span>রিনিউয়াল সম্পন্ন</span>
                  <span className="text-white font-bold">৮৪০ জন</span>
                </div>
                <div className="flex justify-between">
                  <span>রিটেনশন রেট</span>
                  <span className="text-orange-400 font-bold">৯১.৫%</span>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">উপস্থিতি ট্রেন্ড ও পিক আওয়ার</span>
                <span className="text-xs font-bold text-orange-400">৯৪% এভারেজ</span>
              </div>
              <p className="text-2xl font-black text-white">৩১৮ জন দৈনিক</p>
              <div className="space-y-2 pt-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>মর্নিং পিক (৭ AM - ১০ AM)</span>
                  <span className="text-white font-bold">১২৫ জন</span>
                </div>
                <div className="flex justify-between">
                  <span>ইভনিং পিক (৫ PM - ৯ PM)</span>
                  <span className="text-white font-bold">১৫৩ জন</span>
                </div>
                <div className="flex justify-between">
                  <span>টার্নস্টাইল সফল পাঞ্চ</span>
                  <span className="text-orange-400 font-bold">৯৯.২%</span>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">রেভিনিউ ও ট্রেইনার পে-আউট</span>
                <span className="text-xs font-bold text-orange-400">৳ ৪,৮৫,০০০</span>
              </div>
              <p className="text-2xl font-black text-white">মোট মাসিক রাজস্ব</p>
              <div className="space-y-2 pt-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>মেম্বারশিপ প্যাকেজ ফি</span>
                  <span className="text-white font-bold">৳ ৪,১০,০০০</span>
                </div>
                <div className="flex justify-between">
                  <span>পার্সোনাল ট্রেইনিং সেশন</span>
                  <span className="text-white font-bold">৳ ৭৫,০০০</span>
                </div>
                <div className="flex justify-between">
                  <span>ট্রেইনার পে-আউট ব্যালেন্স</span>
                  <span className="text-orange-400 font-bold">৳ ১,৪৫,০০০</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 12. Section 10 — Subscription */}
      <section id="subscription" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
              SaaS সাবস্ক্রিপশন প্ল্যান
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              সহজ ও স্বচ্ছ সাবস্ক্রিপশন প্যাকেজ
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              আপনার জিমের মেম্বার সাইজ এবং প্রয়োজন অনুযায়ী উপযুক্ত প্ল্যানটি নির্বাচন করুন।
            </p>

            {/* All / Monthly / Yearly Toggle */}
            <div className="pt-4 flex items-center justify-center gap-2 sm:gap-3">
              <button
                onClick={() => setPricingCycle('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pricingCycle === 'all'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                সকল প্ল্যান ({plans.length})
              </button>
              <button
                onClick={() => setPricingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  pricingCycle === 'monthly'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                মাসিক বিলিং
              </button>
              <button
                onClick={() => setPricingCycle('yearly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  pricingCycle === 'yearly'
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                বার্ষিক বিলিং <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-black">ডিসকাউন্ট</span>
              </button>
            </div>
          </div>

          {/* Subscription Workflow Flowchart */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">১</span> Plan নির্বাচন করুন</span>
            <span className="text-orange-500">→</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">২</span> Monthly / Yearly মুড</span>
            <span className="text-orange-500">→</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">৩</span> bKash/Nagad/Bank Payment</span>
            <span className="text-orange-500">→</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">৪</span> Admin Verification</span>
            <span className="text-orange-500">→</span>
            <span className="flex items-center gap-1.5"><span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">৫</span> Gym Management শুরু</span>
          </div>

          {/* Live Subscription Plans from Super Admin */}
          {isLoadingPlans ? (
            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
              {[1, 2].map((sk) => (
                <div key={sk} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 animate-pulse space-y-4">
                  <div className="h-4 bg-slate-800 rounded w-1/3" />
                  <div className="h-8 bg-slate-800 rounded w-2/3" />
                  <div className="h-10 bg-slate-800 rounded w-1/2" />
                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <div className="h-3 bg-slate-800 rounded" />
                    <div className="h-3 bg-slate-800 rounded w-5/6" />
                    <div className="h-3 bg-slate-800 rounded w-4/6" />
                  </div>
                  <div className="h-10 bg-slate-800 rounded mt-6" />
                </div>
              ))}
            </div>
          ) : displayPlans.length === 0 ? (
            <div className="p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3 max-w-xl mx-auto">
              <p className="text-base font-bold text-white">বর্তমানে এই ক্যাটাগরিতে কোনো সক্রিয় সাবস্ক্রিপশন প্ল্যান নেই</p>
              <p className="text-xs text-slate-400">সুপার অ্যাডমিন কর্তৃক তৈরি নতুন প্ল্যান দেখতে অন্য বিলিং অপশন নির্বাচন করুন।</p>
              <button
                onClick={() => setPricingCycle('all')}
                className="mt-2 px-4 py-2 rounded-xl bg-orange-600 text-xs font-bold text-white hover:bg-orange-500 transition-colors"
              >
                সকল সক্রিয় প্ল্যান দেখুন
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${displayPlans.length === 1 ? 'max-w-md mx-auto' : displayPlans.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' : 'md:grid-cols-3'} gap-8`}>
              {displayPlans.map((plan, idx) => {
                const isFeatured = plan.billingCycle === 'YEARLY' || (displayPlans.length > 1 && idx === 1);
                return (
                  <div
                    key={plan.id}
                    className={`p-8 rounded-3xl bg-slate-900 space-y-6 flex flex-col justify-between relative transition-all ${
                      isFeatured
                        ? 'border-2 border-orange-500 shadow-2xl shadow-orange-600/10'
                        : 'border border-slate-800 hover:border-orange-500/40'
                    }`}
                  >
                    {isFeatured && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-wider">
                        জনপ্রিয় পছন্দ
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                          {getBillingCycleLabel(plan.billingCycle)}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-mono">
                          {plan.durationDays} দিন মেয়াদ
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-white capitalize">{plan.name}</h3>
                      <p className="text-xs text-slate-400 min-h-[32px] leading-relaxed">
                        {plan.description || 'সম্পূর্ণ জিম অপারেশন ও মেম্বার ম্যানেজমেন্ট সুবিধা'}
                      </p>

                      <div className="pt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl sm:text-4xl font-black text-white">
                            ৳ {Number(plan.price).toLocaleString('en-US')}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            {getCycleSuffix(plan.billingCycle)}
                          </span>
                        </div>
                        <p className="text-[11px] text-orange-400 mt-1 font-semibold">
                          ভেরিফাইড SaaS লাইসেন্স
                        </p>
                      </div>

                      <ul className="space-y-2.5 text-xs text-slate-200 pt-4 border-t border-slate-800">
                        {plan.features && plan.features.length > 0 ? (
                          plan.features.map((feat, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                              <span className="leading-tight">{feat}</span>
                            </li>
                          ))
                        ) : (
                          <>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-orange-400" /> আনলিমিটেড মেম্বার ও অ্যাটেনডেন্স
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-orange-400" /> ZKTeco বায়োমেট্রিক টার্নস্টাইল সিঙ্ক
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-orange-400" /> ট্রেইনার পোর্টাল ও ডায়েট প্ল্যানার
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="pt-4">
                      <Link
                        href={getPlanCtaLink()}
                        className={`w-full py-3.5 rounded-xl font-bold text-xs text-center transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          isFeatured
                            ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/30'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        {user?.role === 'BUSINESS_OWNER'
                          ? 'সাবস্ক্রাইব করুন'
                          : user
                          ? 'ড্যাশবোর্ডে যান'
                          : 'প্ল্যান নির্বাচন করুন'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Custom plan footer note */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              আপনার জিমের একাধিক শাখা বা বিশেষ হার্ডওয়্যার ইন্টিগ্রেশন প্রয়োজন?{' '}
              <Link href="/contact" className="text-orange-400 hover:underline font-bold inline-flex items-center gap-1">
                আমাদের সাথে কথা বলুন <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* 13. Section 11 — Demo Section */}
      <section id="demo" className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto space-y-10 text-center">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
              ভিডিও ওয়াকথ্রু
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              সফটওয়্যারটি কীভাবে কাজ করে তা দেখুন
            </h2>
            <p className="text-base text-slate-300 leading-relaxed">
              সিস্টেমের মেম্বার অনবোর্ডিং, বায়োমেট্রিক গেট এন্ট্রি ও বিলিং প্রক্রিয়া স্বচক্ষে প্রত্যক্ষ করুন।
            </p>
          </div>

          {/* Interactive Demo Video Placeholder Card */}
          <Link
            href="/demo"
            className="group block relative rounded-3xl bg-slate-900 border border-slate-800 hover:border-orange-500/50 overflow-hidden shadow-2xl transition-all"
          >
            <div className="aspect-video w-full flex flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
              <div className="absolute inset-0 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

              <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-2xl shadow-orange-600/40 group-hover:scale-110 transition-transform duration-200">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
              </div>

              <div className="relative z-10 mt-6 space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-orange-400 transition-colors">
                  ▶ সম্পূর্ণ ডেমো ভিডিও দেখুন
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  ক্লিক করে ডেমো পেজে প্রবেশ করুন এবং মূল ফিচারগুলোর বিস্তারিত দেখুন
                </p>
              </div>

              <div className="absolute bottom-4 right-4 text-[11px] text-slate-400 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-500" /> ১০ মিনিট ওয়াকথ্রু
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 14. Section 12 — Contact CTA */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="p-10 sm:p-16 rounded-3xl bg-slate-900 border border-orange-500/40 text-center space-y-8 relative overflow-hidden shadow-2xl shadow-orange-600/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">
              যোগাযোগ ও সহায়তা
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              আপনার জিমকে আরও স্মার্টভাবে পরিচালনা করতে প্রস্তুত?
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              আজই আমাদের সাথে যোগাযোগ করুন এবং আধুনিক প্রযুক্তির সাহায্যে আপনার জিম অপারেশনকে গতিশীল করুন।
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-orange-600 hover:bg-orange-500 active:scale-95 text-white shadow-xl shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
              >
                যোগাযোগ করুন <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href={user ? getDashboardUrl() : '/register'}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-slate-950 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                {user ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'ফ্রি অ্যাকাউন্ট খুলুন'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 15. Footer */}
      <LandingFooter />
    </div>
  );
}
