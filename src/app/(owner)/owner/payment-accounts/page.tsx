'use client';

import { PaymentAccountManager } from '@/components/payment/PaymentAccountManager';

export default function OwnerPaymentAccountsPage() {
  return (
    <div className="space-y-6">
      <PaymentAccountManager
        title="Gym Payment Receiving Accounts"
        subtitle="Configure your facility bank accounts and mobile financial services (bKash, Nagad) to receive membership fees and booking payments from your athletes."
        roleHint="Business Owner Portal: These accounts are displayed to gym members when they pay membership fees."
      />
    </div>
  );
}
