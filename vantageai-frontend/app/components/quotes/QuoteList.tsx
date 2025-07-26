"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import Link from "next/link";
import apiClient from "@/app/lib/api";

interface QuoteRequest {
  id: number;
  item_name: string;
  item_type: "producto" | "servicio";
  quantity: number;
  message: string;
  status: string;
  created_at: string;
  provider: {
    id: number;
    name: string;
  };
  has_response?: boolean;
}

interface QuoteListProps {
  userRole: "cliente" | "proveedor";
}

export function QuoteList({ userRole }: QuoteListProps) {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    total_price: '', 
    currency: '', 
    certifications_count: '',
    file: null as File | null
  });
  
  // Estados para filtro IA
  const [iaFilterQuery, setIaFilterQuery] = useState('');
  const [iaFilterLoading, setIaFilterLoading] = useState(false);
  const [iaFilterResults, setIaFilterResults] = useState<any>(null);
  const [filteredQuotes, setFilteredQuotes] = useState<QuoteRequest[]>([]);
  const [nearMatchQuotes, setNearMatchQuotes] = useState<QuoteRequest[]>([]);
  
  // Estados para visualización de PDFs
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>('');
  const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');
  const [pdfResponses, setPdfResponses] = useState<any[]>([]);
  
  // Referencias para efectos visuales
  const resultsRef = useRef<HTMLDivElement>(null);
  const [highlightResults, setHighlightResults] = useState(false);

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line
  }, [userRole]);

  useEffect(() => {
    setFilteredQuotes(quotes);
  }, [quotes]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const endpoint = userRole === "cliente" ? "/quotes/my-requests" : "/quotes/received";
      const response = await apiClient.get(endpoint);
      let quotes = response.data.quote_requests;
      
      if (userRole === "proveedor") {
        const responses = await Promise.all(
          quotes.map(async (q: any) => {
            const res = await apiClient.get(`/api/quotes/${q.id}/responses`);
            return { ...q, has_response: (res.data.responses?.length ?? 0) > 0 };
          })
        );
        quotes = responses;
      }
      setQuotes(quotes);
    } catch (error) {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleIaFilter = async () => {
    if (!iaFilterQuery.trim()) {
      setFilteredQuotes(quotes);
      setIaFilterResults(null);
      return;
    }

    setIaFilterLoading(true);
    setIaFilterResults(null);

    try {
      const apiClient = (await import('@/app/lib/api')).default;
      
      const allResponses = await Promise.all(
        quotes.map(async (quote) => {
          try {
            const response = await apiClient.get(`/api/quotes/${quote.id}/responses`);
            return {
              quote_id: quote.id,
              quote_data: quote,
              responses: response.data.responses || []
            };
          } catch (error) {
            return {
              quote_id: quote.id,
              quote_data: quote,
              responses: []
            };
          }
        })
      );

      const quotesWithResponses = allResponses.filter(item => item.responses.length > 0);

      if (quotesWithResponses.length === 0) {
        setIaFilterResults({
          message: "No hay cotizaciones con respuestas para analizar",
          filtered_quotes: []
        });
        setFilteredQuotes([]);
        return;
      }

      const analysisData = quotesWithResponses.map(item => ({
        quote_id: item.quote_id,
        quote_info: {
          item_name: item.quote_data.item_name,
          item_type: item.quote_data.item_type,
          quantity: item.quote_data.quantity,
          message: item.quote_data.message,
          created_at: item.quote_data.created_at
        },
        responses: item.responses.map((r: any) => ({
          id: r.id,
          provider_id: r.provider_id,
          total_price: r.total_price,
          currency: r.currency,
          certifications_count: r.certifications_count,
          created_at: r.created_at
        }))
      }));

      const response = await apiClient.post('/api/ia/filter-quotes', {
        query: iaFilterQuery,
        quotes_data: analysisData
      });

      const result = response.data;
      setIaFilterResults(result);

      if (result.filtered_quote_ids && result.filtered_quote_ids.length > 0) {
        const filteredIds = result.filtered_quote_ids.map((id: any) => 
          typeof id === 'string' ? parseInt(id, 10) : id
        );
        
        const filtered = quotes.filter(quote => filteredIds.includes(quote.id));
        setFilteredQuotes(filtered);
      } else {
        setFilteredQuotes([]);
      }

      if (result.near_match_quote_ids && result.near_match_quote_ids.length > 0) {
        const nearMatchIds = result.near_match_quote_ids.map((id: any) => 
          typeof id === 'string' ? parseInt(id, 10) : id
        );
        
        const nearMatches = quotes.filter(quote => nearMatchIds.includes(quote.id));
        setNearMatchQuotes(nearMatches);
      } else {
        setNearMatchQuotes([]);
      }

      // Trigger highlight effect
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({
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

    } catch (error: any) {
      setIaFilterResults({
        error: error.response?.data?.error || "Error al filtrar con IA"
      });
      setFilteredQuotes(quotes);
    } finally {
      setIaFilterLoading(false);
    }
  };

  const clearIaFilter = () => {
    setIaFilterQuery('');
    setIaFilterResults(null);
    setFilteredQuotes(quotes);
    setNearMatchQuotes([]);
  };

  const handleViewPdfs = async (quote: QuoteRequest) => {
    try {
      const response = await apiClient.get(`/api/quotes/${quote.id}/responses`);
      const responses = response.data.responses || [];
      
      if (responses.length === 0) {
        alert('Esta cotización no tiene respuestas con PDFs aún.');
        return;
      }
      
      setPdfResponses(responses);
      setSelectedPdfTitle(`PDFs de: ${quote.item_name}`);
      setShowPdfModal(true);
    } catch (error) {
      console.error('Error cargando respuestas:', error);
      alert('Error al cargar las respuestas de la cotización.');
    }
  };

  const handleUploadPdf = async () => {
    if (!selectedQuote || !formData.file) {
      setUploadError('Por favor selecciona una cotización y un archivo PDF.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', formData.file);
      formDataToSend.append('total_price', formData.total_price);
      formDataToSend.append('currency', formData.currency);
      formDataToSend.append('certifications_count', formData.certifications_count);

      const response = await apiClient.post(
        `/api/quotes/${selectedQuote.id}/responses`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setUploadSuccess('PDF subido exitosamente');
      setShowUploadForm(false);
      setFormData({ total_price: '', currency: '', certifications_count: '', file: null });
      fetchQuotes(); // Recargar cotizaciones
      
      setTimeout(() => {
        setUploadSuccess(null);
      }, 3000);
    } catch (error: any) {
      setUploadError(error.response?.data?.error || 'Error al subir el PDF');
    } finally {
      setUploading(false);
    }
  };

  const openPdf = (pdfUrl: string, providerName: string) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/quotes/${pdfUrl.split('/').pop()}`;
    setSelectedPdfUrl(fullUrl);
    setSelectedPdfTitle(`PDF de ${providerName}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pendiente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
      'respondida': { bg: 'bg-green-100', text: 'text-green-800', label: 'Respondida' },
      'cancelada': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {userRole === "cliente" ? "Mis Cotizaciones" : "Cotizaciones Recibidas"}
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando cotizaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {userRole === "proveedor" && (
            <Button 
              onClick={() => setShowUploadForm(true)} 
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              📄 Subir PDF
            </Button>
          )}
          <Button onClick={fetchQuotes} variant="outline" size="sm">
            Actualizar
          </Button>
        </div>
      </div>
      
      {/* Filtro con IA solo para clientes */}
      {userRole === "cliente" && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg">🤖</span>
              </div>
            <div>
                <h3 className="font-semibold text-gray-900">Filtro Inteligente</h3>
                <p className="text-sm text-gray-600">
                  Busca cotizaciones usando lenguaje natural
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: cotizaciones con precio menor a 26mil dólares y 2 certificaciones"
                  value={iaFilterQuery}
                  onChange={(e) => setIaFilterQuery(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleIaFilter()}
                />
                <Button
                  onClick={handleIaFilter}
                  disabled={iaFilterLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {iaFilterLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Filtrando...
                    </>
                  ) : (
                    'Filtrar'
                  )}
                </Button>
                {iaFilterQuery && (
                  <Button
                    onClick={clearIaFilter}
                    variant="outline"
                    className="px-4 py-2 rounded-lg"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                💡 Escribe en lenguaje natural: "precio menor a 1000 USD", "con certificaciones", etc.
              </p>
            </div>

            {/* Resultados del filtro IA */}
            {iaFilterResults && (
              <div className={`p-4 rounded-lg border ${
                iaFilterResults.error 
                  ? 'bg-red-50 border-red-200 text-red-900' 
                  : 'bg-green-50 border-green-200 text-green-900'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="text-lg">
                    {iaFilterResults.error ? '⚠️' : '✅'}
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">
                      {iaFilterResults.error ? 'Error en Filtro' : 'Filtro Aplicado'}
                    </h4>
                    <p className="text-sm">
                      {iaFilterResults.error || iaFilterResults.message || 
                       `Se encontraron ${filteredQuotes.length} cotización(es) que cumplen exactamente con los criterios.`}
                    </p>
                    {!iaFilterResults.error && iaFilterResults.near_match_reasoning && (
                      <p className="text-sm mt-1 text-blue-700">
                        <span className="font-medium">💡 Cotizaciones cercanas:</span> {iaFilterResults.near_match_reasoning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Resultados de cotizaciones */}
      <div>
        {/* Cotizaciones que cumplen exactamente los criterios */}
        {filteredQuotes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
              <span className="text-lg">✅</span>
              {userRole === "cliente" ? "Cotizaciones que cumplen exactamente los criterios" : "Cotizaciones filtradas"} ({filteredQuotes.length})
            </h3>
            <div className="grid gap-4">
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className="bg-white border border-green-200 rounded-lg p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{quote.item_name}</h4>
                      <div className="text-sm text-gray-600 mb-2">
                        {quote.item_type === "producto" ? "Producto" : "Servicio"} • Cantidad: {quote.quantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(quote.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(quote.status)}
                      <Button onClick={() => setSelectedQuote(quote)} size="sm" variant="outline">
                        Ver Detalles
                      </Button>
                      {userRole === "cliente" && (
                        <>
                          <Button 
                            onClick={() => handleViewPdfs(quote)} 
                            size="sm" 
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            📄 Ver PDFs
                          </Button>
                          <Link href={`/client/quotes/${quote.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              🤖 Analizar con IA
                            </Button>
                          </Link>
                        </>
                      )}
                      {userRole === "proveedor" && !quote.has_response && (
                        <Button 
                          onClick={() => {
                            setSelectedQuote(quote);
                            setShowUploadForm(true);
                          }} 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          📄 Responder
                        </Button>
                      )}
                      {userRole === "proveedor" && quote.has_response && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Respondida
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cotizaciones cercanas */}
        {nearMatchQuotes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-yellow-700 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              Cotizaciones cercanas ({nearMatchQuotes.length}) - Casi cumplen los criterios
            </h3>
            <div className="grid gap-4">
              {nearMatchQuotes.map((quote) => (
                <div key={quote.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{quote.item_name}</h4>
                      <div className="text-sm text-gray-600 mb-2">
                        {quote.item_type === "producto" ? "Producto" : "Servicio"} • Cantidad: {quote.quantity}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {new Date(quote.created_at).toLocaleString()}
                      </div>
                      <div className="text-xs text-yellow-700 font-medium">
                        💡 Esta cotización casi cumple con tus criterios
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(quote.status)}
                      <Button onClick={() => setSelectedQuote(quote)} size="sm" variant="outline">
                        Ver Detalles
                      </Button>
                      {userRole === "cliente" && (
                        <>
                          <Button 
                            onClick={() => handleViewPdfs(quote)} 
                            size="sm" 
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            📄 Ver PDFs
                          </Button>
                          <Link href={`/client/quotes/${quote.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              🤖 Analizar con IA
                            </Button>
                          </Link>
                        </>
                      )}
                      {userRole === "proveedor" && !quote.has_response && (
                        <Button 
                          onClick={() => {
                            setSelectedQuote(quote);
                            setShowUploadForm(true);
                          }} 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          📄 Responder
                        </Button>
                      )}
                      {userRole === "proveedor" && quote.has_response && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Respondida
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Todas las cotizaciones (cuando no hay filtro activo) */}
        {filteredQuotes.length === 0 && nearMatchQuotes.length === 0 && quotes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Todas las cotizaciones ({quotes.length})</h3>
            <div className="grid gap-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{quote.item_name}</h4>
                      <div className="text-sm text-gray-600 mb-2">
                        {quote.item_type === "producto" ? "Producto" : "Servicio"} • Cantidad: {quote.quantity}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(quote.created_at).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(quote.status)}
                      <Button onClick={() => setSelectedQuote(quote)} size="sm" variant="outline">
                        Ver Detalles
                      </Button>
                      {userRole === "cliente" && (
                        <>
                          <Button 
                            onClick={() => handleViewPdfs(quote)} 
                            size="sm" 
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            📄 Ver PDFs
                          </Button>
                          <Link href={`/client/quotes/${quote.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                              🤖 Analizar con IA
                            </Button>
                          </Link>
                        </>
                      )}
                      {userRole === "proveedor" && !quote.has_response && (
                        <Button 
                          onClick={() => {
                            setSelectedQuote(quote);
                            setShowUploadForm(true);
                          }} 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          📄 Responder
                        </Button>
                      )}
                      {userRole === "proveedor" && quote.has_response && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✅ Respondida
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredQuotes.length === 0 && nearMatchQuotes.length === 0 && quotes.length > 0 && iaFilterQuery && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
          <p className="text-gray-600 mb-4">No hay cotizaciones que cumplan con los criterios de búsqueda.</p>
          <Button onClick={clearIaFilter} variant="outline">
            Ver todas las cotizaciones
          </Button>
        </div>
      )}
      
      {/* Modal de detalles */}
      {selectedQuote && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedQuote(null)} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold">Detalles de la Cotización</h3>
              <button onClick={() => setSelectedQuote(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Producto/Servicio</h4>
                  <p className="text-gray-600">{selectedQuote.item_name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Tipo</h4>
                  <p className="text-gray-600 capitalize">{selectedQuote.item_type}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Cantidad</h4>
                  <p className="text-gray-600">{selectedQuote.quantity}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Mensaje</h4>
                  <p className="text-gray-600">{selectedQuote.message}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Estado</h4>
                  <div className="mt-1">{getStatusBadge(selectedQuote.status)}</div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Fecha de creación</h4>
                  <p className="text-gray-600">{new Date(selectedQuote.created_at).toLocaleString()}</p>
                </div>
                {userRole === "cliente" && (
                  <div>
                    <h4 className="font-medium text-gray-900">Proveedor</h4>
                    <p className="text-gray-600">{selectedQuote.provider.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal de PDFs */}
      {showPdfModal && (
        <Modal
          isOpen={showPdfModal}
          onClose={() => setShowPdfModal(false)}
          title={selectedPdfTitle}
          size="lg"
        >
          <div className="space-y-4">
            {pdfResponses.map((response, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Respuesta #{response.id}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(response.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <p>Precio: ${response.total_price} {response.currency}</p>
                  <p>Certificaciones: {response.certifications_count}</p>
                </div>
                {response.response_pdf_url && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/quotes/${response.response_pdf_url.split('/').pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📄 Ver PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* Modal para subir PDF (solo para proveedores) */}
      {showUploadForm && userRole === "proveedor" && (
        <Modal
          isOpen={showUploadForm}
          onClose={() => setShowUploadForm(false)}
          title="Subir PDF de Cotización"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Cotización
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => {
                  const quoteId = parseInt(e.target.value);
                  setSelectedQuote(quotes.find(q => q.id === quoteId) || null);
                }}
              >
                <option value="">Selecciona una cotización...</option>
                {quotes.filter(q => !q.has_response).map(quote => (
                  <option key={quote.id} value={quote.id}>
                    {quote.item_name} - {quote.item_type} (ID: {quote.id})
                  </option>
                ))}
              </select>
            </div>

            {selectedQuote && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Detalles de la Cotización</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Producto:</strong> {selectedQuote.item_name}</p>
                    <p><strong>Cantidad:</strong> {selectedQuote.quantity}</p>
                    <p><strong>Mensaje:</strong> {selectedQuote.message}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Archivo PDF
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    ref={fileInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFormData(prev => ({ ...prev, file }));
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Total
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.total_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, total_price: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Moneda
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="USD">USD</option>
                      <option value="CLP">CLP</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Certificaciones
                  </label>
                  <input
                    type="number"
                    value={formData.certifications_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, certifications_count: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-800 text-sm">{uploadError}</p>
                  </div>
                )}

                {uploadSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm">{uploadSuccess}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleUploadPdf}
                    disabled={uploading || !selectedQuote || !formData.file}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Subiendo...
                      </>
                    ) : (
                      'Subir PDF'
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowUploadForm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
} 