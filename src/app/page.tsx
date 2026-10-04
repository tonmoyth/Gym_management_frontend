'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { businessApi } from '@/lib/api/business.api';
import { Business } from '@/types/api.types';
import { CardSkeleton, EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useAuth } from '@/lib/auth/useAuth';
import { favoriteApi } from '@/lib/api/favorite.api';
import {
  Search,
  MapPin,
  Star,
  Dumbbell,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
} from 'lucide-react';

export default function LandingDiscoveryPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAmenity, setSelectedAmenity] = useState<string>('ALL');
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadFavorites() {
      if (user?.role === 'MEMBER') {
        try {
          const res = await favoriteApi.getMyFavorites({ limit: 100 });
          if (res.data?.success && Array.isArray(res.data.data)) {
            const ids = new Set(res.data.data.map((fav) => fav.businessId));
            setFavoritedIds(ids);
          }
        } catch {
          // ignore
        }
      }
    }
    loadFavorites();
  }, [user]);

  const fetchBusinesses = async (query?: string) => {
    setIsLoading(true);
    try {
      const res = await businessApi.getAll({
        searchTerm: query || undefined,
        limit: 12,
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setBusinesses(res.data.data);
      }
    } catch {
      // Empty or error fallback
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBusinesses(searchTerm);
  };

  const amenityFilters = ['ALL', 'Cardio', 'Weights', 'Locker', 'Shower', 'Sauna', 'Trainer'];

  const filteredBusinesses = businesses.filter((b) => {
    if (selectedAmenity === 'ALL') return true;
    return b.amenities?.some((a) =>
      a.toLowerCase().includes(selectedAmenity.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider animate-in fade-in">
            <Zap className="w-3.5 h-3.5" /> Next-Gen Fitness Network
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-balance">
            Find Your Gym. Book Instantly.{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-sky-400">
              Train With Champions.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal text-balance leading-relaxed">
            Discover verified gyms, book flexible membership plans, connect with certified personal trainers, and track your attendance effortlessly.
          </p>

          {/* Search Bar Container */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-2 p-2 bg-white/10 backdrop-blur-md rounded-2xl sm:rounded-full border border-white/10 shadow-2xl"
          >
            <div className="flex-1 flex items-center gap-3 px-4 w-full">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search gyms by name, location, or amenities..."
                className="w-full py-2.5 bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-slate-400"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full sm:w-auto rounded-xl sm:rounded-full px-6"
            >
              Search Gyms
            </Button>
          </form>

          {/* Value Props Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Verified Centers
            </span>
            <span className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4 text-blue-400" /> Multi-Gateway Payments (bKash/Nagad/Stripe)
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-purple-400" /> Top Certified Trainers
            </span>
          </div>
        </div>
      </section>

      {/* Discovery Section */}
      <section className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Explore Fitness Centers
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Browse premier gyms and health clubs available for immediate membership
            </p>
          </div>

          {/* Amenity Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {amenityFilters.map((amenity) => (
              <button
                key={amenity}
                type="button"
                onClick={() => setSelectedAmenity(amenity)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedAmenity === amenity
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {amenity}
              </button>
            ))}
          </div>
        </div>

        {/* Gym Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <EmptyState
            title="No Gyms Found"
            description="We couldn't find any fitness centers matching your search criteria. Try adjusting your filters."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedAmenity('ALL');
                  fetchBusinesses();
                }}
              >
                Reset Filters
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((gym) => (
              <div
                key={gym.id}
                className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-500/40 transition-all duration-200"
              >
                {/* Gym Cover Photo */}
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {gym.photos && gym.photos.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gym.photos[0]}
                      alt={gym.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : gym.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={gym.logo}
                      alt={gym.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                      <Dumbbell className="w-12 h-12" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 z-10">
                    <FavoriteButton
                      businessId={gym.id}
                      businessName={gym.name}
                      initialFavorited={favoritedIds.has(gym.id)}
                      onToggle={(isFav) => {
                        setFavoritedIds((prev) => {
                          const updated = new Set(prev);
                          if (isFav) updated.add(gym.id);
                          else updated.delete(gym.id);
                          return updated;
                        });
                      }}
                    />
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      4.9
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {gym.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{gym.address}</span>
                    </div>

                    {gym.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {gym.description}
                      </p>
                    )}

                    {/* Amenities tags */}
                    {gym.amenities && gym.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {gym.amenities.slice(0, 3).map((a, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          >
                            {a}
                          </span>
                        ))}
                        {gym.amenities.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-semibold px-1 py-0.5">
                            +{gym.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Plans from
                      </span>
                      <p className="text-base font-black text-slate-900 dark:text-white">
                        ৳ 1,500 <span className="text-[11px] font-normal text-slate-400">/ mo</span>
                      </p>
                    </div>

                    <Link href={`/businesses/${gym.id}`}>
                      <Button variant="primary" size="sm" className="rounded-xl gap-1">
                        View Gym <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
            <Dumbbell className="w-4 h-4 text-blue-600" />
            FITNESSPRO SAAS PLATFORM
          </div>
          <p>© {new Date().getFullYear()} FitnessPro. All rights reserved. BDT Currency Supported.</p>
        </div>
      </footer>
    </div>
  );
}
