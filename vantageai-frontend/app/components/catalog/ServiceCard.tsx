'use client';

import { useState } from 'react';
import { StarIcon, ArrowRightIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Service {
  id: number;
  name: string;
  description: string;
  price?: number;
  modality: string;
  technical_details?: string;
  category?: {
    id: number;
    name: string;
  };
  provider: {
    id: number;
    company_name: string;
  };
  is_featured: boolean;
  created_at: string;
}

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
  className?: string;
}

export function ServiceCard({ service, onClick, className = '' }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-purple-200 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 ${className}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header con gradiente y badge destacado */}
      <div className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 pb-4">
        {/* Badge destacado */}
        {service.is_featured && (
          <div className="absolute top-4 right-4 z-10">
            <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full text-white shadow-lg">
              <StarIconSolid className="w-4 h-4" />
              <span className="text-xs font-semibold">Destacado</span>
            </div>
          </div>
        )}

        {/* Icono del servicio */}
        <div className="mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <WrenchScrewdriverIcon className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Título del servicio */}
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 text-xl leading-tight line-clamp-2 group-hover:text-purple-600 transition-colors duration-200">
            {service.name}
          </h3>
        </div>
        
        {/* Modalidad Badge con estilo mejorado */}
        <div className="mb-4">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            {service.modality}
          </span>
        </div>
        
        {/* Descripción con mejor tipografía */}
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
          {service.description}
        </p>
      </div>
      
      {/* Información del servicio con diseño mejorado */}
      <div className="px-6 pb-4">
        <div className="space-y-3">
          {/* Categoría */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-500">Categoría</span>
            <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded-md border">
              {service.category?.name || 'Sin categoría'}
            </span>
          </div>
          
          {/* Proveedor */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-500">Proveedor</span>
            <span className="text-sm font-semibold text-gray-900 bg-white px-2 py-1 rounded-md border truncate max-w-32">
              {service.provider.company_name}
            </span>
          </div>
          
          {/* Precio con diseño destacado */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
            <span className="text-sm font-medium text-gray-600">Precio</span>
            <span className="text-lg font-bold text-purple-600">
              {service.price ? `$${service.price.toLocaleString()}` : 'Consultar'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Footer con información adicional */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">
              {new Date(service.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          
          {/* Botón de acción con animación */}
          <div className="flex items-center space-x-2 text-purple-600 font-semibold group-hover:text-purple-700 transition-colors duration-200">
            <span className="text-sm">Ver detalles</span>
            <ArrowRightIcon className={`w-4 h-4 transition-transform duration-200 ${isHovered ? 'translate-x-1' : ''}`} />
          </div>
        </div>
      </div>

      {/* Overlay de hover */}
      <div className={`absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
    </div>
  );
}

// Componente de skeleton mejorado que coincide con el diseño del ServiceCard
export function ServiceCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
          {/* Header skeleton */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 p-6 pb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-5 bg-gray-200 rounded-full w-24 mb-4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
          
          {/* Info skeleton */}
          <div className="px-6 pb-4">
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer skeleton */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="flex items-center space-x-2">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-4"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 