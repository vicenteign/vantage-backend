'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { LoadingSkeleton } from '@/app/components/ui/LoadingSkeleton';
import apiClient from '@/app/lib/api';
import Link from 'next/link';

interface QuoteRequest {
  id: number;
  item_name: string;
  item_type: string;
  status: string;
  created_at: string;
  responses?: any[];
  provider?: {
    name: string;
  };
  has_response?: boolean;
}

interface QuoteListProps {
  userRole: string;
}

export function QuoteList({ userRole }: QuoteListProps) {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const endpoint = userRole === 'proveedor' ? '/quotes/received' : '/quotes/my-requests';
      const response = await apiClient.get(endpoint);
      const quotesData = response.data.quote_requests || [];
      setQuotes(quotesData);
    } catch (error) {
      console.error('Error fetching quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPdf = (quoteId: number) => {
    window.open(`/api/quotes/${quoteId}/pdf`, '_blank');
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

  const filteredQuotes = quotes.filter(quote =>
    quote.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.item_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Buscar cotizaciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setSearchTerm('')}
            variant="outline"
            className="whitespace-nowrap"
          >
            Limpiar
          </Button>
        </div>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">
            {searchTerm ? 'No se encontraron cotizaciones que coincidan con tu búsqueda.' : 'No hay cotizaciones disponibles.'}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {quote.item_name}
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {quote.item_type}
                        </span>
                        {getStatusBadge(quote.status)}
                        {quote.responses && quote.responses.length > 0 && (
                          <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            {quote.responses.length} respuesta{quote.responses.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Creada el {new Date(quote.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {userRole === 'proveedor' ? (
                    <>
                      <Link href={`/provider/quotes/${quote.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Detalles
                        </Button>
                      </Link>
                      <Link href={`/provider/quotes/${quote.id}`}>
                        <Button size="sm">
                          Responder / Subir PDF
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link href={`/client/quotes/${quote.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalles
                      </Button>
                    </Link>
                  )}
                  {quote.responses && quote.responses.length > 0 && (
                    <Button onClick={() => openPdf(quote.id)} variant="outline" size="sm">
                      Ver PDFs
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          Mostrando {filteredQuotes.length} de {quotes.length} cotizaciones
        </div>
      </div>
    </div>
  );
} 