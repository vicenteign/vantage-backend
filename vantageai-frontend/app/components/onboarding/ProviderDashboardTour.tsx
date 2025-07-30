'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ProviderDashboardTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export function ProviderDashboardTour({ isActive, onComplete, onSkip }: ProviderDashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const steps: TourStep[] = [
    {
      id: 'catalog',
      title: 'Tu Catálogo Digital',
      content: 'Este es tu punto de partida. Desde aquí puedes añadir todos los productos y servicios que ofreces. Un catálogo completo y detallado es clave para aparecer en las búsquedas.',
      target: '[data-tour="create-product"]',
      placement: 'bottom'
    },
    {
      id: 'management',
      title: 'Control Total',
      content: 'Aquí puedes ver, editar, activar o desactivar cualquier ítem de tu catálogo en cualquier momento. Mantén tu información siempre actualizada.',
      target: '[data-tour="products-nav"]',
      placement: 'right'
    },
    {
      id: 'notifications',
      title: '¡Aquí Sucede la Magia!',
      content: 'Este es el lugar más importante. Cuando un cliente solicite una cotización, te notificaremos aquí. Responde rápido para no perder la oportunidad.',
      target: '[data-tour="notifications"]',
      placement: 'bottom'
    }
  ];

  useEffect(() => {
    if (isActive && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isActive, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  if (!isActive) return null;

  const currentStepData = steps[currentStep];
  const element = highlightedElement;

  if (!element || !currentStepData) return null;

  const elementRect = element.getBoundingClientRect();
  const isTop = currentStepData.placement === 'top';
  const isBottom = currentStepData.placement === 'bottom';
  const isLeft = currentStepData.placement === 'left';
  const isRight = currentStepData.placement === 'right';

  const tooltipStyle = {
    position: 'absolute' as const,
    zIndex: 1000,
    ...(isTop && {
      bottom: window.innerHeight - elementRect.top + 10,
      left: elementRect.left + elementRect.width / 2,
      transform: 'translateX(-50%)'
    }),
    ...(isBottom && {
      top: elementRect.bottom + 10,
      left: elementRect.left + elementRect.width / 2,
      transform: 'translateX(-50%)'
    }),
    ...(isLeft && {
      top: elementRect.top + elementRect.height / 2,
      right: window.innerWidth - elementRect.left + 10,
      transform: 'translateY(-50%)'
    }),
    ...(isRight && {
      top: elementRect.top + elementRect.height / 2,
      left: elementRect.right + 10,
      transform: 'translateY(-50%)'
    })
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Highlighted element */}
      <div
        className="fixed z-50 rounded-lg shadow-2xl ring-2 ring-blue-500 ring-opacity-75"
        style={{
          top: elementRect.top - 4,
          left: elementRect.left - 4,
          width: elementRect.width + 8,
          height: elementRect.height + 8,
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
        style={tooltipStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentStepData.title}
          </h3>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-gray-600 text-sm leading-relaxed">
            {currentStepData.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {currentStep + 1} de {steps.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Anterior
            </button>
            
            <button
              onClick={handleNext}
              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
              {currentStep < steps.length - 1 && <ChevronRightIcon className="w-4 h-4 ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
} 