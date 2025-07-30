'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WelcomeStep } from './steps/WelcomeStep';
import { CompanyIdentityStep } from './steps/CompanyIdentityStep';
import { FinalStep } from './steps/FinalStep';

export function ClientOnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyData, setCompanyData] = useState({
    logo: null as File | null,
    industry: ''
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
      const response = await fetch('/api/users/complete-onboarding', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        router.push('/client/dashboard');
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
          <WelcomeStep 
            onNext={handleNext}
            companyData={companyData}
            setCompanyData={setCompanyData}
          />
        );
      case 2:
        return (
          <CompanyIdentityStep 
            onNext={handleNext}
            onBack={handleBack}
            companyData={companyData}
            setCompanyData={setCompanyData}
          />
        );
      case 3:
        return (
          <FinalStep 
            onComplete={handleComplete}
            onBack={handleBack}
          />
        );
      default:
        return <WelcomeStep onNext={handleNext} companyData={companyData} setCompanyData={setCompanyData} />;
    }
  };

  return (
    <div className="w-full">
      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Paso {currentStep} de 3
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / 3) * 100)}% completado
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Contenido del paso actual */}
      {renderStep()}
    </div>
  );
} 