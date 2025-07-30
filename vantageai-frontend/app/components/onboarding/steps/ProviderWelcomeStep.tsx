'use client';

import { useEffect, useState } from 'react';
import { SparklesIcon, RocketLaunchIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface ProviderWelcomeStepProps {
  onNext: () => void;
  companyData: any;
  setCompanyData: (data: any) => void;
}

export function ProviderWelcomeStep({ onNext, companyData, setCompanyData }: ProviderWelcomeStepProps) {
  const [userName, setUserName] = useState('Proveedor');

  useEffect(() => {
    // Obtener el nombre del usuario desde localStorage o API
    const token = localStorage.getItem('token');
    if (token) {
      // Decodificar el token JWT para obtener el nombre del usuario
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.full_name || 'Proveedor');
      } catch (error) {
        setUserName('Proveedor');
      }
    }
  }, []);

  return (
    <div className="text-center space-y-8">
      {/* Icono animado */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <BuildingOfficeIcon className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <RocketLaunchIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Título principal */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          ¡Bienvenido a la Vitrina Industrial, {userName}!
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          En Vantage.ai, tu experiencia y calidad son tu mejor marketing. Te guiaremos para construir un perfil que destaque y atraiga a los clientes que realmente valoran lo que haces.
        </p>
      </div>

      {/* Beneficios destacados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Perfil Destacado</h3>
          <p className="text-sm text-gray-600">
            Un perfil completo con logo y descripción recibe un 75% más de visitas
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <BuildingOfficeIcon className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Credibilidad</h3>
          <p className="text-sm text-gray-600">
            Las certificaciones son el factor decisivo para clientes industriales
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Primera Impresión</h3>
          <p className="text-sm text-gray-600">
            Añade tu producto estrella para aparecer en las búsquedas desde el inicio
          </p>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="mt-12">
        <button
          onClick={onNext}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
        >
          <BuildingOfficeIcon className="w-5 h-5 mr-2" />
          Construir mi Perfil
        </button>
      </div>
    </div>
  );
} 