'use strict';
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { announcementApi, CreateAnnouncementInput } from '@/lib/api/announcement.api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { 
  Megaphone, 
  Plus, 
  Clock, 
  Users, 
  Award, 
  Send,
  AlertCircle,
  Check 
} from 'lucide-react';
import { Announcement, AnnouncementAudience } from '@/types/api.types';

export default function OwnerAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<AnnouncementAudience>('BOTH');

  // 1. Get owner business
  const { data: businessRes, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;
  const businessId = business?.id;

  // 2. Fetch announcements list
  const { data: announcementsRes, isLoading: isAnnouncementsLoading } = useQuery({
    queryKey: ['business-announcements', businessId],
    queryFn: () => announcementApi.listByBusiness(businessId!),
    enabled: !!businessId,
  });

  const announcements = announcementsRes?.data?.data || [];

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateAnnouncementInput) => announcementApi.create(businessId!, data),
    onSuccess: () => {
      setIsModalOpen(false);
      setTitle('');
      setBody('');
      setAudience('BOTH');
      setSuccessMessage('Announcement broadcasted successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      queryClient.invalidateQueries({ queryKey: ['business-announcements', businessId] });
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to publish announcement.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    createMutation.mutate({
      title,
      body,
      content: body,
      audience,
      targetAudience: audience,
    });
  };

  const getAudienceBadge = (aud: AnnouncementAudience) => {
    switch (aud) {
      case 'MEMBERS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <Users className="w-3 h-3" /> Members Only
          </span>
        );
      case 'TRAINERS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center gap-1">
            <Award className="w-3 h-3" /> Trainers Only
          </span>
        );
      case 'BOTH':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <Megaphone className="w-3 h-3" /> Everyone
          </span>
        );
    }
  };

  if (isBusinessLoading || isAnnouncementsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
          <div className="h-10 w-36 bg-slate-800 rounded animate-pulse" />
        </div>
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Gym Announcements</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Publish notifications and facility news directly to gym members and fitness trainers.
          </p>
        </div>
        <Button
          onClick={() => {
            setErrorMessage(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Announcement
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No Announcements Broadcasted Yet"
          description="Keep your gym community informed about holiday schedules, new equipment arrivals, or special workshops."
          actionLabel="Post First Announcement"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {announcements.map((item: Announcement) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 shadow-xl space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  {getAudienceBadge(item.audience || item.targetAudience!)}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {item.body || item.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Broadcast Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Announcement"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <Input
            label="Announcement Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Eid Holiday Hours & Maintenance Notice"
            required
          />

          <Select
            label="Target Audience *"
            value={audience}
            onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
            options={[
              { value: 'BOTH', label: 'Everyone (Members & Trainers)' },
              { value: 'MEMBERS', label: 'Gym Members Only' },
              { value: 'TRAINERS', label: 'Coaches & Trainers Only' },
            ]}
          />

          <Textarea
            label="Announcement Message *"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your announcement details here..."
            rows={5}
            required
          />

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
              leftIcon={<Send className="w-4 h-4" />}
            >
              Broadcast Now
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
