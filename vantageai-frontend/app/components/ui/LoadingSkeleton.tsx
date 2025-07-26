import React from 'react';

interface LoadingSkeletonProps {
  type?: 'card' | 'service-card' | 'list' | 'detail' | 'table' | 'grid';
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ type = 'card', count = 6, className = '' }: LoadingSkeletonProps) {
  const renderCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
      <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300"></div>
      <div className="p-6 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );

  const renderServiceCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-200 rounded w-2/5"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border animate-pulse">
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );

  const renderTableSkeleton = () => (
    <div className="bg-white rounded-lg shadow-sm border animate-pulse">
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDetailSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border animate-pulse">
      <div className="p-6 space-y-6">
        <div className="flex space-x-4">
          <div className="w-32 h-32 bg-gray-200 rounded-lg"></div>
          <div className="flex-1 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );

  const renderGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
          <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300"></div>
          <div className="p-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return renderCardSkeleton();
      case 'service-card':
        return renderServiceCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'detail':
        return renderDetailSkeleton();
      case 'grid':
        return renderGridSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  if (type === 'grid') {
    return renderGridSkeleton();
  }

  return (
    <div className={className}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="mb-4">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
}

// Componente específico para productos
export function ProductCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
          <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300"></div>
          <div className="p-6 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente específico para servicios
export function ServiceCardSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-sm border overflow-hidden animate-pulse">
          <div className="p-6 space-y-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/5"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente de loading spinner
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}></div>
    </div>
  );
}

// Componente de loading con texto
export function LoadingWithText({ text = 'Cargando...', className = '' }: { text?: string, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-gray-600 text-lg font-medium">{text}</p>
    </div>
  );
} 