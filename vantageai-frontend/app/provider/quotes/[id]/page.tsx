'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ProtectedRoute } from '@/app/components/auth/ProtectedRoute';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';
import { 
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  TagIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface QuoteRequest {
  id: number;
  item_name: string;
  item_type: 'producto' | 'servicio';
  description: string;
  technical_requirements: string;
  quantity: number;
  unit: string;
  urgency_level: string;
  status: string;
  created_at: string;
  client: {
    id: number;
    full_name: string;
    email: string;
    company: {
      company_name: string;
      industry: string;
    } | null;
  };
  responses_count: number;
}

interface UploadResponse {
  success: boolean;
  message: string;
  response_id?: number;
}

export default function ProviderQuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;
  
  const [quoteRequest, setQuoteRequest] = useState<QuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchQuoteRequest = async () => {
      try {
        const response = await apiClient.get(`/quotes/${quoteId}`);
        setQuoteRequest(response.data);
      } catch (error: any) {
        toast.error('Error al cargar la solicitud', {
          description: error.response?.data?.message || 'No se pudo cargar la información'
        });
        router.push('/provider/quotes');
      } finally {
        setLoading(false);
      }
    };

    if (quoteId) {
      fetchQuoteRequest();
    }
  }, [quoteId, router]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea un PDF
      if (file.type !== 'application/pdf') {
        toast.error('Solo se permiten archivos PDF');
        return;
      }
      
      // Validar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 10MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo PDF');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('pdf_file', selectedFile);

      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await apiClient.post(
        `/quotes/${quoteId}/responses`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(progress);
            }
          },
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data: UploadResponse = response.data;

      if (data.success) {
        toast.success('Respuesta enviada exitosamente', {
          description: 'Tu cotización ha sido procesada y será analizada por IA'
        });
        
        // Limpiar formulario
        setSelectedFile(null);
        setUploadProgress(0);
        
        // Redirigir a la lista de cotizaciones
        setTimeout(() => {
          router.push('/provider/quotes');
        }, 2000);
      } else {
        toast.error('Error al enviar la respuesta', {
          description: data.message || 'No se pudo procesar la respuesta'
        });
      }
    } catch (error: any) {
      toast.error('Error al enviar la respuesta', {
        description: error.response?.data?.message || 'Error de conexión'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'respondida':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="proveedor">
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="bg-white rounded-xl shadow-sm p-8">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded"></div>
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
      <ProtectedRoute requiredRole="proveedor">
        <DashboardLayout>
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center">
                <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Solicitud no encontrada</h3>
                <p className="text-gray-600 mb-6">La solicitud de cotización no existe o no tienes acceso</p>
                <button
                  onClick={() => router.push('/provider/quotes')}
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
    <ProtectedRoute requiredRole="proveedor">
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    Detalle de Solicitud
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Solicitud #{quoteRequest.id} • {new Date(quoteRequest.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Información de la solicitud */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {quoteRequest.item_name}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          quoteRequest.item_type === 'producto' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {quoteRequest.item_type === 'producto' ? 'Producto' : 'Servicio'}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quoteRequest.status)}`}>
                          {quoteRequest.status}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(quoteRequest.urgency_level)}`}>
                          Urgencia: {quoteRequest.urgency_level}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Respuestas</div>
                      <div className="text-2xl font-bold text-blue-600">{quoteRequest.responses_count}</div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Descripción */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
                      <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
                        {quoteRequest.description}
                      </p>
                    </div>

                    {/* Requisitos técnicos */}
                    {quoteRequest.technical_requirements && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Requisitos Técnicos</h3>
                        <p className="text-gray-700 bg-gray-50 rounded-lg p-4">
                          {quoteRequest.technical_requirements}
                        </p>
                      </div>
                    )}

                    {/* Detalles de cantidad */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-blue-600">Cantidad</div>
                        <div className="text-2xl font-bold text-blue-900">{quoteRequest.quantity}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-purple-600">Unidad</div>
                        <div className="text-2xl font-bold text-purple-900">{quoteRequest.unit}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-green-600">Fecha de Creación</div>
                        <div className="text-lg font-semibold text-green-900">
                          {new Date(quoteRequest.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del cliente y formulario de respuesta */}
              <div className="space-y-6">
                {/* Información del cliente */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                    Información del Cliente
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-gray-600">Cliente</div>
                      <div className="text-gray-900 font-semibold">{quoteRequest.client.full_name}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-gray-600">Email</div>
                      <div className="text-gray-900">{quoteRequest.client.email}</div>
                    </div>
                    
                    {quoteRequest.client.company && (
                      <>
                        <div>
                          <div className="text-sm font-medium text-gray-600">Empresa</div>
                          <div className="text-gray-900 font-semibold">{quoteRequest.client.company.company_name}</div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-gray-600">Industria</div>
                          <div className="text-gray-900">{quoteRequest.client.company.industry}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Formulario de respuesta */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <PaperAirplaneIcon className="w-5 h-5 text-green-600" />
                    Enviar Respuesta
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Selección de archivo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Documento PDF de Cotización
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="pdf-upload"
                          disabled={uploading}
                        />
                        <label
                          htmlFor="pdf-upload"
                          className="cursor-pointer"
                        >
                          {selectedFile ? (
                            <div className="space-y-2">
                              <CheckCircleIcon className="w-8 h-8 text-green-600 mx-auto" />
                              <div className="text-sm font-medium text-gray-900">
                                {selectedFile.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <DocumentTextIcon className="w-8 h-8 text-gray-400 mx-auto" />
                              <div className="text-sm font-medium text-gray-900">
                                Seleccionar archivo PDF
                              </div>
                              <div className="text-xs text-gray-500">
                                Máximo 10MB
                              </div>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subiendo archivo...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Botón de envío */}
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                      {uploading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Enviando...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <PaperAirplaneIcon className="w-4 h-4" />
                          <span>Enviar Cotización</span>
                        </div>
                      )}
                    </button>

                    {/* Información adicional */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex items-center gap-1">
                        <CheckCircleIcon className="w-3 h-3 text-green-600" />
                        <span>El documento será analizado por IA</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ExclamationTriangleIcon className="w-3 h-3 text-yellow-600" />
                        <span>Solo se aceptan archivos PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
} 