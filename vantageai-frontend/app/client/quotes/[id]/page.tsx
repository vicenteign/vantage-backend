'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ExecutiveSummary } from '@/app/components/quotes/ExecutiveSummary';
import { ComparisonTable } from '@/app/components/quotes/ComparisonTable';
import { HighlightCards } from '@/app/components/quotes/HighlightCards';
import { RiskCenter } from '@/app/components/quotes/RiskCenter';
import { DetailedAnalytics } from '@/app/components/quotes/DetailedAnalytics';
import { RecommendedActions } from '@/app/components/quotes/RecommendedActions';
import { LoadingSkeleton } from '@/app/components/ui/LoadingSkeleton';
import apiClient from '@/app/lib/api';

export default function QuoteAnalysisPage() {
  const params = useParams();
  const quoteId = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Detectar rol actual
    const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    setUserRole(role);
    if (quoteId && role === 'cliente') {
      fetchAnalysis();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId]);

  const fetchAnalysis = async () => {
    const buildFallback = () => ({
      resumen_ejecutivo: {
        analisis_general: 'Aún no hay análisis disponible.',
        entrega: 'N/A',
        certificaciones: 'N/A',
      },
      analisis_comparativo: [],
      mejores_opciones: {
        mejor_precio: { proveedor: 'N/A', valor: 'N/A' },
        entrega_rapida: { proveedor: 'N/A', valor: 'N/A' },
        mejor_certificado: { proveedor: 'N/A', valor: 'N/A' },
      },
      centro_de_riesgos: {
        riesgo_plazo: 'N/A',
        concordancia_tecnica: 'N/A',
        certificaciones_verificadas: 'N/A',
      },
      analisis_detallado: {
        precios: { minimo: '$0', maximo: '$0', promedio: '$0', total: '$0' },
        tiempos: { minimo: 'N/A', maximo: 'N/A', promedio: 'N/A', total: 'N/A' },
        certificaciones: { minimo: '0', maximo: '0', promedio: '0.0', total: '0' },
      },
      acciones_recomendadas: {
        contacto_prioritario: 'N/A',
        preguntas_clave: ['N/A'],
        criterios_decision: { prioridad_alta: 'N/A', prioridad_media: 'N/A', prioridad_baja: 'N/A' },
        timeline_sugerido: { hoy: 'N/A', esta_semana: 'N/A', proxima_semana: 'N/A' },
      },
    });
    try {
      setLoading(true);
      // Llamada directa al backend usando el apiClient (evita proxy)
      const res = await apiClient.get(`/api/quotes/${quoteId}/full-analysis`);
      setAnalysis(res.data || buildFallback());
    } catch (error: any) {
      console.error('Error fetching full analysis:', error);
      setAnalysis(buildFallback());
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <LoadingSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (!analysis) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">🧩</div>
          {userRole !== 'cliente' ? (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso de cliente requerido</h3>
              <p className="text-gray-600">Inicia sesión como cliente dueño de esta cotización para ver el análisis.</p>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay análisis disponible</h3>
              <p className="text-gray-600">Aún no se han recibido respuestas para esta cotización.</p>
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Adapt analysis data to component props where needed
  const comparisonResponses = (analysis.analisis_comparativo || []).map((r: any) => ({
    proveedor: r.proveedor,
    analisis_ia: r.analisis_ia,
    sugerencia_ia: r.sugerencia_ia,
    pros: r.pros || r.puntos_fuertes || [],
    cons: r.cons || r.puntos_debiles || [],
  }));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Centro de Análisis</h1>
          <p className="text-gray-600 mt-2">Análisis detallado de la cotización #{quoteId}</p>
        </div>

        {/* Resumen Ejecutivo */}
        <ExecutiveSummary data={analysis.resumen_ejecutivo} />

        {/* Tabla Comparativa de Respuestas (por cotización) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Comparación de Respuestas</h3>
          </div>
          <ComparisonTable responses={comparisonResponses} quoteId={quoteId} />
        </div>

        {/* Mejores Opciones */}
        <HighlightCards data={analysis.mejores_opciones} />

        {/* Centro de Riesgos */}
        <RiskCenter data={analysis.centro_de_riesgos} />

        {/* Análisis Detallado */}
        <DetailedAnalytics stats={analysis.analisis_detallado} />

        {/* Acciones Recomendadas */}
        <RecommendedActions data={analysis.acciones_recomendadas} />
      </div>
    </DashboardLayout>
  );
}

 
 