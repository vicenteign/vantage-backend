'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/app/lib/api';

interface OnboardingLayoutProps {
  children: React.ReactNode;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await apiClient.get('/api/users/onboarding-status');
        const { has_completed_onboarding, user_role } = response.data;
        
        // Si ya completó el onboarding, redirigir al dashboard
        if (has_completed_onboarding) {
          if (user_role === 'cliente') {
            router.push('/client/dashboard');
          } else if (user_role === 'proveedor') {
            router.push('/provider/dashboard');
          }
          return;
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      {/* Dashboard desenfocado de fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-30 blur-sm">
        <div className="h-full w-full bg-white/20 backdrop-blur-sm"></div>
      </div>
      
      {/* Contenido del onboarding centrado */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </div>
    </div>
  );
} 