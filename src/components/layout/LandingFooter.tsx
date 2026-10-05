'use client';

import Link from 'next/link';
import { Dumbbell, ArrowUpRight } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/30">
                <Dumbbell className="w-5 h-5" />
              </div>
              <span className="font-black text-xl tracking-tight text-white">
                FITNESS<span className="text-orange-500">PRO</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              বাংলাদেশের আধুনিক জিম ম্যানেজমেন্ট ও ফিটনেস নেটওয়ার্ক প্ল্যাটফর্ম। জিম ওনার, ট্রেইনার ও মেম্বারদের সব কার্যক্রম এক ছাতার নিচে।
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-orange-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              ২৪/৭ অ্যাক্টিভ ক্লাউড সার্ভিস ও লোকাল সাপোর্ট
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              প্রোডাক্ট
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/#features" className="hover:text-orange-400 transition-colors">
                  ফিচারসমূহ
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-orange-400 transition-colors flex items-center gap-1">
                  ডেমো ভিডিও <ArrowUpRight className="w-3 h-3 text-orange-500" />
                </Link>
              </li>
              <li>
                <Link href="/#attendance" className="hover:text-orange-400 transition-colors">
                  স্মার্ট অ্যাটেনডেন্স
                </Link>
              </li>
              <li>
                <Link href="/#subscription" className="hover:text-orange-400 transition-colors">
                  সাবস্ক্রিপশন প্ল্যান
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              প্রতিষ্ঠান
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/#solution" className="hover:text-orange-400 transition-colors">
                  আমাদের লক্ষ্য
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-orange-400 transition-colors">
                  যোগাযোগ
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-orange-400 transition-colors">
                  কীভাবে কাজ করে
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Audience */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              ব্যবহারকারী
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/#owners" className="hover:text-orange-400 transition-colors">
                  জিম মালিকদের জন্য
                </Link>
              </li>
              <li>
                <Link href="/#trainers" className="hover:text-orange-400 transition-colors">
                  ট্রেইনারদের জন্য
                </Link>
              </li>
              <li>
                <Link href="/#members" className="hover:text-orange-400 transition-colors">
                  জিম মেম্বারদের জন্য
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-orange-400 transition-colors">
                  হেল্প ও সাপোর্ট
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FitnessPro SaaS. সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-400">BDT পেমেন্ট গেটওয়ে সাপোর্টেড (bKash / Nagad / Bank)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
