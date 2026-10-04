'use strict';
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { trainerApi } from '@/lib/api/trainer.api';
import { ChatWindow } from '@/components/ui/ChatWindow';

export default function TrainerChatPage() {
  const { data: profileRes } = useQuery({
    queryKey: ['trainer-profile-me'],
    queryFn: () => trainerApi.getOwnProfile(),
  });

  const profile = profileRes?.data?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Direct Client Messages</h1>
        <p className="text-slate-400 mt-1 text-sm">
          Coordinate workout sessions, nutrition tips, and appointment times with your personal clients.
        </p>
      </div>

      <div className="max-w-3xl">
        <ChatWindow
          title={`Coach ${profile?.user?.fullName || 'Trainer'} Chat Desk`}
          placeholder="Message client regarding workouts or nutrition..."
        />
      </div>
    </div>
  );
}
