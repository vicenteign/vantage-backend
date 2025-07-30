'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import { SearchFiltersFixed } from '@/app/components/catalog/SearchFiltersFixed';
import { Pagination } from '@/app/components/ui/Pagination';
import { ServiceCard, ServiceCardSkeleton } from '@/app/components/catalog/ServiceCard';
import { MagnifyingGlassIcon, StarIcon } from '@heroicons/react/24/outline';
import apiClient from '@/app/lib/api';

interface Service {
  id: number;
  name: string;
  description: string;
  price?: number;
  modality: string;
  category?: {
    id: number;
    name: string;
  };
  provider: {
    id: number;
    company_name: string;
  };
  is_featured: boolean;
  created_at: string;
}

interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_items: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function ClientServices() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  
  // Memoizar la función de fetch para evitar re-renders innecesarios
  const fetchServices = useCallback(async (currentFilters = {}, page = 1, isInitial = false) => {
    try {
      console.log(`[ClientServices] fetchServices called - isInitial: ${isInitial}, filters:`, currentFilters, 'page:', page);
      
      if (isInitial) {
        setInitialLoading(true);
      } else {
      setLoading(true);
      }
      setError(null);
      const params = new URLSearchParams();
      
      // Agregar filtros a los parámetros de la URL
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });

      // Agregar parámetros de paginación
      params.append('page', page.toString());
      params.append('per_page', '12');
      
      const url = `/catalog/public/services?${params.toString()}`;
      console.log(`[ClientServices] Making request to: ${url}`);
      
      const response = await apiClient.get(url);
      setServices(response.data.services || []);
      setPagination(response.data.pagination || null);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      setError(error.response?.data?.message || 'Error al cargar servicios');
      toast.error('Error al cargar servicios', {
        description: error.response?.data?.message || 'No se pudieron cargar los servicios.'
      });
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
      setLoading(false);
      }
    }
  }, []);

  // Función para manejar cambios de filtros
  const handleFiltersChange = useCallback((newFilters: any) => {
    console.log('[ClientServices] handleFiltersChange called with:', newFilters);
    setFilters(newFilters);
    setCurrentPage(1);
    fetchServices(newFilters, 1, false);
  }, [fetchServices]);

  // Cargar servicios iniciales
  useEffect(() => {
    fetchServices({}, 1, true);
  }, [fetchServices]);

  // Manejar cambios de página
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchServices(filters, page, false);
  }, [fetchServices, filters]);



  // Memoizar el contenido de los servicios para mejor rendimiento
  const servicesContent = useMemo(() => {
    // Mostrar skeleton durante la carga inicial
    if (initialLoading) {
      return <ServiceCardSkeleton count={6} />;
    }

    // Mostrar skeleton durante filtros/paginación
    if (loading && !initialLoading) {
      return <ServiceCardSkeleton count={6} />;
    }

    if (services.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron servicios</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} onClick={() => router.push(`/service/${service.id}`)} />
        ))}
      </div>
    );
  }, [services, loading, initialLoading, router]);

  return (
    <ProtectedRoute requiredRole="cliente">
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header minimalista */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Servicios
              </h1>
              <p className="text-gray-600">
                {pagination?.total_items || 0} servicios disponibles
              </p>
            </div>

            {/* Search and Filters - Diseño mejorado */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
              {useMemo(() => (
              <SearchFiltersFixed 
                type="services" 
                onFiltersChange={handleFiltersChange}
              />
              ), [handleFiltersChange])}
            </div>

            {/* Contenido de servicios con overlay de carga suave */}
            <div className="mb-8 relative">
              {servicesContent}
              
              {/* Overlay de carga suave para evitar saltos */}
              {loading && !initialLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-300">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Actualizando...</p>
                  </div>
                  </div>
                )}
              </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={pagination.current_page}
                  totalPages={pagination.total_pages}
                  totalItems={pagination.total_items}
                  perPage={pagination.per_page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 