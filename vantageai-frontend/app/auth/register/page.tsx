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

const registerSchema = z.object({
  company_name: z.string().min(1, "El nombre de la empresa es requerido"),
  full_name: z.string().min(1, "Tu nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterProviderPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await apiClient.post('/auth/register/provider', data);
      toast.success('¡Registro exitoso!', {
        description: 'Ahora puedes iniciar sesión con tus credenciales.',
      });
      router.push('/auth/login');
    } catch (error: any) {
      toast.error('Error en el registro', {
        description: error.response?.data?.message || 'Ocurrió un error inesperado.',
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Registrar Proveedor</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="company_name">Nombre de la Empresa</Label>
            <Input id="company_name" {...register('company_name')} />
            {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>}
          </div>
          <div>
            <Label htmlFor="full_name">Tu Nombre Completo</Label>
            <Input id="full_name" {...register('full_name')} />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Registrando...' : 'Registrar'}
          </Button>
        </form>
        <div className="text-center space-y-2">
          <p className="text-sm">
            ¿Ya tienes una cuenta? <Link href="/auth/login" className="text-indigo-600 hover:underline">Inicia sesión</Link>
          </p>
          <p className="text-sm">
            ¿Eres cliente? <Link href="/auth/register/client" className="text-indigo-600 hover:underline">Regístrate como cliente</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 