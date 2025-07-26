'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems, 
  perPage, 
  onPageChange, 
  className = ''}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * perPage + 1
  const endItem = Math.min(currentPage * perPage, totalItems);

  // Generar números de página a mostrar
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {  // Mostrar todas las páginas si hay pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {     // Mostrar páginas alrededor de la página actual
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);
      
      if (start > 1)
        pages.push(1);
      if (start > 2)
        pages.push('...');
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages) {
        if (end < totalPages - 1)
          pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-4ce-y-0lassName}`}>
      {/* Información de resultados */}
      <div className="text-sm text-gray-700">
        Mostrando <span className="font-medium">{startItem}</span> a <span className="font-medium">{endItem}</span> de <span className="font-medium">{totalItems}</span> resultados
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center space-x-2">
        {/* Botón Anterior */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 over:text-gray-700 disabled:opacity-50 isabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Anterior
        </button>

        {/* Números de página */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`flex items-center justify-center w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white border border-blue-600'
                  : page === '...'
                  ? 'text-gray-400'
                  : 'text-gray-700 border border-gray-300 r:bg-gray-50 hover:border-gray-400'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Botón Siguiente */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 over:text-gray-700 disabled:opacity-50 isabled:cursor-not-allowed transition-colors"
        >
          Siguiente
          <ChevronRightIcon className="h-4 w-4 l-1" />
        </button>
      </div>
    </div>
  );
} 