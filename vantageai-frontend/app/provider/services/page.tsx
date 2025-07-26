'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Button } from '@/app/components/ui/Button';
import { ServiceForm } from '@/app/components/dashboard/ServiceForm';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

interface Service {
  id: number;
  name: string;
  description?: string;
  category: string;
  status: string;
  estimated_duration?: string;
  price_range?: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await apiClient.get('/catalog/services');
      setServices(response.data.services || []);
    } catch (error: any) {
      toast.error('Error al cargar servicios', {
        description: error.response?.data?.message || 'No se pudieron cargar los servicios.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return;
    }

    try {
      await apiClient.delete(`/catalog/services/${serviceId}`);
      toast.success('Servicio eliminado correctamente');
      fetchServices(); // Recargar la lista
    } catch (error: any) {
      toast.error('Error al eliminar servicio', {
        description: error.response?.data?.message || 'No se pudo eliminar el servicio.'
      });
    }
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleCreateService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingService(null);
    fetchServices();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingService(null);
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

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      mantenimiento: { color: 'bg-blue-100 text-blue-800', label: 'Mantenimiento' },
      instalacion: { color: 'bg-purple-100 text-purple-800', label: 'Instalación' },
      reparacion: { color: 'bg-orange-100 text-orange-800', label: 'Reparación' },
      consultoria: { color: 'bg-indigo-100 text-indigo-800', label: 'Consultoría' },
      otros: { color: 'bg-gray-100 text-gray-800', label: 'Otros' },
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.otros;
    
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
          <div className="text-gray-500">Cargando servicios...</div>
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
            <h1 className="text-3xl font-bold text-gray-900">Servicios</h1>
            <p className="text-gray-600">Gestiona tu catálogo de servicios</p>
          </div>
          <Button className="w-auto px-6" onClick={handleCreateService}>
            <span className="mr-2">➕</span>
            Nuevo Servicio
          </Button>
        </div>

        {/* Services Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {services.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay servicios</h3>
              <p className="text-gray-600 mb-4">Comienza agregando tu primer servicio al catálogo.</p>
              <Button className="w-auto px-6" onClick={handleCreateService}>
                <span className="mr-2">➕</span>
                Crear Servicio
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
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
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{service.name}</div>
                          {service.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {service.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getCategoryBadge(service.category)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.estimated_duration || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {service.price_range || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(service.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEditService(service)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDeleteService(service.id)}
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
      
      {/* Service Form Modal */}
      {showForm && (
        <ServiceForm
          service={editingService}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </DashboardLayout>
  );
} 