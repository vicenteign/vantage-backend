'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { Label } from '@/app/components/ui/Label';
import { Modal } from '@/app/components/ui/Modal';
import { Textarea } from '@/app/components/ui/Textarea';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

const quoteRequestSchema = z.object({
  quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
  message: z.string().optional(),
  branch_id: z.number().optional(),
});

type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>;

interface QuoteRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: number;
    name: string;
    type: 'producto' | 'servicio';
    provider_id: number;
    provider_name: string;
  };
  onSuccess?: () => void;
}

export function QuoteRequestForm({ isOpen, onClose, item, onSuccess }: QuoteRequestFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      quantity: 1,
      message: '',
    }
  });

  const onSubmit = async (data: QuoteRequestFormData) => {
    setIsLoading(true);
    try {
      const requestData: any = {
        provider_id: item.provider_id,
        item_id: item.id,
        item_type: item.type,
        quantity: data.quantity,
        message: data.message,
      };
      
      // Solo incluir branch_id si se proporciona un valor válido
      if (data.branch_id && data.branch_id > 0) {
        requestData.branch_id = data.branch_id;
      }
      
      const response = await apiClient.post('/quotes/request', requestData);

      toast.success('¡Cotización enviada!', {
        description: `Tu solicitud de cotización para "${item.name}" ha sido enviada exitosamente. El proveedor te contactará pronto.`,
        duration: 5000,
      });
      reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error al enviar cotización:', error);
      toast.error(error.response?.data?.error || 'Error al enviar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Solicitar Cotización - ${item.name}`}
      size="md"
    >
      <div className="space-y-6">
        {/* Información del item */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Detalles del {item.type}</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">Nombre:</span> {item.name}</p>
            <p><span className="font-medium">Proveedor:</span> {item.provider_name}</p>
            <p><span className="font-medium">Tipo:</span> {item.type === 'producto' ? 'Producto' : 'Servicio'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Cantidad */}
          <div>
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register('quantity', { valueAsNumber: true })}
              className={errors.quantity ? 'border-red-500' : ''}
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
            )}
          </div>

          {/* Mensaje */}
          <div>
            <Label htmlFor="message">Mensaje adicional (opcional)</Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Describe tus necesidades específicas, requisitos técnicos, o cualquier información adicional que consideres importante..."
              {...register('message')}
            />
          </div>

          {/* Sucursal (opcional) */}
          <div>
            <Label htmlFor="branch_id">Sucursal (opcional)</Label>
            <Input
              id="branch_id"
              type="number"
              placeholder="Dejar vacío para usar sucursal principal"
              {...register('branch_id', { valueAsNumber: true })}
            />
            <p className="text-gray-500 text-sm mt-1">
              Deja vacío para usar tu sucursal principal, o especifica el ID de otra sucursal si es necesario
            </p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
} 