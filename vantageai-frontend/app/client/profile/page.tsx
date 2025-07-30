'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';
import { 
  UserIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

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
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="animate-pulse mb-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            {/* Profile Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((j) => (
                        <div key={j}>
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute requiredRole="cliente">
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header con gradiente */}
            <div className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Mi Perfil
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Gestiona tu información personal y de empresa
                  </p>
                </div>
              </div>
            </div>

            {profile ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Información Personal */}
                <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-xl shadow-lg border border-blue-200/50 overflow-hidden hover-lift">
                  {/* Efecto de borde animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
                  
                  <div className="relative p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                        <IdentificationIcon className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Información Personal
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-blue-200/30 hover:bg-white/80 transition-all duration-300 hover:shadow-md">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                          <UserIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre Completo
                          </label>
                          <p className="text-gray-900 font-medium">{profile.full_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-blue-200/30 hover:bg-white/80 transition-all duration-300 hover:shadow-md">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                          <EnvelopeIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <p className="text-gray-900 font-medium">{profile.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información de Empresa */}
                <div className="relative bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-xl shadow-lg border border-purple-200/50 overflow-hidden hover-lift">
                  {/* Efecto de borde animado */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-rose-500/10 animate-pulse"></div>
                  
                  <div className="relative p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                        <BuildingOfficeIcon className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Información de Empresa
                      </h2>
                    </div>
                    
                    {profile.company ? (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-purple-200/30 hover:bg-white/80 transition-all duration-300 hover:shadow-md">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                            <BuildingOfficeIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre de la Empresa
                            </label>
                            <p className="text-gray-900 font-medium">{profile.company.company_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-purple-200/30 hover:bg-white/80 transition-all duration-300 hover:shadow-md">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                            <BriefcaseIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Industria
                            </label>
                            <p className="text-gray-900 font-medium">{profile.company.industry}</p>
                          </div>
                        </div>
                        
                        {profile.company.website_url && (
                          <div className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-purple-200/30 hover:bg-white/80 transition-all duration-300 hover:shadow-md">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                              <GlobeAltIcon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sitio Web
                              </label>
                              <a 
                                href={profile.company.website_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                              >
                                {profile.company.website_url}
                              </a>
                            </div>
                          </div>
                        )}
                        
                        {profile.company.about_us && (
                          <div className="p-4 bg-white/60 rounded-lg border border-purple-200/30 hover:bg-white/80 transition-all duration-300 hover:shadow-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Acerca de la Empresa
                            </label>
                            <p className="text-gray-900 text-sm leading-relaxed">{profile.company.about_us}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BuildingOfficeIcon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Sin información de empresa</h3>
                        <p className="text-gray-600">No hay datos de empresa disponibles</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de Sucursal */}
                {profile.branch && (
                  <div className="relative bg-gradient-to-br from-white via-green-50/30 to-emerald-50/30 rounded-xl shadow-lg border border-green-200/50 overflow-hidden lg:col-span-2 hover-lift">
                    {/* Efecto de borde animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 animate-pulse"></div>
                    
                    <div className="relative p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                          <MapPinIcon className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          Información de Sucursal
                        </h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-green-200/30 hover:bg-white/80 transition-all duration-300 hover:shadow-md">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                            <BuildingOfficeIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre de la Sucursal
                            </label>
                            <p className="text-gray-900 font-medium">{profile.branch.branch_name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 bg-white/60 rounded-lg border border-green-200/30 hover:bg-white/80 transition-all duration-300 hover:shadow-md">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md">
                            <PhoneIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Teléfono de Contacto
                            </label>
                            <p className="text-gray-900 font-medium">{profile.branch.contact_phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4 bg-white/60 rounded-lg border border-green-200/30 hover:bg-white/80 transition-all duration-300 hover:shadow-md md:col-span-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                            <MapPinIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Dirección
                            </label>
                            <p className="text-gray-900 font-medium">{profile.branch.address}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <UserIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent mb-3">
                  No se pudo cargar el perfil
                </h3>
                <p className="text-gray-600 mb-6">Intenta recargar la página o contacta soporte</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  🔄 Recargar Página
                </button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 