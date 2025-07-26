'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

interface ClientProfile {
  id: number;
  full_name: string;
  email: string;
  company: {
    id: number;
    company_name: string;
    industry: string;
    about_us: string;
    website_url: string;
  } | null;
  branch: {
    id: number;
    branch_name: string;
    address: string;
    contact_phone: string;
  } | null;
}

export default function ClientProfile() {
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/client/profile');
        setProfile(response.data);
      } catch (error: any) {
        toast.error('Error al cargar perfil', {
          description: error.response?.data?.message || 'No se pudo cargar el perfil.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando perfil...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute requiredRole="cliente">
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal y de empresa</p>
          </div>

          {profile ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Personal</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre Completo
                    </label>
                    <p className="text-gray-900">{profile.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Empresa</h2>
                {profile.company ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la Empresa
                      </label>
                      <p className="text-gray-900">{profile.company.company_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Industria
                      </label>
                      <p className="text-gray-900">{profile.company.industry}</p>
                    </div>
                    {profile.company.website_url && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sitio Web
                        </label>
                        <a 
                          href={profile.company.website_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {profile.company.website_url}
                        </a>
                      </div>
                    )}
                    {profile.company.about_us && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Acerca de
                        </label>
                        <p className="text-gray-900 text-sm">{profile.company.about_us}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No hay información de empresa disponible</p>
                )}
              </div>

              {/* Branch Information */}
              {profile.branch && (
                <div className="bg-white p-6 rounded-lg shadow-sm border lg:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Sucursal</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la Sucursal
                      </label>
                      <p className="text-gray-900">{profile.branch.branch_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono de Contacto
                      </label>
                      <p className="text-gray-900">{profile.branch.contact_phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <p className="text-gray-900">{profile.branch.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se pudo cargar el perfil</h3>
              <p className="text-gray-600">Intenta recargar la página</p>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 