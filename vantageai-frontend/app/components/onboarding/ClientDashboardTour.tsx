'use client';

import { useState, useEffect } from 'react';
import { SparklesIcon, XMarkIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

interface ClientDashboardTourProps {
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

export function ClientDashboardTour({ isActive, onComplete, onSkip }: ClientDashboardTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const steps: TourStep[] = [
    {
      id: 'search',
      title: 'Tu Centro de Mando',
      content: 'Aquí comienza todo. No busques "bomba 500". Mejor describe tu problema: "necesito bomba sumergible para agua salina con 5hp de potencia". Nuestra IA entenderá y te dará los mejores resultados.',
      target: '#ai-search-bar',
      placement: 'bottom'
    },
    {
      id: 'featured',
      title: 'Inspiración y Novedades',
      content: 'No siempre sabes lo que buscas. Aquí te mostramos una selección de productos y proveedores de alta calidad. Ideal para descubrir nuevas tecnologías y soluciones.',
      target: '#featured-items',
      placement: 'top'
    },
    {
      id: 'quotes',
      title: 'Tu Historial Centralizado',
      content: 'Todas tus solicitudes y las respuestas de los proveedores se guardan aquí. Accede para comparar y analizar las cotizaciones con nuestra IA.',
      target: '#quotes-nav',
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

  const rect = element.getBoundingClientRect();
  const tooltipStyle = getTooltipStyle(rect, currentStepData.placement);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Highlighted element */}
      <div 
        className="fixed z-50 border-2 border-blue-500 rounded-lg shadow-lg"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          pointerEvents: 'none'
        }}
      >
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg animate-pulse"></div>
      </div>

      {/* Tooltip */}
      <div 
        className="fixed z-50 bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm"
        style={tooltipStyle}
      >
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{currentStepData.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{currentStepData.content}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-500">
              {currentStep + 1} de {steps.length}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Saltar tour
            </button>
            
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-1" />
                  Anterior
                </button>
              )}
              
              <button
                onClick={handleNext}
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function getTooltipStyle(rect: DOMRect, placement: string) {
  const tooltipWidth = 320;
  const tooltipHeight = 200;
  const margin = 16;

  switch (placement) {
    case 'top':
      return {
        top: rect.top - tooltipHeight - margin,
        left: Math.max(margin, rect.left + rect.width / 2 - tooltipWidth / 2),
        width: tooltipWidth
      };
    case 'bottom':
      return {
        top: rect.bottom + margin,
        left: Math.max(margin, rect.left + rect.width / 2 - tooltipWidth / 2),
        width: tooltipWidth
      };
    case 'left':
      return {
        top: rect.top + rect.height / 2 - tooltipHeight / 2,
        left: rect.left - tooltipWidth - margin,
        width: tooltipWidth
      };
    case 'right':
      return {
        top: rect.top + rect.height / 2 - tooltipHeight / 2,
        left: rect.right + margin,
        width: tooltipWidth
      };
    default:
      return {
        top: rect.bottom + margin,
        left: Math.max(margin, rect.left + rect.width / 2 - tooltipWidth / 2),
        width: tooltipWidth
      };
  }
} 