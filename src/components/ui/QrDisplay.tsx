'use strict';
'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from './Button';
import { Download, Printer } from 'lucide-react';

export interface QrDisplayProps {
  businessId?: string;
  businessName?: string;
  value?: string;
  size?: number;
  className?: string;
}

export function QrDisplay({
  businessId,
  businessName = 'Gym Facility',
  value,
  size = 220,
  className,
}: QrDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const qrValue =
    value ||
    JSON.stringify({
      type: 'GYM_ATTENDANCE',
      businessId: businessId || 'default-gym',
      timestamp: Date.now(),
    });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      ref={qrRef}
      className={`flex flex-col items-center p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm text-center max-w-sm mx-auto ${className || ''}`}
    >
      <div className="mb-4">
        <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-400 px-3 py-1 rounded-full">
          Official Check-in QR
        </span>
        <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
          {businessName}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Scan with the Member App to log attendance
        </p>
      </div>

      <div className="p-4 bg-white rounded-2xl shadow-inner border border-slate-100 dark:border-slate-800 my-3">
        <QRCodeSVG
          value={qrValue}
          size={size}
          level="H"
          includeMargin={true}
        />
      </div>

      {(businessId || value) && (
        <div className="text-[11px] font-mono text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
          ID: {businessId || value}
        </div>
      )}

      <div className="flex items-center gap-3 w-full">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="flex-1"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Print Poster
        </Button>
      </div>
    </div>
  );
}
