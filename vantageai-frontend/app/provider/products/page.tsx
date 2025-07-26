'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Button } from '@/app/components/ui/Button';
import { ProductForm } from '@/app/components/dashboard/ProductForm';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

interface Product {
  id: number;
  name: string;
  sku: string;
  status: string;
  description?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/catalog/products');
      setProducts(response.data.products || []);
    } catch (error: any) {
      toast.error('Error al cargar productos', {
        description: error.response?.data?.message || 'No se pudieron cargar los productos.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      await apiClient.delete(`/catalog/products/${productId}`);
      toast.success('Producto eliminado correctamente');
      fetchProducts(); // Recargar la lista
    } catch (error: any) {
      toast.error('Error al eliminar producto', {
        description: error.response?.data?.message || 'No se pudo eliminar el producto.'
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      activo: { color: 'bg-green-100 text-green-800', label: 'Activo' },
      borrador: { color: 'bg-yellow-100 text-yellow-800', label: 'Borrador' },
      inactivo: { color: 'bg-red-100 text-red-800', label: 'Inactivo' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.borrador;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando productos...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
            <p className="text-gray-600">Gestiona tu catálogo de productos</p>
          </div>
          <Button className="w-auto px-6" onClick={handleCreateProduct}>
            <span className="mr-2">➕</span>
            Nuevo Producto
          </Button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {products.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
              <p className="text-gray-600 mb-4">Comienza agregando tu primer producto al catálogo.</p>
              <Button className="w-auto px-6" onClick={handleCreateProduct}>
                <span className="mr-2">➕</span>
                Crear Producto
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.sku || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(product.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </DashboardLayout>
  );
} 