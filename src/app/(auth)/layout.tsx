import React from 'react';
import Link from 'next/link';
import { Dumbbell, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans relative overflow-hidden selection:bg-orange-600 selection:text-white">
      {/* Ambient background glow matching homepage */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(234,88,12,0.18),rgba(15,23,42,0))] pointer-events-none" />
      <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-orange-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10 space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform duration-200">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-black text-2xl tracking-tight text-white leading-none">
              FITNESS<span className="text-orange-500">PRO</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider">
              GYM SAAS PLATFORM
            </span>
          </div>
        </Link>
      </div>

      {/* Main Form Card Container */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl shadow-black/80 border border-slate-800 rounded-3xl">
          {children}
        </div>

        {/* Back to Home & Security Notice */}
        <div className="mt-6 text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> হোমপেজে ফিরে যান
          </Link>
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500" /> ১০০% নিরাপদ ও এনক্রিপ্টেড ক্লাউড কানেকশন
          </p>
        </div>
      </div>
    </div>
  );
}
