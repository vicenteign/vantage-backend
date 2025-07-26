'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import apiClient from '@/app/lib/api';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { Label } from '@/app/components/ui/Label';
import Link from 'next/link';

const clientRegisterSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string(),
  full_name: z.string().min(1, "El nombre completo es requerido"),
  company_name: z.string().min(1, "El nombre de la empresa es requerido"),
  industry: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type ClientRegisterFormValues = z.infer<typeof clientRegisterSchema>;

export default function ClientRegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientRegisterFormValues>({
    resolver: zodResolver(clientRegisterSchema),
  });

  const onSubmit = async (data: ClientRegisterFormValues) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await apiClient.post('/client/register', registerData);
      
      toast.success('¡Registro exitoso! Ya puedes iniciar sesión.');
      router.push('/auth/login');
    } catch (error: any) {
      toast.error('Error al registrarse', {
        description: error.response?.data?.message || 'No se pudo completar el registro.',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Registro de Cliente</h2>
          <p className="text-gray-600 mt-2">Crea tu cuenta para acceder a proveedores</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="full_name">Nombre Completo</Label>
            <Input 
              id="full_name" 
              {...register('full_name')} 
              placeholder="Tu nombre completo"
            />
            {errors.full_name && (
              <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              {...register('email')} 
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="company_name">Nombre de la Empresa</Label>
            <Input 
              id="company_name" 
              {...register('company_name')} 
              placeholder="Nombre de tu empresa"
            />
            {errors.company_name && (
              <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="industry">Industria (Opcional)</Label>
            <Input 
              id="industry" 
              {...register('industry')} 
              placeholder="Ej: Tecnología, Manufactura, etc."
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              {...register('password')} 
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              {...register('confirmPassword')} 
              placeholder="Repite tu contraseña"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Registrando...' : 'Registrarse como Cliente'}
          </Button>
        </form>

        <div className="text-center space-y-2">
          <p className="text-sm">
            ¿Ya tienes una cuenta? <Link href="/auth/login" className="text-indigo-600 hover:underline">Inicia sesión</Link>
          </p>
          <p className="text-sm">
            ¿Eres proveedor? <Link href="/auth/register/provider" className="text-indigo-600 hover:underline">Regístrate como proveedor</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 