'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClientOnboardingWizard } from '@/app/components/onboarding/ClientOnboardingWizard';

export default function ClientOnboardingPage() {
  return (
    <div className="min-h-screen">
      <ClientOnboardingWizard />
    </div>
  );
} 