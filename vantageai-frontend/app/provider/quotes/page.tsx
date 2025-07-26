'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { QuoteList } from '@/app/components/quotes/QuoteList';

export default function ProviderQuotesPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Cotizaciones Recibidas</h1>
          <p className="text-gray-600 mt-2">
            Revisa y responde a las solicitudes de cotización de tus clientes. Puedes subir PDFs con tus propuestas.
          </p>
        </div>

        {userRole === 'proveedor' && <QuoteList userRole="proveedor" />}
      </div>
    </DashboardLayout>
  );
} 