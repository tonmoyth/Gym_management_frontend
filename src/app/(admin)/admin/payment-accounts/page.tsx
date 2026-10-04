'use client';

import React from 'react';
import { PaymentAccountManager } from '@/components/payment/PaymentAccountManager';

export default function AdminPaymentAccountsPage() {
  return (
    <div className="space-y-6">
      <PaymentAccountManager
        title="Platform Receiving Payment Accounts"
        subtitle="Manage Super Admin bank accounts and mobile financial accounts (bKash, Nagad) where gym owners submit their SaaS subscription payments."
        roleHint="Super Admin Authority: Accounts created here appear as deposit targets on gym owners' checkout screens."
      />
    </div>
  );
}
