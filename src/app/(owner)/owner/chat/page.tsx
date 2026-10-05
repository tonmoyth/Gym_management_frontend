'use strict';
'use client';

// NOTE: Member Support & Communications page is temporarily commented out for future implementation.
/*
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { ChatWindow } from '@/components/ui/ChatWindow';

export default function OwnerChatPage() {
  const { data: businessRes } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Member Support & Communications</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Direct messaging channel with enrolled gym members, trainers, and platform support.
        </p>
      </div>

      <div className="max-w-3xl">
        <ChatWindow
          title={`${business?.name || 'Gym'} Member Desk`}
          placeholder="Type a response to member inquiries..."
        />
      </div>
    </div>
  );
}
*/

import { Clock } from 'lucide-react';

export default function OwnerChatPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Member Support & Communications
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Direct messaging channel with enrolled gym members, trainers, and platform support.
        </p>
      </div>

      <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Clock className="w-7 h-7 animate-pulse" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          Feature Coming Soon
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          The member chat and direct support desk is currently under development and will be activated in an upcoming update.
        </p>
      </div>
    </div>
  );
}
