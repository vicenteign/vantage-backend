'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, BuildingOfficeIcon, GlobeAltIcon, DocumentTextIcon, PhoneIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';
import { QuoteRequestForm } from '@/app/components/quotes/QuoteRequestForm';

interface ServiceDetail {
  id: number;
  name: string;
  description: string;
  modality: string;
  status: string;
  is_featured: boolean;
  provider: {
    id: number;
    company_name: string;
    about_us: string;
    logo_url: string;
    brochure_pdf_url: string;
    website_url: string;
    contacts: Array<{
      name: string;
      email: string;
      phone: string;
      position: string;
      is_primary: boolean;
    }>;
    certifications: Array<{
      name: string;
      file_url: string;
      expiry_date: string | null;
      uploaded_at: string;
    }>;
  };
  category: {
    id: number;
    name: string;
  };
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/public/services/${params.id}`);
        if (!response.ok) {
          throw new Error('Servicio no encontrado');
        }
        const data = await response.json();
        setService(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el servicio');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id]);

  const handleRequestQuote = () => {
    setShowQuoteModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Servicio no encontrado'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Volver
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRequestQuote}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Solicitar Cotización
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del Servicio */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{service.name}</h1>
                  {service.is_featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Destacado
                    </span>
                  )}
                </div>
              </div>

              {service.category && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {service.category.name}
                  </span>
                </div>
              )}

              {service.modality && (
                <div className="mb-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {service.modality}
                  </span>
                </div>
              )}

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                <p className="text-gray-700 mb-6">{service.description}</p>
              </div>
            </div>
          </div>

          {/* Información del Proveedor */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center mb-4">
                {service.provider.logo_url ? (
                  <img
                    src={service.provider.logo_url}
                    alt={service.provider.company_name}
                    className="w-12 h-12 rounded-lg object-cover mr-3"
                  />
                ) : (
                  <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mr-3" />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{service.provider.company_name}</h3>
                </div>
              </div>

              {service.provider.about_us && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Acerca de nosotros</h4>
                  <p className="text-sm text-gray-600">{service.provider.about_us}</p>
                </div>
              )}

              {service.provider.website_url && (
                <div className="mb-4">
                  <a
                    href={service.provider.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <GlobeAltIcon className="w-4 h-4 mr-2" />
                    Visitar sitio web
                  </a>
                </div>
              )}

              {service.provider.brochure_pdf_url && (
                <div className="mb-4">
                  <a
                    href={service.provider.brochure_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Descargar folleto
                  </a>
                </div>
              )}
            </div>

            {/* Contactos */}
            {service.provider.contacts && service.provider.contacts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contactos</h3>
                <div className="space-y-3">
                  {service.provider.contacts.map((contact, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center mb-1">
                        <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="font-medium text-gray-900">{contact.name}</span>
                        {contact.is_primary && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Principal
                          </span>
                        )}
                      </div>
                      {contact.position && (
                        <p className="text-sm text-gray-600 mb-1">{contact.position}</p>
                      )}
                      {contact.email && (
                        <div className="flex items-center text-sm text-gray-600 mb-1">
                          <EnvelopeIcon className="w-4 h-4 mr-2" />
                          <a href={`mailto:${contact.email}`} className="hover:text-blue-600">
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="w-4 h-4 mr-2" />
                          <a href={`tel:${contact.phone}`} className="hover:text-blue-600">
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificaciones */}
            {service.provider.certifications && service.provider.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificaciones</h3>
                <div className="space-y-3">
                  {service.provider.certifications.map((cert, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{cert.name}</h4>
                        {cert.file_url && (
                          <a
                            href={cert.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Ver
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        <p>Subido: {new Date(cert.uploaded_at).toLocaleDateString()}</p>
                        {cert.expiry_date && (
                          <p>Vence: {new Date(cert.expiry_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cotización */}
      {showQuoteModal && service && (
        <QuoteRequestForm
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          item={{
            id: service.id,
            name: service.name,
            type: 'servicio' as const,
            provider_id: service.provider.id,
            provider_name: service.provider.company_name,
          }}
          onSuccess={() => {
            setShowQuoteModal(false);
            // Opcional: redirigir a la página de cotizaciones
            // router.push('/client/quotes');
          }}
        />
      )}
    </div>
  );
} 