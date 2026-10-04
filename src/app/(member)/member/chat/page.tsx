'use client';

import React from 'react';
import { MessageSquare, Clock } from 'lucide-react';
import Link from 'next/link';

/* =========================================================================
   NOTE: Member Chat System is temporarily commented out as requested.
   Will be implemented and enabled later.
   =========================================================================

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/useAuth';
import { ChatWindow } from '@/components/ui/ChatWindow';
import { MessageSquare, Shield, Dumbbell } from 'lucide-react';

export function ActiveMemberChatPage() {
  const { user } = useAuth();
  const [selectedThread, setSelectedThread] = useState<{
    id: string;
    recipientName: string;
    role: string;
  }>({
    id: 'support-thread-default',
    recipientName: 'Gym Facility Support',
    role: 'Administration',
  });

  const threads = [
    {
      id: 'support-thread-default',
      name: 'Gym Facility Support',
      role: 'Administration',
      icon: <Shield className="w-4 h-4 text-blue-500" />,
      lastMessage: 'How can we help you today with your membership?',
    },
    {
      id: 'trainer-thread-default',
      name: 'Coach Marcus',
      role: 'Personal Trainer',
      icon: <Dumbbell className="w-4 h-4 text-orange-500" />,
      lastMessage: 'Remember to complete your stretch routine today!',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Messages & Support
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Chat directly with your assigned personal coach or gym front desk
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 p-4 space-y-2 h-[580px] overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-2">
            Conversations
          </h3>

          <div className="space-y-1">
            {threads.map((t) => {
              const isSelected = selectedThread.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() =>
                    setSelectedThread({
                      id: t.id,
                      recipientName: t.name,
                      role: t.role,
                    })
                  }
                  className={`p-3.5 rounded-2xl transition-colors cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                      {t.icon}
                      <span>{t.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{t.role}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate pl-6">
                    {t.lastMessage}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2">
          <ChatWindow
            threadId={selectedThread.id}
            recipientName={selectedThread.recipientName}
            recipientRole={selectedThread.role}
            currentUserId={user?.id || 'member-me'}
          />
        </div>
      </div>
    </div>
  );
}
========================================================================= */

export default function MemberChatPage() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center space-y-6">
      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
        <MessageSquare className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-orange-500" />
          Feature Coming Soon
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Chat System Is Temporarily Paused
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          মেম্বার চ্যাট সিস্টেমটি বর্তমানে সাময়িকভাবে বন্ধ রাখা হয়েছে। এটি খুব শীঘ্রই চালু করা হবে।
        </p>
      </div>
      <div>
        <Link
          href="/member/dashboard"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-md shadow-orange-500/20"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

