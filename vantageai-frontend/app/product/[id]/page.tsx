'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon, 
  BuildingOfficeIcon, 
  GlobeAltIcon, 
  DocumentTextIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  UserIcon,
  StarIcon,
  EyeIcon,
  CheckCircleIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ArrowTopRightOnSquareIcon,
  SparklesIcon,
  CogIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { QuoteRequestForm } from '@/app/components/quotes/QuoteRequestForm';

interface ProductDetail {
  id: number;
  name: string;
  description: string;
  technical_details: string;
  sku: string;
  status: string;
  is_featured: boolean;
  main_image_url: string;
  additional_images: string[];
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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/catalog/public/products/${params.id}`);
        if (!response.ok) {
          throw new Error('Producto no encontrado');
        }
        const data = await response.json();
        setProduct(data);
        if (data.main_image_url) {
          setSelectedImage(data.main_image_url);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleRequestQuote = () => {
    setShowQuoteModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <EyeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600 mb-6">{error || 'El producto que buscas no existe o ha sido removido.'}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 inline mr-2" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              <span>Volver</span>
            </button>
            <button
              onClick={handleRequestQuote}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              Solicitar Cotización
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del Producto */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card principal del producto */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {product.is_featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <StarIcon className="w-3 h-3 mr-1" />
                          Destacado
                        </span>
                      )}
                      {product.category && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {product.category.name}
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{product.name}</h1>
                  </div>
                  <div className="text-right ml-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 font-medium">SKU</p>
                      <p className="font-mono text-gray-900 text-sm font-bold">{product.sku}</p>
                    </div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                    Descripción
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>

                  {/* Galería de imágenes simplificada */}
                  {(product.main_image_url || product.additional_images?.length > 0) && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <PhotoIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Imágenes
                      </h3>
                      
                      {/* Imagen principal */}
                      {selectedImage && (
                        <div className="mb-4">
                          <div className="relative rounded-lg overflow-hidden">
                            <img
                              src={selectedImage}
                              alt={product.name}
                              className="w-full h-64 object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {/* Miniaturas */}
                      <div className="grid grid-cols-4 gap-3">
                        {product.main_image_url && (
                          <button
                            onClick={() => setSelectedImage(product.main_image_url)}
                            className={`relative rounded-lg overflow-hidden ${
                              selectedImage === product.main_image_url ? 'ring-2 ring-blue-500' : ''
                            }`}
                          >
                            <img
                              src={product.main_image_url}
                              alt={product.name}
                              className="w-full h-20 object-cover"
                            />
                          </button>
                        )}
                        
                        {product.additional_images?.map((imageUrl, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(imageUrl)}
                            className={`relative rounded-lg overflow-hidden ${
                              selectedImage === imageUrl ? 'ring-2 ring-blue-500' : ''
                            }`}
                          >
                            <img
                              src={imageUrl}
                              alt={`${product.name} - Imagen ${index + 1}`}
                              className="w-full h-20 object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detalles técnicos */}
                  {product.technical_details && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <CogIcon className="w-5 h-5 mr-2 text-blue-600" />
                        Detalles Técnicos
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                          {product.technical_details}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar con información del proveedor */}
          <div className="lg:col-span-1 space-y-6">
            {/* Card del proveedor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <div className="bg-blue-600 p-4 text-white rounded-t-lg">
                <div className="flex items-center">
                  {product.provider.logo_url ? (
                    <img
                      src={product.provider.logo_url}
                      alt={product.provider.company_name}
                      className="w-12 h-12 rounded-lg object-cover mr-3 border border-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center mr-3">
                      <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold">{product.provider.company_name}</h3>
                    <p className="text-blue-100 text-sm">Proveedor Verificado</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {product.provider.about_us && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <UserIcon className="w-4 h-4 mr-2 text-blue-600" />
                      Acerca de nosotros
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{product.provider.about_us}</p>
                  </div>
                )}

                <div className="space-y-2">
                  {product.provider.website_url && (
                    <a
                      href={product.provider.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center">
                        <GlobeAltIcon className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Sitio web</span>
                      </div>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </a>
                  )}

                  {product.provider.brochure_pdf_url && (
                    <a
                      href={product.provider.brochure_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center">
                        <DocumentArrowDownIcon className="w-4 h-4 mr-2 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">Descargar folleto</span>
                      </div>
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Contactos */}
            {product.provider.contacts && product.provider.contacts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="bg-green-600 p-4 text-white rounded-t-lg">
                  <h3 className="text-lg font-bold flex items-center">
                    <PhoneIcon className="w-5 h-5 mr-2" />
                    Contactos
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {product.provider.contacts.map((contact, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-3 bg-gray-50 rounded-r-lg p-3">
                        <div className="flex items-center mb-1">
                          <UserIcon className="w-4 h-4 text-green-600 mr-2" />
                          <span className="font-semibold text-gray-900 text-sm">{contact.name}</span>
                          {contact.is_primary && (
                            <span className="ml-2 inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              Principal
                            </span>
                          )}
                        </div>
                        {contact.position && (
                          <p className="text-xs text-gray-600 mb-2 font-medium">{contact.position}</p>
                        )}
                        <div className="space-y-1">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="flex items-center text-xs text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <EnvelopeIcon className="w-3 h-3 mr-1 text-gray-400" />
                              {contact.email}
                            </a>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="flex items-center text-xs text-gray-600 hover:text-green-600 transition-colors"
                            >
                              <PhoneIcon className="w-3 h-3 mr-1 text-gray-400" />
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Certificaciones */}
            {product.provider.certifications && product.provider.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="bg-purple-600 p-4 text-white rounded-t-lg">
                  <h3 className="text-lg font-bold flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Certificaciones
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {product.provider.certifications.map((cert, index) => (
                      <div key={index} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">{cert.name}</h4>
                          {cert.file_url && (
                            <a
                              href={cert.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-800 text-xs font-medium flex items-center"
                            >
                              <DocumentTextIcon className="w-3 h-3 mr-1" />
                              Ver
                            </a>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center">
                            <CalendarIcon className="w-3 h-3 mr-1 text-gray-400" />
                            <span>Subido: {new Date(cert.uploaded_at).toLocaleDateString()}</span>
                          </div>
                          {cert.expiry_date && (
                            <div className="flex items-center">
                              <CalendarIcon className="w-3 h-3 mr-1 text-gray-400" />
                              <span>Vence: {new Date(cert.expiry_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Cotización */}
      {showQuoteModal && product && (
        <QuoteRequestForm
          isOpen={showQuoteModal}
          onClose={() => setShowQuoteModal(false)}
          item={{
            id: product.id,
            name: product.name,
            type: 'producto' as const,
            provider_id: product.provider.id,
            provider_name: product.provider.company_name,
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