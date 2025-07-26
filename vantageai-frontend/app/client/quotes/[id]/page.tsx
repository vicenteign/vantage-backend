"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Quote {
  id: number;
  client: any;
  provider: any;
  item: any;
  quantity: number;
  message: string;
  created_at: string;
  status: string;
  attachments: any[];
}

interface QuoteResponse {
  id: number;
  provider_id: number;
  response_pdf_url: string;
  total_price: number;
  currency: string;
  certifications_count: number;
  ia_data: any;
  created_at: string;
}

export default function QuoteDetailPage({ params }: { params: { id: string } }) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [responses, setResponses] = useState<QuoteResponse[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const quoteId = params.id;
  const [iaLoading, setIaLoading] = useState(false);
  const [iaResult, setIaResult] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Usar el cliente API configurado que incluye el token JWT
        const apiClient = (await import('../../../lib/api')).default;
        
        const res1 = await apiClient.get(`/api/quotes/${quoteId}`);
        setQuote(res1.data.quote);
        
        const res2 = await apiClient.get(`/api/quotes/${quoteId}/responses`);
        setResponses(res2.data.responses || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [quoteId]);

  const filteredResponses = responses.filter(r => {
    if (!filter) return true;
    // Filtro IA: busca en todos los campos stringificables
    return JSON.stringify(r).toLowerCase().includes(filter.toLowerCase());
  });

  async function handleIaFilter() {
    setIaLoading(true);
    setIaResult(null);
    try {
      // Usar el cliente API configurado
      const apiClient = (await import('../../../lib/api')).default;
      
      const response = await apiClient.post('/api/ia/analyze-quotes', {
        pdfs: responses.map(r => ({
          id: r.id,
          pdf_url: `${process.env.NEXT_PUBLIC_API_URL}/uploads/quotes/${r.response_pdf_url.split('/').pop()}`
        }))
      });
      
      const data = response.data;
      setIaResult(data);
      
      // Si la IA devuelve resultados, los mostramos en la tabla
      if (data && data.results) {
        // Mapeo: id -> ia_result
        const iaMap = Object.fromEntries(data.results.map((r: any) => [r.id, r.ia_result]));
        setResponses(responses.map(r => ({ ...r, ia_data: iaMap[r.id] })));
      }
    } catch (err: any) {
      console.error('Error en análisis IA:', err);
      setIaResult({ error: err.response?.data?.error || "Error al filtrar con IA" });
    } finally {
      setIaLoading(false);
    }
  }

  if (loading) return <div>Cargando...</div>;
  if (!quote) return <div>No se encontró la cotización.</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Detalle de Cotización</h1>
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="font-semibold mb-2">Resumen de la Solicitud</h2>
        <div><b>Producto/Servicio:</b> {quote.item.name} ({quote.item.type})</div>
        <div><b>Cantidad:</b> {quote.quantity}</div>
        <div><b>Mensaje:</b> {quote.message}</div>
        <div><b>Fecha:</b> {new Date(quote.created_at).toLocaleString()}</div>
        <div><b>Proveedor:</b> {quote.provider.name}</div>
        <div><b>Estado:</b> {quote.status}</div>
      </div>
      <div className="bg-white rounded shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Análisis de Respuestas con IA</h2>
          <button
            onClick={handleIaFilter}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
            disabled={iaLoading || responses.length === 0}
          >
            {iaLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analizando...
              </>
            ) : (
              <>
                🤖 Analizar con IA
              </>
            )}
          </button>
        </div>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="🔍 Buscar en las cotizaciones..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        {/* Contador de respuestas */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              📊 {responses.length} respuesta{responses.length !== 1 ? 's' : ''} recibida{responses.length !== 1 ? 's' : ''}
            </span>
            {responses.length > 0 && (
              <span className="text-sm text-gray-600">
                💰 Rango de precios: ${Math.min(...responses.map(r => r.total_price || 0)).toLocaleString()} - ${Math.max(...responses.map(r => r.total_price || 0)).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Resultados de IA */}
        {iaResult && iaResult.summary && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-900 p-4 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🤖</div>
              <div>
                <h3 className="font-semibold mb-1">Análisis IA Completado</h3>
                <p className="text-sm">{iaResult.summary}</p>
              </div>
            </div>
          </div>
        )}
        {iaResult && iaResult.error && (
          <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-lg mb-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="font-semibold mb-1">Error en Análisis IA</h3>
                <p className="text-sm">{iaResult.error}</p>
              </div>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Total</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moneda</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificaciones</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Análisis IA</th>
                <th className="border-b border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documento</th>
              </tr>
            </thead>
            <tbody>
              {filteredResponses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl">📋</div>
                      <div>No hay respuestas para mostrar</div>
                    </div>
                  </td>
                </tr>
              )}
              {filteredResponses.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border-b border-gray-200 px-4 py-3">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">Proveedor #{r.provider_id}</div>
                      <div className="text-gray-500 text-xs">
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {r.total_price ? `$${r.total_price.toLocaleString()}` : '-'}
                    </div>
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {r.currency ?? 'N/A'}
                    </span>
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {r.certifications_count ?? 0} cert.
                    </span>
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3 text-xs">
                    {r.ia_data ? (
                      <div className="max-w-xs truncate" title={JSON.stringify(r.ia_data)}>
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {typeof r.ia_data === 'string' ? r.ia_data : 'Análisis disponible'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Pendiente</span>
                    )}
                  </td>
                  <td className="border-b border-gray-200 px-4 py-3">
                    {r.response_pdf_url && r.response_pdf_url !== '/static/uploads/quotes/null' ? (
                      <a
                        href={`${process.env.NEXT_PUBLIC_API_URL}/uploads/quotes/${r.response_pdf_url.split('/').pop()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        📄 Ver PDF
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin archivo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 