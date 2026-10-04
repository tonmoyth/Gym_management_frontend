'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessApi } from '@/lib/api/business.api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { StatusBadge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/EmptyState';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Upload, 
  Check, 
  AlertCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

const COMMON_AMENITIES = [
  'Air Conditioning',
  'Free WiFi',
  'Shower & Lockers',
  'Cardio Equipment',
  'Free Weights',
  'Personal Trainers',
  'Steam & Sauna',
  'Parking Available',
  'Swimming Pool',
  'Juice Bar',
  'Yoga Studio',
  'Open 24/7'
];

export default function OwnerProfilePage() {
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: businessRes, isLoading } = useQuery({
    queryKey: ['my-business'],
    queryFn: () => businessApi.getMyBusiness(),
  });

  const business = businessRes?.data?.data;

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  useEffect(() => {
    if (business) {
      setName(business.name || '');
      setDescription(business.description || '');
      setAddress(business.address || '');
      setPhone(business.phone || '');
      setWhatsapp(business.whatsapp || '');
      setEmail(business.email || '');
      setSelectedAmenities(business.amenities || []);
    }
  }, [business]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!business?.id) throw new Error('Business ID missing');

      // Use FormData if files were selected
      if (logoFile || photoFiles.length > 0) {
        const formData = new FormData();
        formData.append('name', name);
        if (description) formData.append('description', description);
        formData.append('address', address);
        if (phone) formData.append('phone', phone);
        if (whatsapp) formData.append('whatsapp', whatsapp);
        if (email && email.trim()) formData.append('email', email.trim());
        formData.append('amenities', JSON.stringify(selectedAmenities));

        if (logoFile) {
          formData.append('logo', logoFile);
        }
        photoFiles.forEach(file => {
          formData.append('photos', file);
        });

        return businessApi.update(business.id, formData);
      } else {
        return businessApi.update(business.id, {
          name,
          description: description || undefined,
          address,
          phone: phone || undefined,
          whatsapp: whatsapp || undefined,
          email: email?.trim() || undefined,
          amenities: selectedAmenities,
        });
      }
    },
    onSuccess: () => {
      setSuccessMessage('Gym profile updated successfully!');
      setErrorMessage(null);
      setLogoFile(null);
      setPhotoFiles([]);
      queryClient.invalidateQueries({ queryKey: ['my-business'] });
      queryClient.invalidateQueries({ queryKey: ['business-dashboard'] });
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    updateMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-800 rounded animate-pulse" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
        <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-2">No Gym Found</h3>
        <p className="text-slate-400 mb-6">You have not registered a gym business yet.</p>
        <Button href="/owner/setup" variant="primary">Create Gym Business</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-white">{business.name}</h1>
            <StatusBadge status={business.status} />
          </div>
          <p className="text-slate-400 mt-1 flex items-center gap-1.5 text-sm">
            <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
            {business.address || 'Address pending'}
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">General Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Gym Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Iron Forge Fitness"
              required
            />
            <Input
              label="Street Address / Location *"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. House 14, Road 7, Banani, Dhaka"
              required
            />
          </div>

          <Textarea
            label="Gym Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell fitness enthusiasts about your equipment, coaches, vibes, and facilities..."
            rows={4}
          />
        </div>

        {/* Contact Info */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <Phone className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Contact & Support Channels</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+880 1700-000000"
              leftIcon={<Phone className="w-4 h-4 text-slate-500" />}
            />
            <Input
              label="WhatsApp Number"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+880 1700-000000"
              leftIcon={<MessageSquare className="w-4 h-4 text-emerald-400" />}
            />
            <Input
              label="Support Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="support@gym.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-500" />}
            />
          </div>
        </div>

        {/* Amenities Selection */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Gym Amenities & Facilities</h2>
            </div>
            <span className="text-xs text-slate-400">
              {selectedAmenities.length} selected
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {COMMON_AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity);
              return (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all text-left flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500/50 text-blue-300'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                  }`}
                >
                  <span>{amenity}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Media & Photos */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <Upload className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Brand Logo & Facility Photos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Gym Logo</label>
              <div className="flex items-center gap-4">
                {business.logo && (
                  <img
                    src={business.logo}
                    alt="Current Logo"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-300 hover:file:bg-blue-600/30 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Add Facility Photos</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setPhotoFiles(Array.from(e.target.files || []))}
                className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-300 hover:file:bg-blue-600/30 cursor-pointer"
              />
              {business.photos && business.photos.length > 0 && (
                <p className="text-xs text-slate-400 mt-2">
                  Currently {business.photos.length} photos uploaded.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            variant="primary"
            isLoading={updateMutation.isPending}
            className="px-8"
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
