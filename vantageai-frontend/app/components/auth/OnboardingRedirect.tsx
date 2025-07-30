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
        
        console.log('🔍 OnboardingRedirect - Current path:', currentPath);
        console.log('🔍 OnboardingRedirect - Is onboarding page:', isOnboardingPage);
        
        if (isOnboardingPage) {
          console.log('🔍 OnboardingRedirect - Already on onboarding page, skipping check');
          setIsChecking(false);
          return;
        }

        const token = localStorage.getItem('accessToken');
        console.log('🔍 OnboardingRedirect - Token exists:', !!token);
        
        if (!token) {
          console.log('🔍 OnboardingRedirect - No token, skipping');
          setIsChecking(false);
          return;
        }

        console.log('🔍 OnboardingRedirect - Checking onboarding status...');
        const response = await apiClient.get('/api/users/onboarding-status');
        const { has_completed_onboarding, user_role } = response.data;
        
        console.log('🔍 OnboardingRedirect - Status:', { has_completed_onboarding, user_role });
        
        // Si no ha completado el onboarding, redirigir según el rol
        if (!has_completed_onboarding) {
          if (user_role === 'cliente') {
            console.log('🔍 OnboardingRedirect - Redirecting to client onboarding');
            router.push('/onboarding/client');
            return;
          } else if (user_role === 'proveedor') {
            console.log('🔍 OnboardingRedirect - Redirecting to provider onboarding');
            router.push('/onboarding/provider');
            return;
          }
        }
        
        console.log('🔍 OnboardingRedirect - Onboarding completed, showing dashboard');
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