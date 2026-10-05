'use client';

import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Camera, AlertCircle } from 'lucide-react';

export interface QrScannerProps {
  onScan: (businessId: string) => void;
  isLoading?: boolean;
}

export function QrScanner({ onScan, isLoading = false }: QrScannerProps) {
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) {
      setError('Please enter a Gym ID or Scan Code');
      return;
    }
    setError(null);
    let id = manualId.trim();
    // Support scanning JSON payload
    try {
      if (id.startsWith('{')) {
        const parsed = JSON.parse(id);
        if (parsed.businessId) id = parsed.businessId;
      }
    } catch {
      // Use raw string
    }
    onScan(id);
  };

  return (
    <div className="flex flex-col items-center p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm max-w-md mx-auto text-center">
      {/* Scanner Visual Container */}
      <div className="relative w-64 h-64 border-2 border-dashed border-blue-500/60 rounded-3xl flex flex-col items-center justify-center bg-blue-50/20 dark:bg-blue-950/20 mb-6 overflow-hidden">
        {/* Animated Scanner Laser Bar */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent top-0 animate-[bounce_2s_infinite]" />
        
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
          <Camera className="w-8 h-8" />
        </div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Point Camera at Gym QR
        </p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
          Position the QR code inside the bounding box
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-3 rounded-xl border border-red-200 dark:border-red-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}


      {/* Manual Fallback / Direct check-in */}
      <form onSubmit={handleManualSubmit} className="w-full space-y-3 pt-2">
        <Input
          placeholder="Or paste Gym ID here..."
          value={manualId}
          onChange={(e) => {
            setManualId(e.target.value);
            setError(null);
          }}
          disabled={isLoading}
        />
        <Button
          type="submit"
          isLoading={isLoading}
          variant="primary"
          className="w-full"
        >
          Check In Now
        </Button>
      </form>
    </div>
  );
}
