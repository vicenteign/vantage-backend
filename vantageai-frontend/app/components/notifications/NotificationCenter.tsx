'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import apiClient from '@/app/lib/api';

interface Notification {
  id: number;
  type: 'quote_request' | 'quote_response' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  data?: {
    quote_id?: number;
    item_name?: string;
    client_name?: string;
  };
}

interface NotificationCenterProps {
  className?: string;
}

export function NotificationCenter({ className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar notificaciones
  useEffect(() => {
    fetchNotifications();
    
    // Polling cada 30 segundos para nuevas notificaciones
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/provider/notifications');
      const fetchedNotifications = response.data.notifications || [];
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter((n: Notification) => !n.is_read).length);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      // No mostrar toast para errores de polling
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await apiClient.put(`/provider/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      toast.error('Error al marcar notificación como leída');
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.put('/provider/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error: any) {
      toast.error('Error al marcar notificaciones como leídas');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'quote_request':
        return '📋';
      case 'quote_response':
        return '💬';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        aria-label="Notificaciones"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Cargando notificaciones...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-sm font-medium ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        {notification.data && (
                          <div className="mt-2 text-xs text-gray-500">
                            {notification.data.item_name && (
                              <p>Producto: {notification.data.item_name}</p>
                            )}
                            {notification.data.client_name && (
                              <p>Cliente: {notification.data.client_name}</p>
                            )}
                          </div>
                        )}
                      </div>
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  // Aquí podrías navegar a una página de todas las notificaciones
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 