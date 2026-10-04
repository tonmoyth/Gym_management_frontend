'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { businessApi } from '@/lib/api/business.api';
import { useAuth } from '@/lib/auth/useAuth';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Building2, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

export default function OwnerSetupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [amenitiesInput, setAmenitiesInput] = useState('Cardio, Weights, Locker, Shower');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  // Referral system temporarily disabled - will be implemented later
  // const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*
  // Referral system temporarily disabled - will be implemented later
  const handleGenerateReferralCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setReferralCode(`GYM-${randomPart}`);
  };
  */

  useEffect(() => {
    async function checkExistingBusiness() {
      try {
        const res = await businessApi.getMyBusiness();
        if (res.data?.success && res.data.data) {
          window.location.href = '/owner/subscription';
          return;
        }
      } catch {
        // No business created yet; user needs to setup
      } finally {
        setIsCheckingExisting(false);
      }
    }
    checkExistingBusiness();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const amenities = amenitiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await businessApi.create({
        name,
        description,
        address,
        amenities,
        email: email || undefined,
        phone: phone || undefined,
        whatsapp: whatsapp || undefined,
        // referralCode: referralCode.trim() || undefined, // Referral system temporarily disabled
      });

      if (res.data?.success) {
        window.location.href = '/owner/subscription?onboarding=true';
      } else {
        setError(res.data?.message || 'Failed to create business profile');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to setup gym profile. Please review the form.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingExisting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center animate-pulse">
          <Building2 className="w-6 h-6 animate-bounce" />
        </div>
        <p className="text-sm font-semibold text-slate-500">Checking facility profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          Register Your Gym or Fitness Center
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Complete your facility profile to publish your club, manage memberships, and welcome new athletes
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <Input
          label="Gym / Club Name"
          required
          placeholder="e.g. Iron Forge Fitness"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          label="Full Physical Address"
          required
          placeholder="House #, Road #, Area, City"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Textarea
          label="About the Gym"
          placeholder="Describe your training zones, philosophy, opening hours..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          label="Amenities (comma separated)"
          placeholder="Cardio, Free Weights, Lockers, Showers, Sauna"
          value={amenitiesInput}
          onChange={(e) => setAmenitiesInput(e.target.value)}
          helperText="Separate multiple amenities with commas"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Input
            label="Facility Email"
            type="email"
            placeholder="info@gym.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Phone"
            placeholder="017XXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Input
            label="WhatsApp"
            placeholder="017XXXXXXXX"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>

        {/* Referral system temporarily disabled - will be implemented later
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Gym Referral Code <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            {referralCode && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Ready to save
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="e.g. GYM-A7K9P"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold tracking-wider placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm uppercase shadow-xs"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateReferralCode}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border-blue-200 dark:border-blue-900/60 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 active:scale-95 transition-all cursor-pointer shrink-0 gap-1.5 shadow-xs"
            >
              {referralCode ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
                  <span>Regenerate</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Generate Code</span>
                </>
              )}
            </Button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Click &quot;Generate Code&quot; to auto-generate a unique referral code for your gym, or type your own. If left empty, one will be created automatically.
          </p>
        </div>
        */}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full rounded-2xl"
          >
            Create Gym & Enter Payment Page
          </Button>
        </div>
      </form>
    </div>
  );
}
