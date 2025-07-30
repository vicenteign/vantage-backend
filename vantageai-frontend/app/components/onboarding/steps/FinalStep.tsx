'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, SparklesIcon, MagnifyingGlassIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

interface FinalStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function FinalStep({ onComplete, onBack }: FinalStepProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Iniciar animación después de un breve delay
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Todo Listo! Así Funciona la Magia
        </h2>
        <p className="text-gray-600">
          Tu herramienta más poderosa es nuestro buscador inteligente
        </p>
      </div>

      {/* Demo animada */}
      <div className="relative">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-lg">
          {/* Barra de búsqueda simulada */}
          <div className="relative mb-6">
            <div className="flex items-center bg-gray-50 border-2 border-blue-200 rounded-xl p-4">
              <MagnifyingGlassIcon className="w-5 h-5 text-blue-600 mr-3" />
              <div className="flex-1">
                <div className={`transition-all duration-1000 ${
                  isAnimating ? 'opacity-100' : 'opacity-0'
                }`}>
                  <span className="text-gray-900">necesito bomba sumergible para agua salina con 5hp de potencia</span>
                  <span className="animate-pulse">|</span>
                </div>
              </div>
              <div className={`ml-3 transition-all duration-1000 delay-500 ${
                isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}>
                <SparklesIcon className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Resultados simulados */}
          <div className={`space-y-4 transition-all duration-1000 delay-1000 ${
            isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <SparklesIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Bomba Centrífuga Sumergible X-5000</h4>
                <p className="text-sm text-gray-600">Soluciones Hidráulicas del Pacífico</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">$2,450</div>
                <div className="text-xs text-gray-500">En stock</div>
              </div>
            </div>

            <div className="flex items-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <RocketLaunchIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">Bomba Industrial Resistente a Salinidad</h4>
                <p className="text-sm text-gray-600">Bombas Industriales del Norte</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">$2,180</div>
                <div className="text-xs text-gray-500">Entrega 48h</div>
              </div>
            </div>
          </div>

          {/* Indicador de IA */}
          <div className={`mt-6 text-center transition-all duration-1000 delay-1500 ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium">
              <SparklesIcon className="w-4 h-4 mr-2" />
              IA encontró 3 resultados relevantes
            </div>
          </div>
        </div>
      </div>

      {/* Explicación */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            💡 Olvida los códigos y las palabras clave
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Simplemente describe tu problema o necesidad en tus propias palabras y deja que nuestra IA haga el trabajo por ti. 
            No necesitas conocer códigos de productos o especificaciones técnicas exactas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-green-600 font-bold text-sm">1</span>
            </div>
            <h4 className="font-medium text-gray-900 text-sm">Describe tu necesidad</h4>
          </div>
          
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold text-sm">2</span>
            </div>
            <h4 className="font-medium text-gray-900 text-sm">IA encuentra soluciones</h4>
          </div>
          
          <div className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold text-sm">3</span>
            </div>
            <h4 className="font-medium text-gray-900 text-sm">Recibe cotizaciones</h4>
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
          onClick={onComplete}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          <RocketLaunchIcon className="w-5 h-5 mr-2" />
          Ir a mi Dashboard
        </button>
      </div>
    </div>
  );
} 