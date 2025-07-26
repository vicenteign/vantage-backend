#!/usr/bin/env python3
"""
Script de prueba para verificar el sistema de notificaciones
"""

import requests
import time
import json
from typing import Dict, Any

# Configuración
BASE_URL = "http://localhost:3000"
API_URL = "http://localhost:5002"

def test_login(email: str, password: str) -> str:
    """Realizar login y obtener token"""
    print(f"🔐 Iniciando sesión como {email}...")
    
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{API_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json().get('access_token')
            user = response.json().get('user')
            print(f"✅ Login exitoso - Rol: {user.get('role')}")
            return token
        else:
            print(f"❌ Error en login: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_provider_notifications(token: str) -> bool:
    """Probar endpoints de notificaciones del proveedor"""
    print("\n🔔 Probando notificaciones del proveedor...")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        # Obtener notificaciones
        response = requests.get(f"{API_URL}/provider/notifications", headers=headers)
        if response.status_code == 200:
            data = response.json()
            notifications = data.get('notifications', [])
            unread_count = data.get('unread_count', 0)
            print(f"✅ Notificaciones obtenidas: {len(notifications)} total, {unread_count} no leídas")
            
            # Mostrar algunas notificaciones
            for i, notification in enumerate(notifications[:3]):
                print(f"  📋 {i+1}. {notification.get('title')} - {notification.get('message')}")
            
            return True
        else:
            print(f"❌ Error obteniendo notificaciones: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_create_quote_request(client_token: str, provider_id: int) -> bool:
    """Crear una solicitud de cotización para generar notificación"""
    print(f"\n📋 Creando solicitud de cotización para proveedor {provider_id}...")
    
    headers = {'Authorization': f'Bearer {client_token}'}
    
    quote_data = {
        "provider_id": provider_id,
        "item_id": 1,  # Asumiendo que existe un producto con ID 1
        "item_type": "producto",
        "quantity": 5,
        "message": "Necesito cotización urgente para este producto."
    }
    
    try:
        response = requests.post(f"{API_URL}/quotes/request", json=quote_data, headers=headers)
        if response.status_code == 201:
            quote = response.json().get('quote_request', {})
            print(f"✅ Cotización creada exitosamente - ID: {quote.get('id')}")
            return True
        else:
            print(f"❌ Error creando cotización: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_mark_notification_read(provider_token: str, notification_id: int) -> bool:
    """Marcar una notificación como leída"""
    print(f"\n✅ Marcando notificación {notification_id} como leída...")
    
    headers = {'Authorization': f'Bearer {provider_token}'}
    
    try:
        response = requests.put(f"{API_URL}/provider/notifications/{notification_id}/read", headers=headers)
        if response.status_code == 200:
            print("✅ Notificación marcada como leída")
            return True
        else:
            print(f"❌ Error marcando notificación: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_mark_all_notifications_read(provider_token: str) -> bool:
    """Marcar todas las notificaciones como leídas"""
    print(f"\n✅ Marcando todas las notificaciones como leídas...")
    
    headers = {'Authorization': f'Bearer {provider_token}'}
    
    try:
        response = requests.put(f"{API_URL}/provider/notifications/mark-all-read", headers=headers)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ {data.get('message', 'Notificaciones marcadas como leídas')}")
            return True
        else:
            print(f"❌ Error marcando notificaciones: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def main():
    """Función principal de prueba"""
    print("🚀 Iniciando pruebas del sistema de notificaciones")
    print("=" * 50)
    
    # Login como cliente
    client_token = test_login("cliente@test.com", "password123")
    if not client_token:
        print("❌ No se pudo obtener token de cliente")
        return
    
    # Login como proveedor
    provider_token = test_login("proveedor@test.com", "password123")
    if not provider_token:
        print("❌ No se pudo obtener token de proveedor")
        return
    
    # Probar notificaciones del proveedor (antes de crear cotización)
    print("\n📊 Estado inicial de notificaciones:")
    test_provider_notifications(provider_token)
    
    # Crear una cotización para generar notificación
    print("\n🔄 Generando nueva notificación...")
    if test_create_quote_request(client_token, 1):  # Asumiendo proveedor ID 1
        time.sleep(2)  # Esperar un poco para que se procese
        
        # Verificar que se creó la notificación
        print("\n📊 Estado después de crear cotización:")
        test_provider_notifications(provider_token)
        
        # Obtener notificaciones para marcar una como leída
        headers = {'Authorization': f'Bearer {provider_token}'}
        response = requests.get(f"{API_URL}/provider/notifications", headers=headers)
        if response.status_code == 200:
            notifications = response.json().get('notifications', [])
            if notifications:
                # Marcar la primera notificación como leída
                test_mark_notification_read(provider_token, notifications[0]['id'])
                
                # Verificar estado después de marcar como leída
                print("\n📊 Estado después de marcar como leída:")
                test_provider_notifications(provider_token)
        
        # Marcar todas como leídas
        test_mark_all_notifications_read(provider_token)
        
        # Verificar estado final
        print("\n📊 Estado final:")
        test_provider_notifications(provider_token)
    
    print("\n" + "=" * 50)
    print("✅ Pruebas del sistema de notificaciones completadas")

if __name__ == "__main__":
    main() 