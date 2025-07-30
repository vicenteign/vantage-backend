'use client';

import { useState } from 'react';
import { ChevronLeftIcon, CubeIcon, WrenchScrewdriverIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ProviderFirstProductStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function ProviderFirstProductStep({ onComplete, onBack }: ProviderFirstProductStepProps) {
  const [selectedOption, setSelectedOption] = useState<'product' | 'service' | null>(null);

  const handleAddProduct = () => {
    setSelectedOption('product');
    // Aquí podrías redirigir al formulario de creación de productos
    // Por ahora simulamos la acción
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const handleAddService = () => {
    setSelectedOption('service');
    // Aquí podrías redirigir al formulario de creación de servicios
    // Por ahora simulamos la acción
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Tu Primer Producto o Servicio
        </h2>
        <p className="text-gray-600">
          No tienes que subir todo tu catálogo ahora, pero añade al menos un ítem para que tu perfil aparezca en las búsquedas.
        </p>
      </div>

      {/* Opciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Producto */}
        <div 
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
            selectedOption === 'product' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          onClick={handleAddProduct}
        >
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              selectedOption === 'product' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              <CubeIcon className={`w-8 h-8 ${
                selectedOption === 'product' ? 'text-green-600' : 'text-blue-600'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Añadir mi Primer Producto
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Productos físicos, equipos, maquinaria, componentes industriales
            </p>
            {selectedOption === 'product' && (
              <div className="flex items-center justify-center text-green-600">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Seleccionado</span>
              </div>
            )}
          </div>
        </div>

        {/* Servicio */}
        <div 
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${
            selectedOption === 'service' 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
          onClick={handleAddService}
        >
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              selectedOption === 'service' ? 'bg-green-100' : 'bg-purple-100'
            }`}>
              <WrenchScrewdriverIcon className={`w-8 h-8 ${
                selectedOption === 'service' ? 'text-green-600' : 'text-purple-600'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Añadir mi Primer Servicio
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Mantenimiento, instalación, consultoría, servicios técnicos
            </p>
            {selectedOption === 'service' && (
              <div className="flex items-center justify-center text-green-600">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Seleccionado</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              ¿Por qué es importante añadir al menos un ítem?
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                • Apareces en las búsquedas de clientes<br/>
                • Demuestras actividad y seriedad<br/>
                • Los clientes pueden contactarte directamente<br/>
                • Mejoras tu posicionamiento en la plataforma
              </p>
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
        
        <div className="flex space-x-3">
          <button
            onClick={handleSkip}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Prefiero hacerlo más tarde
          </button>
          
          <button
            onClick={onComplete}
            disabled={!selectedOption}
            className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedOption ? 'Completar Onboarding' : 'Selecciona una opción'}
          </button>
        </div>
      </div>
    </div>
  );
} 