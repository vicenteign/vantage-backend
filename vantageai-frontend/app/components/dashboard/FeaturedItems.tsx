'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';
import { EyeIcon, StarIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

interface FeaturedProduct {
  id: number;
  name: string;
  description: string;
  technical_details: string;
  sku: string;
  status: string;
  is_featured: boolean;
  provider: {
    id: number;
    company_name: string;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
}

interface FeaturedService {
  id: number;
  name: string;
  description: string;
  modality: string;
  status: string;
  is_featured: boolean;
  provider: {
    id: number;
    company_name: string;
  } | null;
  category: {
    id: number;
    name: string;
  } | null;
}

interface FeaturedItemsData {
  featured_products: FeaturedProduct[];
  featured_services: FeaturedService[];
}

export function FeaturedItems() {
  const router = useRouter();
  const [featuredData, setFeaturedData] = useState<FeaturedItemsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const response = await apiClient.get('/catalog/public/featured');
        setFeaturedData(response.data);
      } catch (error: any) {
        toast.error('Error al cargar productos destacados', {
          description: error.response?.data?.message || 'No se pudieron cargar los datos.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedItems();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!featuredData || (featuredData.featured_products.length === 0 && featuredData.featured_services.length === 0)) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <StarIcon className="w-10 h-10 text-yellow-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No hay productos destacados</h3>
        <p className="text-gray-600">Los productos destacados aparecerán aquí cuando estén disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Products */}
      {featuredData.featured_products.length > 0 && (
        <div>
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white mr-3">
              <EyeIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Productos Destacados</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredData.featured_products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  router.push(`/product/${product.id}`);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        SKU: {product.sku}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg text-white shadow-lg">
                    <StarIcon className="w-4 h-4" />
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                  {product.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{product.provider?.company_name || 'Proveedor no disponible'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {product.category?.name || 'Sin categoría'}
                    </span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {product.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Services */}
      {featuredData.featured_services.length > 0 && (
        <div>
          <div className="flex items-center mb-6">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg text-white mr-3">
              <EyeIcon className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Servicios Destacados</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredData.featured_services.map((service) => (
              <div
                key={service.id}
                className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => {
                  router.push(`/service/${service.id}`);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2 group-hover:text-green-600 transition-colors">
                      {service.name}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {service.modality}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg text-white shadow-lg">
                    <StarIcon className="w-4 h-4" />
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-500">
                    <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate">{service.provider?.company_name || 'Proveedor no disponible'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {service.category?.name || 'Sin categoría'}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {service.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 