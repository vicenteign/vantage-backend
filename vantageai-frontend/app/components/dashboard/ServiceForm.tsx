'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { Label } from '@/app/components/ui/Label';
import { Modal } from '@/app/components/ui/Modal';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

const serviceSchema = z.object({
  name: z.string().min(1, "El nombre del servicio es requerido"),
  description: z.string().optional(),
  category: z.enum(['mantenimiento', 'instalacion', 'reparacion', 'consultoria', 'otros']),
  estimated_duration: z.string().optional(),
  price_range: z.string().optional(),
  status: z.enum(['borrador', 'activo', 'inactivo']),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  service?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service || {
      category: 'mantenimiento',
      status: 'borrador'
    }
  });

  const onSubmit = async (data: ServiceFormValues) => {
    setIsSubmitting(true);
    try {
      if (service) {
        // Editar servicio existente
        await apiClient.put(`/catalog/services/${service.id}`, data);
        toast.success('Servicio actualizado correctamente');
      } else {
        // Crear nuevo servicio
        await apiClient.post('/catalog/services', data);
        toast.success('Servicio creado correctamente');
      }
      onSuccess();
    } catch (error: any) {
      toast.error('Error al guardar servicio', {
        description: error.response?.data?.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title={service ? 'Editar Servicio' : 'Nuevo Servicio'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del Servicio</Label>
          <Input 
            id="name" 
            {...register('name')} 
            placeholder="Ej: Mantenimiento Preventivo"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descripción (Opcional)</Label>
          <textarea
            id="description"
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            placeholder="Describe el servicio..."
          />
        </div>

        <div>
          <Label htmlFor="category">Categoría</Label>
          <select
            id="category"
            {...register('category')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="mantenimiento">Mantenimiento</option>
            <option value="instalacion">Instalación</option>
            <option value="reparacion">Reparación</option>
            <option value="consultoria">Consultoría</option>
            <option value="otros">Otros</option>
          </select>
        </div>

        <div>
          <Label htmlFor="estimated_duration">Duración Estimada (Opcional)</Label>
          <Input 
            id="estimated_duration" 
            {...register('estimated_duration')} 
            placeholder="Ej: 2-4 horas"
          />
        </div>

        <div>
          <Label htmlFor="price_range">Rango de Precio (Opcional)</Label>
          <Input 
            id="price_range" 
            {...register('price_range')} 
            placeholder="Ej: $500 - $1000"
          />
        </div>

        <div>
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            {...register('status')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="borrador">Borrador</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Guardando...' : (service ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </Modal>
  );
} 