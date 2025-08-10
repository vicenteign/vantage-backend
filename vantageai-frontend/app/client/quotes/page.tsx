'use client';

import { useEffect, useMemo, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { LoadingSkeleton } from '@/app/components/ui/LoadingSkeleton';
import { ExecutiveSummary } from '@/app/components/quotes/ExecutiveSummary';
import { ComparisonTable } from '@/app/components/quotes/ComparisonTable';
import { HighlightCards } from '@/app/components/quotes/HighlightCards';
import { RiskCenter } from '@/app/components/quotes/RiskCenter';
import { DetailedAnalytics } from '@/app/components/quotes/DetailedAnalytics';
import { RecommendedActions } from '@/app/components/quotes/RecommendedActions';
import apiClient from '@/app/lib/api';

export default function ClientQuotesPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/quotes/my-requests');
      const quotesData = res.data?.quote_requests || [];
      setQuotes(quotesData);
      if (quotesData.length > 0) {
        // Preferir una respondida si existe
        const firstResponded = quotesData.find((q: any) => q.status === 'respondida');
        const defaultId = (firstResponded || quotesData[0]).id;
        setSelectedQuoteId(defaultId);
        await fetchAnalysis(defaultId);
      }
    } catch (e) {
      console.error('Error fetching quotes:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (quoteId: number) => {
    if (!quoteId) return;
    try {
      setLoadingAnalysis(true);
      const res = await apiClient.get(`/api/quotes/${quoteId}/full-analysis`);
      setAnalysis(res.data || null);
    } catch (e) {
      console.error('Error fetching analysis:', e);
      setAnalysis(null);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const comparisonResponses = useMemo(() => {
    if (!analysis) return [];
    return (analysis.analisis_comparativo || []).map((r: any) => ({
      proveedor: r.proveedor,
      analisis_ia: r.analisis_ia,
      sugerencia_ia: r.sugerencia_ia,
      pros: r.pros || r.puntos_fuertes || [],
      cons: r.cons || r.puntos_debiles || [],
    }));
  }, [analysis]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <LoadingSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Centro de Análisis de Cotizaciones</h1>
          <p className="text-gray-600 mt-2">Analiza aquí cualquier cotización</p>
        </div>

        {/* Selector de cotización */}
        {quotes.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Selecciona una cotización</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedQuoteId || ''}
              onChange={async (e) => {
                const id = Number(e.target.value);
                setSelectedQuoteId(id);
                await fetchAnalysis(id);
              }}
            >
              {quotes.map((q: any) => (
                <option key={q.id} value={q.id}>
                  {q.item_name || q.item_name_snapshot || `#${q.id}`} {q.status === 'respondida' ? '• Respondida' : '• Pendiente'}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay cotizaciones disponibles</h3>
            <p className="text-gray-600 mb-4">Crea una solicitud para ver su análisis aquí.</p>
          </div>
        )}

        {/* Contenido de análisis (trasladado desde el detalle) */}
        {selectedQuoteId && (
          <div className="space-y-8">
            {loadingAnalysis ? (
              <LoadingSkeleton />)
              : analysis ? (
                <>
                  <ExecutiveSummary data={analysis.resumen_ejecutivo} />

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Comparación de Respuestas</h3>
                    </div>
                    <ComparisonTable responses={comparisonResponses} quoteId={String(selectedQuoteId)} />
                  </div>

                  <HighlightCards data={analysis.mejores_opciones} />
                  <RiskCenter data={analysis.centro_de_riesgos} />
                  <DetailedAnalytics stats={analysis.analisis_detallado} />
                  <RecommendedActions data={analysis.acciones_recomendadas} />
                </>
              ) : (
                <div className="text-sm text-gray-600">Aún no hay análisis disponible para esta cotización.</div>
              )
            }
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}