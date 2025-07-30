'use client';

import { useState, useRef } from 'react';
import { BuildingOfficeIcon, PhotoIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface CompanyIdentityStepProps {
  onNext: () => void;
  onBack: () => void;
  companyData: any;
  setCompanyData: (data: any) => void;
}

export function CompanyIdentityStep({ onNext, onBack, companyData, setCompanyData }: CompanyIdentityStepProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const industries = [
    'Minería',
    'Energía',
    'Construcción',
    'Manufactura',
    'Petróleo y Gas',
    'Química',
    'Alimentaria',
    'Farmacéutica',
    'Automotriz',
    'Aeronáutica',
    'Otro'
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB');
        return;
      }

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Actualizar estado
      setCompanyData({
        ...companyData,
        logo: file
      });
    }
  };

  const handleIndustryChange = (industry: string) => {
    setCompanyData({
      ...companyData,
      industry
    });
  };

  const handleSubmit = async () => {
    if (!companyData.industry) {
      alert('Por favor selecciona una industria');
      return;
    }

    setIsUploading(true);

    try {
      // Aquí podrías subir el logo si es necesario
      // Por ahora solo validamos que los datos estén completos
      
      // Simular delay de subida
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsUploading(false);
      onNext();
    } catch (error) {
      setIsUploading(false);
      console.error('Error saving company data:', error);
      alert('Error al guardar los datos de la empresa');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ¿A qué empresa representas?
        </h2>
        <p className="text-gray-600">
          Esta información ayuda a los proveedores a entender el contexto de tus necesidades
        </p>
      </div>

      {/* Formulario */}
      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Logo de la empresa (opcional)
          </label>
          
          <div className="flex justify-center">
            <div className="relative">
              <div 
                className={`w-32 h-32 border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-colors ${
                  logoPreview 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Haz clic para subir</p>
                  </div>
                )}
              </div>
              
              {logoPreview && (
                <button
                  onClick={() => {
                    setLogoPreview(null);
                    setCompanyData({ ...companyData, logo: null });
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>

        {/* Industria */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Industria Principal *
          </label>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {industries.map((industry) => (
              <button
                key={industry}
                onClick={() => handleIndustryChange(industry)}
                className={`p-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                  companyData.industry === industry
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Micro-copia de valor */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <BuildingOfficeIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800 font-medium mb-1">
              ¿Por qué es importante?
            </p>
            <p className="text-sm text-blue-700">
              Esta información ayuda a los proveedores a entender el contexto de tus necesidades 
              y a ofrecerte soluciones más precisas y relevantes para tu industria.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Atrás
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!companyData.industry || isUploading}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            'Finalizar y Descubrir'
          )}
        </button>
      </div>
    </div>
  );
} 