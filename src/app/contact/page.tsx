'use client';

import { useState, type FormEvent } from 'react';
import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { LandingFooter } from '@/components/layout/LandingFooter';
import { Mail, Phone, MapPin, Send, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <LandingNavbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-600/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-wider uppercase">
            <MessageSquare className="w-3.5 h-3.5" />
            সরাসরি যোগাযোগ
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            আপনার জিমকে আরও স্মার্টভাবে পরিচালনা করতে প্রস্তুত?
          </h1>
          <p className="text-base text-slate-300 leading-relaxed">
            আজই আমাদের সাথে যোগাযোগ করুন। আপনার জিমের চাহিদা অনুযায়ী অনবোর্ডিং, হার্ডওয়্যার সেটাপ ও সফটওয়্যার ডেমোর সহায়তা নিন।
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              <h3 className="text-xl font-bold text-white">যোগাযোগের ঠিকানা</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                FitnessPro টিম সবসময় আপনার পাশে আছে। জিম সেটআপ, ZKTeco টার্নস্টাইল সিঙ্ক বা যেকোনো টেকনিক্যাল জিজ্ঞাসায় নক দিন।
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase">ফোন / হোয়াটসঅ্যাপ</h5>
                    <p className="text-sm font-semibold text-white mt-0.5">+880 1700-000000</p>
                    <p className="text-xs text-slate-500">শনিবার - বৃহস্পতিবার (সকাল ৯টা - রাত ৮টা)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase">ইমেইল সাপোর্ট</h5>
                    <p className="text-sm font-semibold text-white mt-0.5">support@fitnesspro.com.bd</p>
                    <p className="text-xs text-slate-500">আমরা ২৪ ঘণ্টার মধ্যে রিপ্লাই প্রদান করি</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase">অফিস ঠিকানা</h5>
                    <p className="text-sm font-semibold text-white mt-0.5">বনানী, ঢাকা ১২১৩, বাংলাদেশ</p>
                    <p className="text-xs text-slate-500">ভিজিট করার জন্য অ্যাপয়েন্টমেন্ট শিডিউল করুন</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase">সার্ভার ও ক্লাউড স্ট্যাটাস</h5>
                    <p className="text-sm font-semibold text-white mt-0.5">৯৯.৯% আপটাইম গ্যারান্টি</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-orange-600/20 border border-orange-500/40 text-orange-400 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">ধন্যবাদ! বার্তাটি সফলভাবে পাঠানো হয়েছে।</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    আমাদের প্রতিনিধি দ্রুততম সময়ে আপনার সাথে যোগাযোগ করবেন।
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    আরেকটি বার্তা পাঠান
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">বার্তা পাঠান</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      নিচের ফর্মটি পূরণ করুন, আমাদের সেলস ও সাপোর্ট টিম দ্রুত সহায়তা প্রদান করবে।
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        আপনার নাম <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="নাম লিখুন"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        জিমের নাম <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="আপনার জিমের নাম"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        মোবাইল নম্বর <span className="text-orange-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="০১৭xxxxxxxx"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">ইমেইল ঠিকানা</label>
                      <input
                        type="email"
                        placeholder="email@domain.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      আপনার জিজ্ঞাসা বা চাহিদা <span className="text-orange-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="আপনি কতজন মেম্বারের জিম পরিচালনা করছেন অথবা বায়োমেট্রিক ইন্টিগ্রেশন প্রয়োজন কি না বিস্তারিত লিখুন..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-white placeholder-slate-500 outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    যোগাযোগ করুন
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
