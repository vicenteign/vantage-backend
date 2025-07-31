'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  StarIcon,
  BuildingOfficeIcon,
  TagIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

interface SearchResult {
  id: number;
  name: string;
  description: string;
  type: 'producto' | 'servicio';
  price?: number;
  currency?: string;
  sku?: string;
  modality?: string;
  duration?: string;
  technical_details?: string;
  has_cert_iso9001: boolean;
  has_cert_iso14001: boolean;
  is_featured: boolean;
  provider: {
    id: number;
    name: string;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface Provider {
  id: number;
  company_name: string;
}

interface SearchResponse {
  success: boolean;
  message?: string;
  data: {
    items: SearchResult[];
    pagination: {
      page: number;
      per_page: number;
      total: number;
      pages: number;
    };
    filters: {
      query: string;
      category_id?: string;
      provider_id?: string;
      has_cert_iso9001?: string;
      has_cert_iso14001?: string;
      is_featured?: string;
      type: string;
    };
    search_info: {
      ai_search_used: boolean;
      relevant_ids_count: number;
      total_results: number;
    };
  };
}

// Componente de carga
function SearchLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Cargando búsqueda...</p>
      </div>
    </div>
  );
}

// Componente principal de búsqueda
function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 12,
    total: 0,
    pages: 0
  });
  const [searchInfo, setSearchInfo] = useState({
    ai_search_used: false,
    relevant_ids_count: 0,
    total_results: 0
  });

  // Filtros
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    category_id: searchParams.get('category') || '',
    provider_id: searchParams.get('provider') || '',
    has_cert_iso9001: searchParams.get('has_cert_iso9001') === 'true',
    has_cert_iso14001: searchParams.get('has_cert_iso14001') === 'true',
    is_featured: searchParams.get('is_featured') === 'true',
    type: searchParams.get('type') || 'all'
  });

  // Cargar categorías y proveedores
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [categoriesRes, providersRes] = await Promise.all([
          apiClient.get('/catalog/public/categories'),
          apiClient.get('/catalog/public/providers')
        ]);
        
        setCategories(categoriesRes.data);
        setProviders(providersRes.data);
      } catch (error) {
        console.error('Error cargando filtros:', error);
      }
    };

    loadFilters();
  }, []);

  // Realizar búsqueda
  const performSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.query) params.append('q', filters.query);
      if (filters.category_id) params.append('category', filters.category_id);
      if (filters.provider_id) params.append('provider', filters.provider_id);
      if (filters.has_cert_iso9001) params.append('has_cert_iso9001', 'true');
      if (filters.has_cert_iso14001) params.append('has_cert_iso14001', 'true');
      if (filters.is_featured) params.append('is_featured', 'true');
      if (filters.type !== 'all') params.append('type', filters.type);
      
      params.append('page', pagination.page.toString());
      params.append('per_page', pagination.per_page.toString());

      const response = await apiClient.get(`/api/catalog/search?${params.toString()}`);
      const data: SearchResponse = response.data;

      if (data.success) {
        setResults(data.data.items);
        setPagination(data.data.pagination);
        setSearchInfo(data.data.search_info);
        
        // Actualizar URL con los filtros
        const newUrl = `/search?${params.toString()}`;
        router.push(newUrl, { scroll: false });
      } else {
        toast.error('Error en la búsqueda', {
          description: data.message || 'No se pudieron obtener los resultados'
        });
      }
    } catch (error: any) {
      toast.error('Error en la búsqueda', {
        description: error.response?.data?.message || 'Error al conectar con el servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  // Efecto para realizar búsqueda cuando cambian los filtros
  useEffect(() => {
    if (categories.length > 0) { // Solo buscar cuando ya tenemos los filtros cargados
      performSearch();
    }
  }, [filters, pagination.page]);

  // Actualizar filtros
  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Resetear a página 1
  };

  // Navegar a detalle del item
  const navigateToItem = (item: SearchResult) => {
    if (item.type === 'producto') {
      router.push(`/product/${item.id}`);
    } else {
      router.push(`/service/${item.id}`);
    }
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      query: '',
      category_id: '',
      provider_id: '',
      has_cert_iso9001: false,
      has_cert_iso14001: false,
      is_featured: false,
      type: 'all'
    });
  };

  return (
    <ProtectedRoute requiredRole="cliente">
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Resultados de Búsqueda
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {searchInfo.total_results} resultados encontrados
                    {searchInfo.ai_search_used && (
                      <span className="ml-2 text-blue-600">
                        • Búsqueda IA activada
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <div className="relative max-w-2xl">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar productos y servicios..."
                    value={filters.query}
                    onChange={(e) => updateFilter('query', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-8">
              {/* Barra lateral de filtros */}
              <div className="w-80 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                  <div className="flex items-center gap-2 mb-6">
                    <FunnelIcon className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
                    <button
                      onClick={clearFilters}
                      className="ml-auto text-sm text-blue-600 hover:text-blue-800"
                    >
                      Limpiar
                    </button>
                  </div>

                  {/* Tipo de item */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Tipo</h3>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'Todos' },
                        { value: 'producto', label: 'Productos' },
                        { value: 'servicio', label: 'Servicios' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            name="type"
                            value={option.value}
                            checked={filters.type === option.value}
                            onChange={(e) => updateFilter('type', e.target.value)}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Categorías */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Categoría</h3>
                    <select
                      value={filters.category_id}
                      onChange={(e) => updateFilter('category_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Proveedores */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Proveedor</h3>
                    <select
                      value={filters.provider_id}
                      onChange={(e) => updateFilter('provider_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                    >
                      <option value="">Todos los proveedores</option>
                      {providers.map((provider) => (
                        <option key={provider.id} value={provider.id}>
                          {provider.company_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Certificaciones */}
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Certificaciones</h3>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.has_cert_iso9001}
                          onChange={(e) => updateFilter('has_cert_iso9001', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">ISO 9001</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.has_cert_iso14001}
                          onChange={(e) => updateFilter('has_cert_iso14001', e.target.checked)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">ISO 14001</span>
                      </label>
                    </div>
                  </div>

                  {/* Destacados */}
                  <div className="mb-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.is_featured}
                        onChange={(e) => updateFilter('is_featured', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Solo destacados</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Área principal de resultados */}
              <div className="flex-1">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-white rounded-xl shadow-sm p-6">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {results.map((item) => (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300 cursor-pointer hover-lift"
                          onClick={() => navigateToItem(item)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                item.type === 'producto' 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'bg-purple-100 text-purple-600'
                              }`}>
                                {item.type === 'producto' ? (
                                  <TagIcon className="w-4 h-4" />
                                ) : (
                                  <BuildingOfficeIcon className="w-4 h-4" />
                                )}
                              </div>
                              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                item.type === 'producto'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {item.type === 'producto' ? 'Producto' : 'Servicio'}
                              </span>
                            </div>
                            {item.is_featured && (
                              <StarIcon className="w-5 h-5 text-yellow-500" />
                            )}
                          </div>

                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {item.name}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                            {item.description}
                          </p>

                          <div className="space-y-2 mb-4">
                            {item.provider && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <BuildingOfficeIcon className="w-4 h-4" />
                                <span>{item.provider.name}</span>
                              </div>
                            )}
                            
                            {item.category && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <TagIcon className="w-4 h-4" />
                                <span>{item.category.name}</span>
                              </div>
                            )}

                            {item.price && (
                              <div className="text-lg font-semibold text-gray-900">
                                {item.currency} {item.price.toLocaleString()}
                              </div>
                            )}
                          </div>

                          {/* Certificaciones */}
                          <div className="flex items-center gap-2">
                            {item.has_cert_iso9001 && (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircleIcon className="w-3 h-3" />
                                <span>ISO 9001</span>
                              </div>
                            )}
                            {item.has_cert_iso14001 && (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircleIcon className="w-3 h-3" />
                                <span>ISO 14001</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Paginación */}
                    {pagination.pages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Anterior
                          </button>
                          
                          <span className="px-3 py-2 text-sm text-gray-700">
                            Página {pagination.page} de {pagination.pages}
                          </span>
                          
                          <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page === pagination.pages}
                            className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Siguiente
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MagnifyingGlassIcon className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent mb-3">
                      No se encontraron resultados
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Intenta ajustar los filtros o usar términos de búsqueda diferentes
                    </p>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      🔄 Limpiar Filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

// Componente principal con Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchContent />
    </Suspense>
  );
} 