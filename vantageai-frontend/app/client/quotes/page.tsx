'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { QuoteList } from '@/app/components/quotes/QuoteList';
import Link from "next/link";

export default function ClientQuotesPage() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role from localStorage
    const role = localStorage.getItem('userRole');
    setUserRole(role);
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones</h1>
          <p className="text-gray-600 mt-2">
            Gestiona tus solicitudes de cotización y revisa el estado de cada una.
          </p>
        </div>

        {userRole === 'cliente' && <QuoteList userRole="cliente" />}
      </div>
    </DashboardLayout>
  );
} 