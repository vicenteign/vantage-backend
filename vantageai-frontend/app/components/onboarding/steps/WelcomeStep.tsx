'use client';

import { useEffect, useState } from 'react';
import { SparklesIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface WelcomeStepProps {
  onNext: () => void;
  companyData: any;
  setCompanyData: (data: any) => void;
}

export function WelcomeStep({ onNext, companyData, setCompanyData }: WelcomeStepProps) {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Obtener el nombre del usuario desde localStorage o API
    const token = localStorage.getItem('token');
    if (token) {
      // Decodificar el token JWT para obtener el nombre del usuario
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.full_name || 'Cliente');
      } catch (error) {
        setUserName('Cliente');
      }
    }
  }, []);

  return (
    <div className="text-center space-y-8">
      {/* Icono animado */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <SparklesIcon className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <RocketLaunchIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Título principal */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ¡Bienvenido a Vantage.ai, {userName}!
        </h1>
        
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Estás a 60 segundos de conectar con la red de proveedores industriales más calificada. 
          Vamos a configurar tu perfil para que obtengas las mejores cotizaciones.
        </p>
      </div>

      {/* Beneficios destacados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">IA Inteligente</h3>
          <p className="text-sm text-gray-600">
            Búsqueda natural en lenguaje humano
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <RocketLaunchIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Respuesta Rápida</h3>
          <p className="text-sm text-gray-600">
            Cotizaciones en 24-48 horas
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Proveedores Verificados</h3>
          <p className="text-sm text-gray-600">
            Solo empresas certificadas
          </p>
        </div>
      </div>

      {/* Botón de acción */}
      <div className="pt-8">
        <button
          onClick={onNext}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <RocketLaunchIcon className="w-5 h-5 mr-2" />
          Comenzar Configuración
        </button>
      </div>

      {/* Micro-copia */}
      <p className="text-sm text-gray-500 mt-6">
        Solo tomará 2 minutos • Configuración única
      </p>
    </div>
  );
} 