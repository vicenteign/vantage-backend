'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { Label } from '@/app/components/ui/Label';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await apiClient.post('/auth/login', data);
      const { access_token, user } = response.data;
      
      // Guardar el token y la información del usuario en localStorage
      localStorage.setItem('accessToken', access_token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userInfo', JSON.stringify(user));
      
      toast.success(`¡Bienvenido, ${user.full_name || user.email}!`, {
        description: `Has iniciado sesión como ${user.role === 'proveedor' ? 'proveedor' : 'cliente'}.`,
        duration: 4000,
      });
      
      // Redirigir según el rol del usuario
      console.log('Usuario autenticado:', user);
      console.log('Rol del usuario:', user.role);
      
      if (user.role === 'proveedor') {
        console.log('Redirigiendo a dashboard de proveedor...');
        router.push('/provider/dashboard');
      } else if (user.role === 'cliente') {
        console.log('Redirigiendo a dashboard de cliente...');
        router.push('/client/dashboard');
      } else {
        console.log('Rol no reconocido, redirigiendo a dashboard de proveedor por defecto...');
        router.push('/provider/dashboard'); // Default
      }
    } catch (error: any) {
      toast.error('Error al iniciar sesión', {
        description: error.response?.data?.message || 'Credenciales incorrectas.',
        duration: 5000,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
            <p className="text-gray-600 mt-2">Accede a tu cuenta de Vantage.ai</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="tu@email.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <a href="/auth/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 