'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { Label } from '@/app/components/ui/Label';
import { FormModal } from '@/app/components/ui/Modal';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

const productSchema = z.object({
  name: z.string().min(1, "El nombre del producto es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  technical_details: z.string().optional(),
  sku: z.string().min(1, "El SKU es requerido"),
  status: z.enum(['borrador', 'activo', 'inactivo']),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product || {
      status: 'borrador'
    }
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      if (product) {
        // Editar producto existente
        await apiClient.put(`/catalog/products/${product.id}`, data);
        toast.success('Producto actualizado correctamente');
      } else {
        // Crear nuevo producto
        await apiClient.post('/catalog/products', data);
        toast.success('Producto creado correctamente');
      }
      onSuccess();
    } catch (error: any) {
      toast.error('Error al guardar producto', {
        description: error.response?.data?.message || 'Ocurrió un error inesperado.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      isOpen={true}
      onClose={onCancel}
      title={product ? 'Editar Producto' : 'Nuevo Producto'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre del Producto</Label>
          <Input 
            id="name" 
            {...register('name')} 
            placeholder="Ej: Válvula de Control"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Descripción</Label>
          <textarea
            id="description"
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            placeholder="Describe tu producto..."
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="technical_details">Detalles Técnicos (Opcional)</Label>
          <textarea
            id="technical_details"
            {...register('technical_details')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
            placeholder="Especificaciones técnicas..."
          />
        </div>

        <div>
          <Label htmlFor="sku">SKU</Label>
          <Input 
            id="sku" 
            {...register('sku')} 
            placeholder="Ej: VAL-001"
          />
          {errors.sku && (
            <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>
          )}
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
            {isSubmitting ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
          </Button>
        </div>
      </form>
    </FormModal>
  );
} 