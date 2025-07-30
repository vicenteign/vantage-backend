'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';
import { 
  DocumentTextIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  StarIcon,
  ArrowLeftIcon,
  EyeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface QuoteResponse {
  id: number;
  provider: {
    id: number;
    company_name: string;
  };
  total_price: number;
  currency: string;
  delivery_time: string;
  certifications_count: number;
  certifications: string[];
  pdf_url: string;
  created_at: string;
  ai_analysis: {
    price_analysis: string;
    delivery_analysis: string;
    quality_analysis: string;
    recommendation: string;
  };
}

interface QuoteRequest {
  id: number;
  item_name: string;
  item_type: 'producto' | 'servicio';
  description: string;
  status: string;
  created_at: string;
  responses_count: number;
}

export default function ClientQuoteAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;
  
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [responses, setResponses] = useState<QuoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<'price' | 'delivery' | 'certifications' | 'date'>('price');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchQuoteData = async () => {
      try {
        const [quoteResponse, responsesResponse] = await Promise.all([
          apiClient.get(`/quotes/${quoteId}`),
          apiClient.get(`/quotes/${quoteId}/responses`)
        ]);
        
        setQuoteRequest(quoteResponse.data);
        setResponses(responsesResponse.data.responses || []);
      } catch (error: any) {
        toast.error('Error al cargar la cotización', {
          description: error.response?.data?.message || 'No se pudo cargar la información'
        });
        router.push('/client/quotes');
      } finally {
        setLoading(false);
      }
    };

    if (quoteId) {
      fetchQuoteData();
    }
  }, [quoteId, router]);

  // Filtrar y ordenar respuestas
  const filteredAndSortedResponses = responses
    .filter(response => {
      if (!filterQuery) return true;
      
      const query = filterQuery.toLowerCase();
      return (
        response.provider.company_name.toLowerCase().includes(query) ||
        response.total_price.toString().includes(query) ||
        response.currency.toLowerCase().includes(query) ||
        response.delivery_time.toLowerCase().includes(query) ||
        response.certifications.some(cert => cert.toLowerCase().includes(query)) ||
        response.ai_analysis.price_analysis.toLowerCase().includes(query) ||
        response.ai_analysis.quality_analysis.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'price':
          aValue = a.total_price;
          bValue = b.total_price;
          break;
        case 'delivery':
          // Extraer días de delivery_time (ej: "30 días" -> 30)
          aValue = parseInt(a.delivery_time.match(/\d+/)?.[0] || '0');
          bValue = parseInt(b.delivery_time.match(/\d+/)?.[0] || '0');
          break;
        case 'certifications':
          aValue = a.certifications_count;
          bValue = b.certifications_count;
          break;
        case 'date':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (field: 'price' | 'delivery' | 'certifications' | 'date') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const openPdf = (pdfUrl: string) => {
    window.open(pdfUrl, '_blank');
  };

  const getPriceColor = (price: number, responses: QuoteResponse[]) => {
    const prices = responses.map(r => r.total_price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (price === minPrice) return 'text-green-600 font-bold';
    if (price === maxPrice) return 'text-red-600 font-bold';
    return 'text-gray-900';
  };

  const getDeliveryColor = (delivery: string) => {
    const days = parseInt(delivery.match(/\d+/)?.[0] || '0');
    if (days <= 7) return 'text-green-600 font-bold';
    if (days <= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="cliente">
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!quoteRequest) {
    return (
      <ProtectedRoute requiredRole="cliente">
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cotización no encontrada</h3>
                <p className="text-gray-600 mb-6">La cotización no existe o no tienes acceso</p>
                <button
                  onClick={() => router.push('/client/quotes')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Volver a Cotizaciones
                </button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

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
                    Análisis de Cotización
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {quoteRequest.item_name} • {responses.length} respuestas recibidas
                  </p>
                </div>
              </div>
            </div>

            {/* Información de la solicitud */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{quoteRequest.item_name}</h2>
                  <p className="text-gray-600 mb-2">{quoteRequest.description}</p>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      quoteRequest.item_type === 'producto' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {quoteRequest.item_type === 'producto' ? 'Producto' : 'Servicio'}
                    </span>
                    <span className="text-sm text-gray-500">
                      Creada el {new Date(quoteRequest.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{responses.length}</div>
                  <div className="text-sm text-gray-500">Respuestas</div>
                </div>
              </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="🔍 Filtra las respuestas... (precio, proveedor, certificaciones, etc.)"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all duration-300"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Ordenar por:</span>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortBy(field as any);
                      setSortOrder(order as any);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
                  >
                    <option value="price-asc">Precio (Menor a Mayor)</option>
                    <option value="price-desc">Precio (Mayor a Menor)</option>
                    <option value="delivery-asc">Entrega (Más Rápida)</option>
                    <option value="delivery-desc">Entrega (Más Lenta)</option>
                    <option value="certifications-desc">Certificaciones (Más)</option>
                    <option value="certifications-asc">Certificaciones (Menos)</option>
                    <option value="date-desc">Fecha (Más Reciente)</option>
                    <option value="date-asc">Fecha (Más Antigua)</option>
                  </select>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                💡 Ejemplos de filtros: "2000" (precio menor a 2000), "ISO" (con certificación ISO), "ABC" (proveedor ABC)
              </div>
            </div>

            {/* Tabla de respuestas */}
            {filteredAndSortedResponses.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                          Proveedor
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('price')}
                        >
                          <div className="flex items-center gap-1">
                            Precio Total
                            {sortBy === 'price' && (
                              <span className="text-blue-600">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('delivery')}
                        >
                          <div className="flex items-center gap-1">
                            Tiempo de Entrega
                            {sortBy === 'delivery' && (
                              <span className="text-blue-600">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-6 py-4 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('certifications')}
                        >
                          <div className="flex items-center gap-1">
                            Certificaciones
                            {sortBy === 'certifications' && (
                              <span className="text-blue-600">
                                {sortOrder === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                          Análisis IA
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">
                          PDF Original
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAndSortedResponses.map((response, index) => (
                        <tr key={response.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <BuildingOfficeIcon className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  {response.provider.company_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(response.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className={`text-lg font-semibold ${getPriceColor(response.total_price, responses)}`}>
                              {response.currency} {response.total_price.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {response.ai_analysis.price_analysis}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className={`font-medium ${getDeliveryColor(response.delivery_time)}`}>
                              {response.delivery_time}
                            </div>
                            <div className="text-sm text-gray-500">
                              {response.ai_analysis.delivery_analysis}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="text-lg font-semibold text-green-600">
                                {response.certifications_count}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {response.certifications.map((cert, certIndex) => (
                                  <span
                                    key={certIndex}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                  >
                                    <CheckCircleIcon className="w-3 h-3 mr-1" />
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {response.ai_analysis.quality_analysis}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="max-w-xs">
                              <div className="text-sm text-gray-900 font-medium mb-1">
                                Recomendación IA:
                              </div>
                              <div className="text-sm text-gray-600">
                                {response.ai_analysis.recommendation}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openPdf(response.pdf_url)}
                              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <EyeIcon className="w-4 h-4 mr-2" />
                              Ver PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <DocumentTextIcon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold bg-gradient-to-r from-gray-600 to-gray-700 bg-clip-text text-transparent mb-3">
                  {filterQuery ? 'No se encontraron resultados' : 'No hay respuestas aún'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {filterQuery 
                    ? 'Intenta ajustar los filtros de búsqueda'
                    : 'Los proveedores aún no han enviado sus cotizaciones'
                  }
                </p>
                {filterQuery && (
                  <button
                    onClick={() => setFilterQuery('')}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    🔄 Limpiar Filtros
                  </button>
                )}
              </div>
            )}

            {/* Resumen de análisis */}
            {responses.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <CurrencyDollarIcon className="w-8 h-8 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Análisis de Precios</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Precio más bajo:</span>
                      <span className="font-semibold text-green-600">
                        {Math.min(...responses.map(r => r.total_price)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Precio más alto:</span>
                      <span className="font-semibold text-red-600">
                        {Math.max(...responses.map(r => r.total_price)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Promedio:</span>
                      <span className="font-semibold text-gray-900">
                        {(responses.reduce((sum, r) => sum + r.total_price, 0) / responses.length).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center gap-3 mb-4">
                    <ClockIcon className="w-8 h-8 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Tiempos de Entrega</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Más rápido:</span>
                      <span className="font-semibold text-green-600">
                        {responses.reduce((fastest, r) => {
                          const days = parseInt(r.delivery_time.match(/\d+/)?.[0] || '0');
                          const fastestDays = parseInt(fastest.match(/\d+/)?.[0] || '999');
                          return days < fastestDays ? r.delivery_time : fastest;
                        }, responses[0]?.delivery_time || '0 días')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Más lento:</span>
                      <span className="font-semibold text-red-600">
                        {responses.reduce((slowest, r) => {
                          const days = parseInt(r.delivery_time.match(/\d+/)?.[0] || '0');
                          const slowestDays = parseInt(slowest.match(/\d+/)?.[0] || '0');
                          return days > slowestDays ? r.delivery_time : slowest;
                        }, responses[0]?.delivery_time || '0 días')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <StarIcon className="w-8 h-8 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Certificaciones</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Mejor certificado:</span>
                      <span className="font-semibold text-purple-600">
                        {Math.max(...responses.map(r => r.certifications_count))} cert.
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Promedio:</span>
                      <span className="font-semibold text-gray-900">
                        {(responses.reduce((sum, r) => sum + r.certifications_count, 0) / responses.length).toFixed(1)} cert.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 