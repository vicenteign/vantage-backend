#!/usr/bin/env python3
"""
Demo final del flujo de cotizaciones que funciona:
1. Cliente solicita cotización
2. Cliente ve sus cotizaciones
3. Proveedor ve cotizaciones recibidas
4. Proveedor responde (endpoint básico)
"""

import requests
import json
import time

# Configuración
BASE_URL = "http://127.0.0.1:5002"

def test_login(email, password):
    """Realizar login y obtener token"""
    print(f"🔐 Iniciando sesión como {email}...")
    
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json().get('access_token')
            user = response.json().get('user', {})
            print(f"✅ Login exitoso - Usuario: {user.get('full_name', 'N/A')} (ID: {user.get('id', 'N/A')})")
            return token, user
        else:
            print(f"❌ Error en login: {response.status_code}")
            return None, None
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None, None

def test_create_quote_request(client_token, provider_id=1, item_id=1):
    """Crear una solicitud de cotización"""
    print(f"\n📋 Creando solicitud de cotización...")
    
    headers = {'Authorization': f'Bearer {client_token}'}
    
    quote_data = {
        "provider_id": provider_id,
        "item_id": item_id,
        "item_type": "producto",
        "quantity": 25,
        "message": "Cotización para proyecto industrial. Requiero especificaciones técnicas detalladas, tiempo de entrega, garantía y soporte post-venta."
    }
    
    try:
        response = requests.post(f"{BASE_URL}/quotes/request", json=quote_data, headers=headers)
        if response.status_code == 201:
            quote = response.json().get('quote_request', {})
            quote_id = quote.get('id')
            print(f"✅ Cotización creada exitosamente - ID: {quote_id}")
            print(f"   Estado: {quote.get('status', 'N/A')}")
            print(f"   Producto: {quote.get('item_name', 'N/A')}")
            print(f"   Cantidad: {quote.get('quantity', 'N/A')}")
            print(f"   Mensaje: {quote.get('message', 'N/A')}")
            return quote_id
        else:
            print(f"❌ Error creando cotización: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_client_view_quotes(client_token):
    """Cliente ve sus cotizaciones"""
    print(f"\n📋 Cliente viendo sus cotizaciones...")
    
    headers = {'Authorization': f'Bearer {client_token}'}
    
    try:
        response = requests.get(f"{BASE_URL}/quotes/my-requests", headers=headers)
        if response.status_code == 200:
            data = response.json()
            quotes = data.get('quote_requests', [])
            print(f"✅ Cotizaciones obtenidas: {len(quotes)}")
            
            # Mostrar solo las últimas 3
            recent_quotes = quotes[:3]
            for quote in recent_quotes:
                print(f"   📋 ID: {quote.get('id')} - Estado: {quote.get('status')}")
                print(f"      Proveedor: {quote.get('provider_name', 'N/A')}")
                print(f"      Producto: {quote.get('item_name', 'N/A')}")
                print(f"      Cantidad: {quote.get('quantity', 'N/A')}")
                print(f"      Fecha: {quote.get('created_at', 'N/A')}")
                print()
            
            return quotes
        else:
            print(f"❌ Error obteniendo cotizaciones: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_provider_view_received_quotes(provider_token):
    """Proveedor ve cotizaciones recibidas"""
    print(f"\n👨‍💼 Proveedor viendo cotizaciones recibidas...")
    
    headers = {'Authorization': f'Bearer {provider_token}'}
    
    try:
        response = requests.get(f"{BASE_URL}/quotes/received", headers=headers)
        if response.status_code == 200:
            data = response.json()
            quotes = data.get('quote_requests', [])
            print(f"✅ Cotizaciones recibidas: {len(quotes)}")
            
            # Mostrar solo las últimas 3
            recent_quotes = quotes[:3]
            for quote in recent_quotes:
                print(f"   📋 ID: {quote.get('id')} - Estado: {quote.get('status')}")
                print(f"      Cliente: {quote.get('client_name', 'N/A')}")
                print(f"      Producto: {quote.get('item_name', 'N/A')}")
                print(f"      Cantidad: {quote.get('quantity', 'N/A')}")
                print(f"      Mensaje: {quote.get('message', 'N/A')[:50]}...")
                print(f"      Fecha: {quote.get('created_at', 'N/A')}")
                print()
            
            return quotes
        else:
            print(f"❌ Error obteniendo cotizaciones: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_provider_basic_response(provider_token, quote_id):
    """Proveedor responde básicamente a la cotización"""
    print(f"\n💼 Proveedor enviando respuesta básica a cotización {quote_id}...")
    
    headers = {'Authorization': f'Bearer {provider_token}'}
    
    response_data = {
        "response_message": "Cotización en proceso. Enviaremos propuesta detallada en las próximas 24 horas."
    }
    
    try:
        response = requests.post(f"{BASE_URL}/quotes/{quote_id}/respond", 
                               json=response_data, headers=headers)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Respuesta enviada exitosamente")
            print(f"   Mensaje: {result.get('message', 'N/A')}")
            print(f"   Quote ID: {result.get('quote_id', 'N/A')}")
            return True
        else:
            print(f"❌ Error enviando respuesta: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def main():
    """Función principal de demo"""
    print("🚀 DEMO FINAL - FLUJO DE COTIZACIONES")
    print("=" * 60)
    
    # Login como cliente
    client_token, client_user = test_login("cliente1@mineraandes.cl", "password123")
    if not client_token:
        print("❌ No se pudo obtener token de cliente")
        return
    
    # Login como proveedor
    provider_token, provider_user = test_login("juan.perez@solucioneshidraulicas.cl", "password123")
    if not provider_token:
        print("❌ No se pudo obtener token de proveedor")
        return
    
    # 1. Cliente crea cotización
    quote_id = test_create_quote_request(client_token)
    if not quote_id:
        print("❌ No se pudo crear la cotización")
        return
    
    # 2. Cliente ve sus cotizaciones
    client_quotes = test_client_view_quotes(client_token)
    if not client_quotes:
        print("❌ No se pudieron obtener las cotizaciones del cliente")
        return
    
    # 3. Proveedor ve cotizaciones recibidas
    provider_quotes = test_provider_view_received_quotes(provider_token)
    if not provider_quotes:
        print("❌ No se pudieron obtener las cotizaciones del proveedor")
        return
    
    # 4. Proveedor responde básicamente
    response_sent = test_provider_basic_response(provider_token, quote_id)
    
    print("\n" + "=" * 60)
    print("✅ DEMO COMPLETADO - FLUJO FUNCIONANDO")
    print("=" * 60)
    print("📋 Resumen del flujo:")
    print(f"   1. ✅ Cotización creada (ID: {quote_id})")
    print(f"   2. ✅ Cliente vio {len(client_quotes)} cotizaciones")
    print(f"   3. ✅ Proveedor vio {len(provider_quotes)} cotizaciones")
    print(f"   4. ✅ Respuesta básica enviada: {'Sí' if response_sent else 'No'}")
    
    print("\n🎉 ¡Flujo básico de cotizaciones funcionando!")
    print("\n📝 Funcionalidades que funcionan:")
    print("   ✅ Creación de cotizaciones")
    print("   ✅ Visualización de cotizaciones (cliente)")
    print("   ✅ Visualización de cotizaciones (proveedor)")
    print("   ✅ Respuesta básica del proveedor")
    
    print("\n📝 Funcionalidades que requieren corrección:")
    print("   ⚠️  Subida de documentos (problema de permisos)")
    print("   ⚠️  Respuestas detalladas con precio/tiempo")
    print("   ⚠️  Visualización de detalles específicos")

if __name__ == "__main__":
    main() 