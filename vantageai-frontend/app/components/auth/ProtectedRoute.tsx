'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

interface DecodedToken {
  exp: number;
  sub: string;
  role?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          console.log('No token found, redirecting to login');
          router.push('/auth/login');
          return;
        }

        console.log('Token found:', token);
        const decoded = jwtDecode<DecodedToken>(token);
        console.log('Decoded token:', decoded);
        
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          console.log('Token expired');
          localStorage.removeItem('accessToken');
          router.push('/auth/login');
          return;
        }

        // Check role from localStorage
        if (requiredRole) {
          const userRole = localStorage.getItem('userRole');
          if (userRole !== requiredRole) {
            console.log('Role mismatch:', userRole, 'required:', requiredRole);
            router.push('/auth/login');
            return;
          }
        }

        console.log('Authentication successful');
        console.log('User role from localStorage:', localStorage.getItem('userRole'));
        console.log('Required role:', requiredRole);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('accessToken');
        router.push('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
} 