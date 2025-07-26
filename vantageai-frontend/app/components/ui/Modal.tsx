'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  type?: 'center' | 'slide-right' | 'slide-left' | 'slide-up' | 'slide-down';
  showCloseButton?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  type = 'center',
  showCloseButton = true,
  closeOnBackdrop = true,
  className = '',
}: ModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle animations
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = 'unset';
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };

  const getTypeClasses = () => {
    const baseClasses = 'relative bg-white shadow-2xl transition-all duration-300 ease-out';
    
    switch (type) {
      case 'slide-right':
        return `${baseClasses} h-full w-96 transform ${isAnimating ? 'translate-x-0 translate-x-full' : ''}`;
      case 'slide-left':
        return `${baseClasses} h-full w-96 transform ${isAnimating ? 'translate-x-0 -translate-x-full' : ''}`;
      case 'slide-up':
        return `${baseClasses} w-full max-h-96 transform ${isAnimating ? 'translate-y-0 translate-y-full' : ''}`;
      case 'slide-down':
        return `${baseClasses} w-full max-h-96 transform ${isAnimating ? 'translate-y-0 -translate-y-full' : ''}`;
      default: // center
        return `${baseClasses} rounded-2xl ${sizeClasses[size]} max-h-[90vh] overflow-hidden transform ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`;   }
  };

  const getContainerClasses = () => {
    switch (type) {
      case 'slide-right':
        return 'fixed inset-y-0 right-0 z-50 flex';
      case 'slide-left':
        return 'fixed inset-y-0 left-0 z-50 flex';
      case 'slide-up':
        return 'fixed inset-x-0 bottom-0 z-50 flex';
      case 'slide-down':
        return 'fixed inset-x-0 top-0 z-50 flex';
      default: // center
        return 'fixed inset-0 z-50 overflow-y-auto min-h-full items-center justify-center p-4';   }
  };

  const getBackdropClasses = () => {
    const baseClasses = 'fixed inset-0 transition-all duration-300 ease-out';
    const blurClasses = 'backdrop-blur-sm bg-black/20';
    
    switch (type) {
      case 'slide-right':
      case 'slide-left':
        return `${baseClasses} ${blurClasses} ${isAnimating ? 'opacity-100' : 'opacity-0'}`;
      case 'slide-up':
      case 'slide-down':
        return `${baseClasses} ${blurClasses} ${isAnimating ? 'opacity-100' : 'opacity-0'}`;
      default: // center
        return `${baseClasses} ${blurClasses} ${isAnimating ? 'opacity-100' : 'opacity-0'}`;  }
  };

  return (
    <div className={getContainerClasses()}>
      {/* Backdrop with blur effect */}
      <div 
        className={getBackdropClasses()}
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div 
        className={`${getTypeClasses()} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            {title && (
              <h2 className="text-xl font-semibold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 group"
                aria-label="Cerrar modal"
              >
                <XMarkIcon className="w-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className={title || showCloseButton ? 'p-6' : 'p-6'}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Modal especializado para formularios
export function FormModal({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  className = '',
}: Omit<ModalProps, 'type'>) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      type="center"
      className={`${className} bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl`}
    >
      {children}
    </Modal>
  );
}

// Modal especializado para sidebars
export function SidebarModal({
  isOpen,
  onClose,
  children,
  title,
  side = 'right',
  className = '',
}: Omit<ModalProps, 'type' | 'size'> & { side?: 'left' | 'right' }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={side === 'right' ? 'slide-right' : 'slide-left'}
      className={`${className} bg-white/95 backdrop-blur-sm border-l border-gray-200 shadow-2xl`}
    >
      {children}
    </Modal>
  );
}

// Modal especializado para notificaciones
export function NotificationModal({
  isOpen,
  onClose,
  children,
  title,
  position = 'top',
  className = '',
}: Omit<ModalProps, 'type' | 'size'> & { position?: 'top' | 'bottom' }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={position === 'top' ? 'slide-down' : 'slide-up'}
      className={`${className} bg-white/95 backdrop-blur-sm border border-gray-200 shadow-2xl`}
    >
      {children}
    </Modal>
  );
} 