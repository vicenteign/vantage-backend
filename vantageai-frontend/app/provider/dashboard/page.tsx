'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import { ProviderDashboardTour } from '@/app/components/onboarding/ProviderDashboardTour';
import { OnboardingRedirect } from '@/app/components/auth/OnboardingRedirect';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

interface ProviderStats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  companyName: string;
}

export default function ProviderDashboard() {
  const [stats, setStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener perfil del proveedor
        const profileResponse = await apiClient.get('/provider/profile');
        
        // Obtener productos
        const productsResponse = await apiClient.get('/catalog/products');
        const products = productsResponse.data.products || [];
        
        const stats: ProviderStats = {
          totalProducts: products.length,
          activeProducts: products.filter((p: any) => p.status === 'activo').length,
          draftProducts: products.filter((p: any) => p.status === 'borrador').length,
          companyName: profileResponse.data.company_name || 'Mi Empresa'
        };
        
        setStats(stats);
      } catch (error: any) {
        toast.error('Error al cargar estadísticas', {
          description: error.response?.data?.message || 'No se pudieron cargar los datos.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Check if tour should be shown
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('provider-tour-completed');
    if (!hasSeenTour) {
      // Show tour after a short delay
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourComplete = () => {
    localStorage.setItem('provider-tour-completed', 'true');
    setShowTour(false);
  };

  const handleTourSkip = () => {
    localStorage.setItem('provider-tour-completed', 'true');
    setShowTour(false);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="proveedor">
        <OnboardingRedirect>
          <DashboardLayout>
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Cargando...</div>
            </div>
          </DashboardLayout>
        </OnboardingRedirect>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="proveedor">
      <OnboardingRedirect>
        <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Bienvenido de vuelta, {stats?.companyName}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📦</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Productos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeProducts}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-2xl">📝</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Borradores</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.draftProducts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                data-tour="create-product"
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-2xl mr-3">➕</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Agregar Producto</p>
                  <p className="text-sm text-gray-600">Crear un nuevo producto</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <span className="text-2xl mr-3">🔧</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Agregar Servicio</p>
                  <p className="text-sm text-gray-600">Crear un nuevo servicio</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Tour Component */}
        <ProviderDashboardTour
          isActive={showTour}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
        </DashboardLayout>
      </OnboardingRedirect>
    </ProtectedRoute>
  );
} 