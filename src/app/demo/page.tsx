'use client';

import Link from 'next/link';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { Play, CheckCircle2, ArrowRight, MonitorPlay } from 'lucide-react';
import { useAuth } from '@/lib/auth/useAuth';

export default function DemoPage() {
  const { user } = useAuth();

  const chapters = [
    { time: '০১', title: 'ভূমিকা ও প্ল্যাটফর্ম ওভারভিউ', desc: 'জিম ওনার, ট্রেইনার ও মেম্বার পোর্টালের পরিচিতি' },
    { time: '০২', title: 'মেম্বারশিপ ও ক্লাস শিডিউলিং', desc: 'নতুন মেম্বার অ্যাড, প্যাকেজ নির্বাচন ও স্লট বুকিং' },
    { time: '০৩', title: 'স্মার্ট অ্যাটেনডেন্স (QR ও ZKTeco)', desc: 'বায়োমেট্রিক ও কিউআর স্ক্যানে গেট টার্নস্টাইল এক্সেস' },
    { time: '০৪', title: 'পেমেন্ট ও ট্রেইনার পে-আউট', desc: 'bKash, Nagad ও ব্যাংকে অটো রসিদ ও কমিশন বণ্টন' },
    { time: '০৫', title: 'রিপোর্ট ও অ্যানালিটিক্স', desc: 'দৈনিক উপস্থিতি ও রেভিনিউ টেলিমেট্রি পর্যবেক্ষণ' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-wider uppercase">
            <MonitorPlay className="w-3.5 h-3.5" />
            সরাসরি ডেমো প্রেজেন্টেশন
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            সফটওয়্যারটি কীভাবে কাজ করে তা দেখুন
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            এক নজরে দেখে নিন কীভাবে FitnessPro আপনার জিম ম্যানেজমেন্ট, সদস্য ট্র্যাকিং এবং ফিটনেস লক্ষ্য অর্জনে সহায়তা করে।
          </p>
        </div>

        {/* Video Player Placeholder */}
        <div className="relative rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl group">
          <div className="aspect-video w-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900">
            {/* Ambient Background Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />

            {/* Large Play Button */}
            <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-2xl shadow-orange-600/40 group-hover:scale-110 transition-transform duration-200">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
            </div>

            <div className="relative z-10 mt-6 space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Demo Video
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md">
                সফটওয়্যারটির সম্পূর্ণ ওয়াকথ্রু ভিডিও শীঘ্রই এখানে লাইভ হবে।
              </p>
            </div>

            <div className="absolute bottom-4 right-4 text-[11px] text-slate-500 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
              HD Walkthrough • ১০ মিনিট
            </div>
          </div>
        </div>

        {/* Video Chapters / Key Highlights */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              ডেমো ভিডিওতে যা যা দেখতে পাবেন
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              সিস্টেমটির প্রধান মডিউল এবং কার্যপদ্ধতি
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chapters.map((ch, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-orange-500/30 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-400 bg-orange-600/10 px-2 py-0.5 rounded-md border border-orange-500/20">
                    ধাপ {ch.time}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-orange-500" />
                </div>
                <h4 className="font-bold text-sm text-white pt-1">{ch.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{ch.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <h3 className="text-2xl font-black text-white">
            ভিডিওর বাইরে নিজে ব্যবহার করে দেখতে চান?
          </h3>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            কোনো ধরনের ঝামেলা ছাড়াই সরাসরি আপনার জিম রেজিস্টার করুন এবং সিস্টেমের ফিচারগুলো এক্সপ্লোর করুন।
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={user ? '/owner/dashboard' : '/register'}
              className="px-6 py-3 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/25 transition-all flex items-center gap-2"
            >
              {user ? 'ড্যাশবোর্ডে প্রবেশ করুন' : 'ফ্রি অ্যাকাউন্ট তৈরি করুন'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl font-bold text-sm border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white transition-colors"
            >
              আমাদের সাথে যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
