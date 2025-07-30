'use client';

import { useState, useRef } from 'react';
import { DocumentIcon, ChevronLeftIcon, AcademicCapIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

interface ProviderCertificationsStepProps {
  onNext: () => void;
  onBack: () => void;
  companyData: any;
  setCompanyData: (data: any) => void;
}

export function ProviderCertificationsStep({ onNext, onBack, companyData, setCompanyData }: ProviderCertificationsStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const brochureInputRef = useRef<HTMLInputElement>(null);
  const certificationInputRef = useRef<HTMLInputElement>(null);

  const handleBrochureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCompanyData({
        ...companyData,
        brochure: file
      });
    }
  };

  const handleCertificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCompanyData({
        ...companyData,
        certification: file
      });
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);

    try {
      // Simular delay de subida
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsUploading(false);
      onNext();
    } catch (error) {
      setIsUploading(false);
      console.error('Error uploading documents:', error);
      alert('Error al subir los documentos');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Demuestra tu Calidad
        </h2>
        <p className="text-gray-600">
          Las certificaciones son el factor decisivo para muchos clientes industriales. Muestra tus credenciales desde el principio.
        </p>
      </div>

      {/* Área de carga de archivos */}
      <div className="space-y-8">
        {/* Brochure Corporativo */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Brochure Corporativo
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
            <div className="text-center">
              <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => brochureInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <DocumentIcon className="w-4 h-4 mr-2" />
                  Subir Brochure
                </button>
                <input
                  ref={brochureInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleBrochureChange}
                  className="hidden"
                />
              </div>
              {companyData.brochure && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <div className="flex items-center">
                    <DocumentIcon className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-700">
                      {companyData.brochure.name}
                    </span>
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                PDF hasta 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Primera Certificación */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Primera Certificación
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
            <div className="text-center">
              <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => certificationInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Subir Certificación
                </button>
                <input
                  ref={certificationInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleCertificationChange}
                  className="hidden"
                />
              </div>
              {companyData.certification && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <div className="flex items-center">
                    <ShieldCheckIcon className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-700">
                      {companyData.certification.name}
                    </span>
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                PDF, JPG, PNG hasta 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ShieldCheckIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                ¿Por qué son importantes las certificaciones?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  • ISO 9001, ISO 14001, OHSAS 18001<br/>
                  • Certificaciones técnicas específicas<br/>
                  • Licencias comerciales<br/>
                  • Premios y reconocimientos del sector
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Atrás
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Subiendo...
            </>
          ) : (
            'Siguiente'
          )}
        </button>
      </div>
    </div>
  );
} 