'use strict';
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobPostApi } from '@/lib/api/jobPost.api';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import { TableSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { 
  FileCheck, 
  Building2, 
  Calendar, 
  Briefcase, 
  Banknote,
  Award,
  Eye,
  MapPin,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function TrainerApplicationsPage() {
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const { data: appsRes, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => jobPostApi.getMyApplications(),
  });

  const applications = appsRes?.data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <TableSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Job Applications</h1>
          <p className="text-slate-400 mt-1 text-sm">
            Track the approval and review status of your coach job applications across gyms.
          </p>
        </div>
        <Link href="/trainer/job-posts">
          <Button variant="primary" leftIcon={<Briefcase className="w-4 h-4" />}>
            Browse More Jobs
          </Button>
        </Link>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No Applications Submitted"
          description="Browse open job postings and submit your credentials to partner with gyms."
          actionLabel="Find Open Positions"
          href="/trainer/job-posts"
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Position</th>
                  <th className="py-4 px-6">Gym Business</th>
                  <th className="py-4 px-6">Offered Salary</th>
                  <th className="py-4 px-6">Required Exp</th>
                  <th className="py-4 px-6">Application Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {applications.map((app: any) => {
                  const job = app.jobPost || {};
                  const businessName = app.business?.name || job.business?.name || 'Verified Gym';
                  const salary = job.salary ? Number(job.salary) : null;
                  const experience = job.experience ?? null;

                  return (
                    <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-white block">{job.title || 'Trainer Opening'}</span>
                        <span className="text-xs text-teal-400">
                          {app.specialization?.name || job.specialization?.name || 'Fitness Coach'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{businessName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {salary && salary > 0 ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                            <Banknote className="w-3.5 h-3.5 shrink-0" />
                            <span>৳{salary.toLocaleString()}/mo</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Negotiable</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-300">
                        {experience && experience > 0 ? (
                          <div className="flex items-center gap-1 text-amber-400">
                            <Award className="w-3.5 h-3.5 shrink-0" />
                            <span>{experience}+ Yrs</span>
                          </div>
                        ) : (
                          <span className="text-slate-500">Any level</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{new Date(app.createdAt || app.appliedAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={app.status || app.applicationStatus} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Applied Job Details Modal */}
      {selectedApp && (
        <Modal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title="Applied Position Details"
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  {selectedApp.specialization?.name || selectedApp.jobPost?.specialization?.name || 'Fitness'}
                </span>
                <StatusBadge status={selectedApp.status || selectedApp.applicationStatus} />
              </div>
              <h2 className="text-2xl font-black text-white">{selectedApp.jobPost?.title}</h2>
              <div className="flex items-center gap-2 mt-2 text-sm text-slate-300">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-semibold">
                  {selectedApp.business?.name || selectedApp.jobPost?.business?.name || 'Affiliated Gym'}
                </span>
                <span className="text-slate-600">•</span>
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-400">
                  {selectedApp.business?.address || selectedApp.jobPost?.business?.address || 'Location on file'}
                </span>
              </div>
            </div>

            {/* Compensation & Experience Highlight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-emerald-400 font-medium uppercase tracking-wider">
                    Offered Monthly Salary
                  </div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {selectedApp.jobPost?.salary && Number(selectedApp.jobPost?.salary) > 0
                      ? `৳${Number(selectedApp.jobPost?.salary).toLocaleString()} / mo`
                      : 'Salary Negotiable'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Fixed monthly disbursement upon hiring
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-amber-400 font-medium uppercase tracking-wider">
                    Experience Required
                  </div>
                  <div className="text-xl font-black text-white mt-0.5">
                    {selectedApp.jobPost?.experience && Number(selectedApp.jobPost?.experience) > 0
                      ? `${selectedApp.jobPost?.experience} Years Required`
                      : 'Open to All Levels'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Coaching experience requested by gym
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Job Description</h4>
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-sm text-slate-300 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                {selectedApp.jobPost?.description || 'No detailed description provided.'}
              </div>
            </div>

            {/* Applied Date */}
            <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Applied on {new Date(selectedApp.createdAt || selectedApp.appliedAt).toLocaleDateString()}
              </span>
            </div>

            {/* Close */}
            <div className="flex justify-end pt-3 border-t border-slate-800">
              <Button variant="outline" onClick={() => setSelectedApp(null)} className="border-slate-700 text-slate-300">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
