'use client';

import { useState, useRef } from 'react';
import { BuildingOfficeIcon, PhotoIcon, ChevronLeftIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface ProviderCompanyIdentityStepProps {
  onNext: () => void;
  onBack: () => void;
  companyData: any;
  setCompanyData: (data: any) => void;
}

export function ProviderCompanyIdentityStep({ onNext, onBack, companyData, setCompanyData }: ProviderCompanyIdentityStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCompanyData({
        ...companyData,
        logo: file
      });
    }
  };

  const handleAboutUsChange = (value: string) => {
    setCompanyData({
      ...companyData,
      about_us: value
    });
  };

  const handleWebsiteChange = (value: string) => {
    setCompanyData({
      ...companyData,
      website_url: value
    });
  };

  const handleSubmit = async () => {
    if (!companyData.about_us.trim()) {
      alert('Por favor completa la descripción de tu empresa');
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
          Define tu Identidad Corporativa
        </h2>
        <p className="text-gray-600">
          Un perfil con logo y una buena descripción recibe un 75% más de visitas. ¡No te saltes este paso!
        </p>
      </div>

      {/* Formulario */}
      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Logo de la Empresa
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                {companyData.logo ? (
                  <img
                    src={URL.createObjectURL(companyData.logo)}
                    alt="Logo preview"
                    className="w-16 h-16 object-contain rounded"
                  />
                ) : (
                  <PhotoIcon className="w-8 h-8 text-gray-400" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PhotoIcon className="w-4 h-4 mr-2" />
                Subir Logo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG hasta 5MB
              </p>
            </div>
          </div>
        </div>

        {/* Quiénes Somos */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Quiénes Somos
          </label>
          <textarea
            value={companyData.about_us}
            onChange={(e) => handleAboutUsChange(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Describe tu empresa, experiencia, especialidades y lo que te hace único en el mercado..."
          />
          <p className="text-xs text-gray-500">
            {companyData.about_us.length}/500 caracteres
          </p>
        </div>

        {/* Sitio Web */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Sitio Web
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GlobeAltIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              value={companyData.website_url}
              onChange={(e) => handleWebsiteChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="https://www.tuempresa.com"
            />
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
          disabled={isUploading || !companyData.about_us.trim()}
          className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            'Siguiente'
          )}
        </button>
      </div>
    </div>
  );
} 