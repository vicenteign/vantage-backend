'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { LoadingSpinner } from '@/app/components/ui/LoadingSkeleton';
import apiClient from '@/app/lib/api';

interface SearchFiltersProps {
  type: 'products' | 'services';
  onFiltersChange: (filters: any) => void;
  className?: string;
}

interface FilterOptions {
  categories: any[];
  providers: any[];
  modalities: any[];
}

export function SearchFiltersFixed({ type, onFiltersChange, className = '' }: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    providers: [],
    modalities: []
  });
  
  // Estados separados para cada filtro
  const [categoryId, setCategoryId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [modality, setModality] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Usar useRef para mantener una referencia estable a onFiltersChange
  const onFiltersChangeRef = useRef(onFiltersChange);
  onFiltersChangeRef.current = onFiltersChange;

  // Cargar opciones de filtros solo una vez al montar el componente
  useEffect(() => {
    console.log(`[SearchFiltersFixed-${type}] Loading filter options...`);
    
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        const [categoriesRes, providersRes, modalitiesRes] = await Promise.all([
          apiClient.get('/catalog/public/categories'),
          apiClient.get('/catalog/public/providers'),
          type === 'services' ? apiClient.get('/catalog/public/modalities') : Promise.resolve({ data: { modalities: [] } })
        ]);

        setFilterOptions({
          categories: categoriesRes.data.categories || [],
          providers: providersRes.data.providers || [],
          modalities: modalitiesRes.data.modalities || []
        });
        
        console.log(`[SearchFiltersFixed-${type}] Filter options loaded successfully`);
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    loadFilterOptions();
  }, [type]);

  // Función para manejar cambios de filtros
  const handleFilterChange = useCallback((key: string, value: string) => {
    switch (key) {
      case 'category_id':
        setCategoryId(value);
        break;
      case 'provider_id':
        setProviderId(value);
        break;
      case 'modality':
        setModality(value);
        break;
      case 'sort_by':
        setSortBy(value);
        break;
      case 'sort_order':
        setSortOrder(value);
        break;
    }
  }, []);

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryId('');
    setProviderId('');
    setModality('');
    setSortBy('');
    setSortOrder('');
  }, []);

  // Verificar si hay filtros activos
  const hasActiveFilters = searchTerm || categoryId || providerId || modality;

  // Aplicar filtros con debounce solo después de la inicialización y cuando hay cambios
  useEffect(() => {
    // No aplicar filtros durante la inicialización
    if (!isInitialized) return;

    const timeoutId = setTimeout(() => {
      const filters = {
        search: searchTerm,
        category_id: categoryId,
        provider_id: providerId,
        modality: modality,
        sort_by: sortBy,
        sort_order: sortOrder
      };
      
      // Solo aplicar filtros si hay algún valor no vacío (excluyendo valores por defecto)
      const hasAnyFilter = searchTerm || categoryId || providerId || modality;
      
      console.log(`[SearchFiltersFixed-${type}] Applying filters:`, filters, 'hasAnyFilter:', hasAnyFilter);
      
      // Aplicar filtros siempre (incluso si están vacíos para la carga inicial)
      onFiltersChangeRef.current(filters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryId, providerId, modality, isInitialized, type]);

  // Aplicar ordenamiento solo cuando el usuario lo cambie explícitamente
  useEffect(() => {
    if (!isInitialized) return;

    const timeoutId = setTimeout(() => {
      if (sortBy && sortOrder) {
        const filters = {
          search: searchTerm,
          category_id: categoryId,
          provider_id: providerId,
          modality: modality,
          sort_by: sortBy,
          sort_order: sortOrder
        };
        
        console.log(`[SearchFiltersFixed-${type}] Applying sorting:`, filters);
        onFiltersChangeRef.current(filters);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [sortBy, sortOrder, isInitialized, type]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Barra de búsqueda mejorada */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Buscar ${type === 'products' ? 'productos' : 'servicios'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
        />
      </div>

      {/* Controles de filtros */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        >
          <FunnelIcon className="h-4 w-4" />
          <span>Filtros</span>
          {hasActiveFilters && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
              {[searchTerm, categoryId, providerId, modality].filter(Boolean).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors duration-200"
          >
            <XMarkIcon className="h-4 w-4" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Panel de filtros mejorado */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                disabled={loading}
              >
                <option value="">Todas las categorías</option>
                {filterOptions.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor
              </label>
              <select
                value={providerId}
                onChange={(e) => handleFilterChange('provider_id', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                disabled={loading}
              >
                <option value="">Todos los proveedores</option>
                {filterOptions.providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.company_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por modalidad (solo para servicios) */}
            {type === 'services' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modalidad
                </label>
                <select
                  value={modality}
                  onChange={(e) => handleFilterChange('modality', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  disabled={loading}
                >
                  <option value="">Todas las modalidades</option>
                  {filterOptions.modalities.map((modality, index) => (
                    <option key={index} value={modality.name}>
                      {modality.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                disabled={loading}
              >
                <option value="">Sin ordenar</option>
                <option value="name">Nombre</option>
                <option value="provider">Proveedor</option>
                <option value="category">Categoría</option>
                {type === 'services' && <option value="modality">Modalidad</option>}
              </select>
            </div>
          </div>

          {/* Orden ascendente/descendente */}
          <div className="flex items-center space-x-6 pt-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="asc"
                checked={sortOrder === 'asc'}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Ascendente</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value="desc"
                checked={sortOrder === 'desc'}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Descendente</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value=""
                checked={sortOrder === ''}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Sin ordenar</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
} 