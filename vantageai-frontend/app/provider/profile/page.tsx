'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';
import { Label } from '@/app/components/ui/Label';
import apiClient from '@/app/lib/api';
import { toast } from 'sonner';

const profileSchema = z.object({
  company_name: z.string().min(1, "El nombre de la empresa es requerido"),
  about_us: z.string().optional(),
  website_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProviderProfile {
  company_name: string;
  about_us?: string;
  website_url?: string;
  logo_url?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/provider/profile');
      setProfile(response.data);
      reset(response.data);
    } catch (error: any) {
      toast.error('Error al cargar perfil', {
        description: error.response?.data?.message || 'No se pudo cargar el perfil.'
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      await apiClient.put('/provider/profile', data);
      toast.success('¡Perfil actualizado!', {
        description: 'Los cambios en tu perfil han sido guardados exitosamente.',
        duration: 4000,
      });
      fetchProfile(); // Recargar datos
    } catch (error: any) {
      toast.error('Error al actualizar perfil', {
        description: error.response?.data?.message || 'No se pudo actualizar el perfil.',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await apiClient.put('/provider/profile/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Logo actualizado correctamente');
      fetchProfile(); // Recargar datos
    } catch (error: any) {
      toast.error('Error al subir logo', {
        description: error.response?.data?.message || 'No se pudo subir el logo.'
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando perfil...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona la información de tu empresa</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo de la Empresa</h2>
              
              <div className="text-center">
                {profile?.logo_url ? (
                  <div className="mb-4">
                    <img 
                      src={profile.logo_url} 
                      alt="Logo de la empresa"
                      className="w-32 h-32 object-contain mx-auto border rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <span className="text-gray-400">Sin logo</span>
                  </div>
                )}
                
                <div>
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                  <label
                    htmlFor="logo-upload"
                    className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer ${
                      uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingLogo ? 'Subiendo...' : 'Cambiar Logo'}
                  </label>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Formatos: JPG, PNG, GIF. Máximo 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de la Empresa</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  <Label htmlFor="about_us">Acerca de Nosotros</Label>
                  <textarea
                    id="about_us"
                    {...register('about_us')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    placeholder="Describe tu empresa, servicios, experiencia..."
                  />
                </div>

                <div>
                  <Label htmlFor="website_url">Sitio Web</Label>
                  <Input 
                    id="website_url" 
                    type="url"
                    {...register('website_url')} 
                    placeholder="https://www.tuempresa.com"
                  />
                  {errors.website_url && (
                    <p className="text-red-500 text-xs mt-1">{errors.website_url.message}</p>
                  )}
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 