'use client';

import { useState } from 'react';
import { Modal, FormModal, SidebarModal, NotificationModal } from '@/app/components/ui/Modal';
import { Button } from '@/app/components/ui/Button';

export function ModalDemo() {
  const [centerModal, setCenterModal] = useState(false);
  const [slideRightModal, setSlideRightModal] = useState(false);
  const [slideLeftModal, setSlideLeftModal] = useState(false);
  const [slideUpModal, setSlideUpModal] = useState(false);
  const [slideDownModal, setSlideDownModal] = useState(false);
  const [formModal, setFormModal] = useState(false);
  const [sidebarModal, setSidebarModal] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Modal System Demo</h1>
        <p className="text-gray-600">Prueba los diferentes tipos de modales con efectos modernos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Modal Centrado */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Modal Centrado</h3>
          <p className="text-gray-600 mb-4">Modal tradicional con blur y animaciones suaves</p>
          <Button onClick={() => setCenterModal(true)}>
            Abrir Modal
          </Button>
        </div>

        {/* Slide Right */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Slide Right</h3>
          <p className="text-gray-600 mb-4">Modal que se desliza desde la derecha</p>
          <Button onClick={() => setSlideRightModal(true)}>
            Abrir Slide Right
          </Button>
        </div>

        {/* Slide Left */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Slide Left</h3>
          <p className="text-gray-600 mb-4">Modal que se desliza desde la izquierda</p>
          <Button onClick={() => setSlideLeftModal(true)}>
            Abrir Slide Left
          </Button>
        </div>

        {/* Slide Up */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Slide Up</h3>
          <p className="text-gray-600 mb-4">Modal que se desliza desde abajo</p>
          <Button onClick={() => setSlideUpModal(true)}>
            Abrir Slide Up
          </Button>
        </div>

        {/* Slide Down */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Slide Down</h3>
          <p className="text-gray-600 mb-4">Modal que se desliza desde arriba</p>
          <Button onClick={() => setSlideDownModal(true)}>
            Abrir Slide Down
          </Button>
        </div>

        {/* Form Modal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Form Modal</h3>
          <p className="text-gray-600 mb-4">Modal especializado para formularios</p>
          <Button onClick={() => setFormModal(true)}>
            Abrir Form Modal
          </Button>
        </div>

        {/* Sidebar Modal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Sidebar Modal</h3>
          <p className="text-gray-600">Modal tipo sidebar lateral</p>
          <Button onClick={() => setSidebarModal(true)}>
            Abrir Sidebar
          </Button>
        </div>

        {/* Notification Modal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <h3 className="text-lg font-semibold mb-3">Notification Modal</h3>
          <p className="text-gray-600 mb-4">Modal para notificaciones</p>
          <Button onClick={() => setNotificationModal(true)}>
            Abrir Notification
          </Button>
        </div>
      </div>

      {/* Modales */}
      
      {/* Modal Centrado */}
      <Modal
        isOpen={centerModal}
        onClose={() => setCenterModal(false)}
        title="Modal Centrado"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Este es un modal centrado con efectos de blur y animaciones suaves. 
            Incluye backdrop con blur y transiciones elegantes.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setCenterModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setCenterModal(false)}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Slide Right Modal */}
      <Modal
        isOpen={slideRightModal}
        onClose={() => setSlideRightModal(false)}
        title="Slide Right Modal"
        type="slide-right"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Este modal se desliza desde la derecha con una animación suave.
            Perfecto para paneles laterales y configuraciones.
          </p>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Configuración 1</h4>
              <p className="text-sm text-gray-60">Descripción de la configuración</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium">Configuración 2</h4>
              <p className="text-sm text-gray-60">Descripción de la configuración</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Slide Left Modal */}
      <Modal
        isOpen={slideLeftModal}
        onClose={() => setSlideLeftModal(false)}
        title="Slide Left Modal"
        type="slide-left"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Este modal se desliza desde la izquierda. Ideal para navegación
            y menús de opciones.
          </p>
          <nav className="space-y-2">
            <a href="#" className="block p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
              Opción1
            </a>
            <a href="#" className="block p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
              Opción2
            </a>
            <a href="#" className="block p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100">
              Opción3
            </a>
          </nav>
        </div>
      </Modal>

      {/* Slide Up Modal */}
      <Modal
        isOpen={slideUpModal}
        onClose={() => setSlideUpModal(false)}
        title="Slide Up Modal"
        type="slide-up"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Este modal se desliza desde abajo. Perfecto para acciones rápidas
            y confirmaciones.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setSlideUpModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setSlideUpModal(false)}>
              Aceptar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Slide Down Modal */}
      <Modal
        isOpen={slideDownModal}
        onClose={() => setSlideDownModal(false)}
        title="Slide Down Modal"
        type="slide-down"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Este modal se desliza desde arriba. Ideal para notificaciones
            importantes y alertas.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ Esta es una notificación importante que requiere tu atención.
            </p>
          </div>
        </div>
      </Modal>

      {/* Form Modal */}
      <FormModal
        isOpen={formModal}
        onClose={() => setFormModal(false)}
        title="Formulario de Ejemplo"
        size="lg"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu nombre"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingresa tu email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Escribe tu mensaje"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setFormModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setFormModal(false)}>
              Enviar
            </Button>
          </div>
        </form>
      </FormModal>

      {/* Sidebar Modal */}
      <SidebarModal
        isOpen={sidebarModal}
        onClose={() => setSidebarModal(false)}
        title="Sidebar de Configuración"
        side="right"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Configuración General</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Notificaciones por email</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Notificaciones push</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Modo oscuro</span>
              </label>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Privacidad</h4>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Compartir datos de uso</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Mostrar perfil público</span>
              </label>
            </div>
          </div>
        </div>
      </SidebarModal>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={notificationModal}
        onClose={() => setNotificationModal(false)}
        title="Notificación Importante"
        position="top"
      >
        <div className="space-y-3">
          <p className="text-gray-600">
            Has recibido una nueva solicitud de cotización que requiere tu atención inmediata.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setNotificationModal(false)}>
              Más tarde
            </Button>
            <Button onClick={() => setNotificationModal(false)}>
              Ver ahora
            </Button>
          </div>
        </div>
      </NotificationModal>
    </div>
  );
} 