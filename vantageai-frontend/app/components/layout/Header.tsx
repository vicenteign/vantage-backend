'use client';

import { useEffect, useState } from 'react';
import { NotificationCenter } from '../notifications/NotificationCenter';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const info = localStorage.getItem('userInfo');
    setUserRole(role);
    if (info) {
      setUserInfo(JSON.parse(info));
    }
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900">Vantage.ai</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {userRole === 'proveedor' && (
            <div data-tour="notifications">
              <NotificationCenter />
            </div>
          )}
          {userInfo && (
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">
                {(userInfo.name || userInfo.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 