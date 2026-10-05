'use client';

import { PaymentAccountManager } from '@/components/payment/PaymentAccountManager';

export default function TrainerPaymentAccountsPage() {
  return (
    <div className="space-y-6">
      <PaymentAccountManager
        title="Trainer Payout Receiving Accounts"
        subtitle="Manage your personal bank account or mobile wallet (bKash/Nagad) where gym facilities disburse your training commissions and monthly payouts."
        roleHint="Trainer Portal: Payouts approved by gym management will be transferred to your designated default account."
      />
    </div>
  );
}
