'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/app/lib/api';
import { ProviderWelcomeStep } from './steps/ProviderWelcomeStep';
import { ProviderCompanyIdentityStep } from './steps/ProviderCompanyIdentityStep';
import { ProviderCertificationsStep } from './steps/ProviderCertificationsStep';
import { ProviderFirstProductStep } from './steps/ProviderFirstProductStep';

export function ProviderOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyData, setCompanyData] = useState({
    logo: null as File | null,
    about_us: '',
    website_url: '',
    brochure: null as File | null,
    certification: null as File | null
  });
  const router = useRouter();

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = async () => {
    try {
      // Llamar al endpoint para marcar onboarding como completado
      const response = await apiClient.put('/api/users/complete-onboarding');

      if (response.status === 200) {
        router.push('/provider/dashboard');
      } else {
        console.error('Error completing onboarding');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProviderWelcomeStep 
            onNext={handleNext}
            companyData={companyData}
            setCompanyData={setCompanyData}
          />
        );
      case 2:
        return (
          <ProviderCompanyIdentityStep 
            onNext={handleNext}
            onBack={handleBack}
            companyData={companyData}
            setCompanyData={setCompanyData}
          />
        );
      case 3:
        return (
          <ProviderCertificationsStep 
            onNext={handleNext}
            onBack={handleBack}
            companyData={companyData}
            setCompanyData={setCompanyData}
          />
        );
      case 4:
        return (
          <ProviderFirstProductStep 
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      default:
        return <ProviderWelcomeStep onNext={handleNext} companyData={companyData} setCompanyData={setCompanyData} />;
    }
  };

  return (
    <div className="w-full">
      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Paso {currentStep} de 4
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / 4) * 100)}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Contenido del paso actual */}
      {renderStep()}
    </div>
  );
} 