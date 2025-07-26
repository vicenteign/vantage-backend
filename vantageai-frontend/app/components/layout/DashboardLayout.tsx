'use client';

import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header solo para móviles */}
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Main content */}
        <main className="flex-1 lg:ml-0 transition-all duration-300">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 