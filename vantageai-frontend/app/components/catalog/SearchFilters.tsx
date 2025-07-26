'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import apiClient from '@/app/lib/api';

interface SearchFiltersProps {
  type: 'products' | 'services';
  onFiltersChange: (filters: any) => void;
  className?: string;
}

interface FilterOptions {
  categories: Array<{ id: number; name: string }>;
  providers: Array<{ id: number; company_name: string }>;
  modalities: Array<{ name: string }>;
}

export function SearchFilters({ type, onFiltersChange, className = '' }: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    providers: [],
    modalities: []
  });
  
  // Usar estados separados para cada filtro
  const [categoryId, setCategoryId] = useState('');
  const [providerId, setProviderId] = useState('');
  const [modality, setModality] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  const [loading, setLoading] = useState(false);

  // Cargar opciones de filtros solo una vez al montar el componente
  useEffect(() => {
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
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, [type]); // Solo se ejecuta cuando cambia el tipo

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
    setSortBy('name');
    setSortOrder('asc');
  }, []);

  // Verificar si hay filtros activos
  const hasActiveFilters = useMemo(() => {
    return searchTerm || categoryId || providerId || modality;
  }, [searchTerm, categoryId, providerId, modality]);

  // Crear el objeto de filtros memoizado
  const currentFilters = useMemo(() => ({
    search: searchTerm,
    category_id: categoryId,
    provider_id: providerId,
    modality: modality,
    sort_by: sortBy,
    sort_order: sortOrder
  }), [searchTerm, categoryId, providerId, modality, sortBy, sortOrder]);

  // Aplicar filtros con debounce - ELIMINAR completamente onFiltersChange de las dependencias
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange(currentFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [currentFilters]); // Solo depende del objeto de filtros memoizado

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Barra de búsqueda */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Buscar ${type === 'products' ? 'productos' : 'servicios'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Botón de filtros */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
          >
            <XMarkIcon className="h-4 w-4" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={categoryId}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proveedor
              </label>
              <select
                value={providerId}
                onChange={(e) => handleFilterChange('provider_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modalidad
                </label>
                <select
                  value={modality}
                  onChange={(e) => handleFilterChange('modality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="name">Nombre</option>
                <option value="provider">Proveedor</option>
                <option value="category">Categoría</option>
                {type === 'services' && <option value="modality">Modalidad</option>}
              </select>
            </div>
          </div>

          {/* Orden ascendente/descendente */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="asc"
                checked={sortOrder === 'asc'}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Ascendente</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="desc"
                checked={sortOrder === 'desc'}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="mr-2"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Descendente</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
} 