'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';
import { 
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ClientDashboardTour } from '@/app/components/onboarding/ClientDashboardTour';

interface ClientStats {
  total_quotes_sent: number;
  pending_quotes: number;
  quotes_with_responses: number;
  company_name: string;
  recent_quotes: Array<{
    id: number;
    item_name: string;
    item_type: string;
    status: string;
    created_at: string;
    responses_count: number;
  }>;
}

interface SearchResult {
  id: number;
  type: 'producto' | 'servicio';
  name: string;
  description: string;
  technical_details?: string;
  category: string;
  provider: string;
  sku?: string;
  modality?: string;
  is_featured: boolean;
  reasoning: string;
}

interface SearchResponse {
  message: string;
  query: string;
  exact_matches: SearchResult[];
  near_matches: SearchResult[];
  reasoning: string;
  total_exact: number;
  total_near: number;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para el buscador de IA
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [highlightResults, setHighlightResults] = useState(false);
  
  // Referencia para scroll automático a resultados
  const searchResultsRef = useRef<HTMLDivElement>(null);
  
  // Estados para tour y onboarding
  const [showTourInvitation, setShowTourInvitation] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/client/dashboard');
        setStats(response.data);
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

  // Lógica para mostrar invitación al tour
  useEffect(() => {
    const hasSeenTourInvitation = localStorage.getItem('clientTourInvitationShown');
    const hasCompletedTour = localStorage.getItem('clientTourCompleted');
    
    if (!hasSeenTourInvitation && !hasCompletedTour) {
      // Mostrar invitación después de 2 segundos
      const timer = setTimeout(() => {
        setShowTourInvitation(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleStartTour = () => {
    setShowTourInvitation(false);
    setIsTourActive(true);
    localStorage.setItem('clientTourInvitationShown', 'true');
  };

  const handleSkipTour = () => {
    setShowTourInvitation(false);
    localStorage.setItem('clientTourInvitationShown', 'true');
  };

  const handleCompleteTour = () => {
    setIsTourActive(false);
    localStorage.setItem('clientTourCompleted', 'true');
    toast.success('¡Tour completado! Ya conoces las funciones principales.');
  };

  const handleSkipTourFromTour = () => {
    setIsTourActive(false);
    localStorage.setItem('clientTourCompleted', 'true');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('Ingresa un término de búsqueda');
      return;
    }

    setSearchLoading(true);
    setSearchResults(null);

    try {
      const response = await apiClient.post('/api/ia/search-catalog', {
        query: searchQuery
      });

      setSearchResults(response.data);
      setShowSearchResults(true);
      
      // Scroll automático suave a los resultados después de un pequeño delay
      setTimeout(() => {
        if (searchResultsRef.current) {
          searchResultsRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
          
          // Efecto de highlight después del scroll
          setTimeout(() => {
            setHighlightResults(true);
            setTimeout(() => setHighlightResults(false), 2000);
          }, 500);
        }
      }, 300);
      
      if (response.data.total_exact === 0 && response.data.total_near === 0) {
        toast.info('No se encontraron resultados', {
          description: 'Intenta con términos más específicos'
        });
      } else {
        toast.success('Búsqueda completada', {
          description: `Encontrados ${response.data.total_exact} resultados exactos y ${response.data.total_near} cercanos`
        });
      }
    } catch (error: any) {
      toast.error('Error en la búsqueda', {
        description: error.response?.data?.message || 'No se pudo procesar la búsqueda.'
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setShowSearchResults(false);
    setHighlightResults(false);
    
    // Scroll suave de vuelta al buscador
    setTimeout(() => {
      const searchSection = document.querySelector('[data-search-section]');
      if (searchSection) {
        searchSection.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 100);
  };

  const navigateToItem = (item: SearchResult) => {
    if (item.type === 'producto') {
      router.push(`/product/${item.id}`);
    } else {
      router.push(`/service/${item.id}`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="animate-pulse mb-8">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Content Skeleton */}
            <div className="animate-pulse">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <ProtectedRoute requiredRole="cliente">
      <DashboardLayout>
        {/* Tour Component */}
        <ClientDashboardTour 
          isActive={isTourActive}
          onComplete={handleCompleteTour}
          onSkip={handleSkipTourFromTour}
        />
        
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard
              </h1>
              <p className="text-gray-600">
                Bienvenido, <span className="font-semibold">{stats?.company_name}</span>
              </p>
            </div>

            {/* Buscador de IA - AI Powered */}
            <div 
              data-search-section
              className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-xl shadow-lg border border-blue-200/50 mb-16 overflow-hidden"
            >
              {/* Efecto de borde animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
              
              {/* Contenido principal */}
              <div className="relative p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                      <MagnifyingGlassIcon className="w-6 h-6 text-white" />
                    </div>
                    {/* Efecto de pulso alrededor del icono */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400 rounded-xl animate-ping opacity-20"></div>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      🤖 Buscador IA
                    </h2>
                    <p className="text-sm text-gray-600">
                      Inteligencia artificial para encontrar productos y servicios
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3" id="ai-search-bar">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="💬 Describe lo que necesitas: 'bombas centrífugas para minería', 'servicios de mantenimiento industrial'..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full border-2 border-blue-200/50 rounded-xl px-4 py-3 text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300 placeholder-gray-400"
                    />
                    {/* Efecto de borde brillante */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-cyan-400/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    {searchLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span className="animate-pulse">Analizando...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
                        Buscar IA
                      </>
                    )}
                    {/* Efecto de brillo en hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </button>
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Botón de búsqueda avanzada */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>IA Activa</span>
                    </div>
                    <span>•</span>
                    <span>💡 Ejemplos: "bombas para minería", "servicios de mantenimiento", "equipos de seguridad"</span>
                  </div>
                  <button
                    onClick={() => router.push('/search')}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-300"
                  >
                    🔍 Búsqueda Avanzada
                  </button>
                </div>
              </div>
            </div>

            {/* Resultados de búsqueda - AI Powered */}
            {showSearchResults && searchResults && (
              <div 
                ref={searchResultsRef}
                className={`bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-xl shadow-lg border border-blue-200/50 mb-16 mt-16 overflow-hidden transition-all duration-1000 ${
                  highlightResults ? 'animate-pulse-glow ring-4 ring-blue-400/50' : ''
                }`}
              >
                <div className="p-8 border-b border-blue-200/30 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                      <h3 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        🤖 Análisis IA: "{searchResults.query}"
                      </h3>
                    </div>
                    <button
                      onClick={clearSearch}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  {searchResults.reasoning && (
                    <div className="mt-3 p-3 bg-white/60 rounded-lg border border-blue-200/30">
                      <p className="text-sm text-gray-700 font-medium">💭 Razonamiento IA:</p>
                      <p className="text-sm text-gray-600 mt-1">{searchResults.reasoning}</p>
                    </div>
                  )}
                </div>

                {/* Coincidencias exactas */}
                {searchResults.exact_matches.length > 0 && (
                  <div className="py-8 px-8 border-b border-blue-200/30">
                    <h4 className="font-bold text-green-700 mb-4 flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                      <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Coincidencias Exactas ({searchResults.exact_matches.length})
                      </span>
                    </h4>
                    <div className="grid gap-6">
                      {searchResults.exact_matches.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="border-2 border-green-200/50 rounded-xl p-4 bg-gradient-to-br from-green-50 to-emerald-50/30 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold text-gray-900">{item.name}</h5>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {item.type === 'producto' ? 'Producto' : 'Servicio'}
                                </span>
                                {item.is_featured && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Destacado
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                              <div className="text-xs text-gray-500 space-y-1">
                                <div>Categoría: {item.category}</div>
                                <div>Proveedor: {item.provider}</div>
                                {item.sku && <div>SKU: {item.sku}</div>}
                                {item.modality && <div>Modalidad: {item.modality}</div>}
                                {item.technical_details && <div>Detalles: {item.technical_details.substring(0, 100)}...</div>}
                              </div>
                              <div className="text-xs text-green-700 mt-2 font-medium">
                                💡 {item.reasoning}
                              </div>
                            </div>
                            <button
                              onClick={() => navigateToItem(item)}
                              className="ml-4 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              Ver Detalles
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Coincidencias cercanas */}
                {searchResults.near_matches.length > 0 && (
                  <div className="py-8 px-8">
                    <h4 className="font-bold text-yellow-700 mb-4 flex items-center gap-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">🔍</span>
                      </div>
                      <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                        Coincidencias Cercanas ({searchResults.near_matches.length})
                      </span>
                    </h4>
                    <div className="grid gap-6">
                      {searchResults.near_matches.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="border-2 border-yellow-200/50 rounded-xl p-4 bg-gradient-to-br from-yellow-50 to-orange-50/30 shadow-sm hover:shadow-md transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h5 className="font-semibold text-gray-900">{item.name}</h5>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {item.type === 'producto' ? 'Producto' : 'Servicio'}
                                </span>
                                {item.is_featured && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Destacado
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                              <div className="text-xs text-gray-500 space-y-1">
                                <div>Categoría: {item.category}</div>
                                <div>Proveedor: {item.provider}</div>
                                {item.sku && <div>SKU: {item.sku}</div>}
                                {item.modality && <div>Modalidad: {item.modality}</div>}
                                {item.technical_details && <div>Detalles: {item.technical_details.substring(0, 100)}...</div>}
                              </div>
                              <div className="text-xs text-yellow-700 mt-2 font-medium">
                                💡 {item.reasoning}
                              </div>
                            </div>
                            <button
                              onClick={() => navigateToItem(item)}
                              className="ml-4 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              Ver Detalles
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sin resultados */}
                {searchResults.exact_matches.length === 0 && searchResults.near_matches.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MagnifyingGlassIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent mb-2">
                      🤖 IA no encontró resultados
                    </h3>
                    <p className="text-gray-600 mb-6">Intenta con términos más específicos o diferentes</p>
                    <button
                      onClick={clearSearch}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      🔄 Nueva Búsqueda IA
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" id="featured-items">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DocumentTextIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Cotizaciones</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.total_quotes_sent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.pending_quotes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Con Respuestas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.quotes_with_responses}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">Nueva Cotización</h2>
                  <p className="text-gray-600">Solicita cotizaciones de productos o servicios</p>
                </div>
                <button 
                  onClick={() => router.push('/client/products')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Crear Cotización
                </button>
              </div>
            </div>

            {/* Recent Quotes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Cotizaciones Recientes</h2>
              </div>
              
              {stats?.recent_quotes && stats.recent_quotes.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {stats.recent_quotes.map((quote) => (
                    <div key={quote.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-gray-900">{quote.item_name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              quote.status === 'respondida' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {quote.status === 'respondida' ? 'Respondida' : 'Pendiente'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {quote.item_type === 'producto' ? 'Producto' : 'Servicio'} • 
                            {new Date(quote.created_at).toLocaleDateString()}
                            {quote.responses_count > 0 && (
                              <span className="ml-2 text-blue-600">
                                • {quote.responses_count} respuesta{quote.responses_count !== 1 ? 's' : ''}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => router.push(`/client/quotes/${quote.id}`)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Ver
                          </button>
                          <ArrowRightIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cotizaciones</h3>
                  <p className="text-gray-600 mb-6">Comienza creando tu primera cotización</p>
                  <button 
                    onClick={() => router.push('/client/products')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Crear Primera Cotización
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Tour Invitation Toast */}
        {showTourInvitation && (
          <div className="fixed bottom-4 right-4 z-50">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    ¿Es tu primera vez aquí?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Un tour rápido te mostrará cómo sacar el máximo provecho a Vantage.ai.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleStartTour}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                      Hacer el Tour
                    </button>
                    <button
                      onClick={handleSkipTour}
                      className="inline-flex items-center px-4 py-2 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
} 