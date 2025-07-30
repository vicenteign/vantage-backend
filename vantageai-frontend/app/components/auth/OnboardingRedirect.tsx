'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/app/lib/api';

interface OnboardingRedirectProps {
  children: React.ReactNode;
}

export function OnboardingRedirect({ children }: OnboardingRedirectProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingAndRedirect = async () => {
      try {
        // Solo verificar si no estamos ya en una página de onboarding
        const currentPath = window.location.pathname;
        const isOnboardingPage = currentPath.includes('/onboarding/');
        
        if (isOnboardingPage) {
          setIsChecking(false);
          return;
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          setIsChecking(false);
          return;
        }

        const response = await apiClient.get('/api/users/onboarding-status');
        const { has_completed_onboarding, user_role } = response.data;
        
        // Si no ha completado el onboarding, redirigir según el rol
        if (!has_completed_onboarding) {
          if (user_role === 'cliente') {
            router.push('/onboarding/client');
            return;
          } else if (user_role === 'proveedor') {
            router.push('/onboarding/provider');
            return;
          }
        }
        
        setIsChecking(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setIsChecking(false);
      }
    };

    checkOnboardingAndRedirect();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 