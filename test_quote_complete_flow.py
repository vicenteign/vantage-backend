#!/usr/bin/env python3
"""
Script de prueba para el flujo completo de cotizaciones:
1. Cliente solicita cotización
2. Cliente sube documentos
3. Proveedor revisa cotización
4. Proveedor responde con cotización
"""

import requests
import json
import time
import os
from datetime import datetime

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
            print(f"✅ Login exitoso - Usuario: {user.get('full_name', 'N/A')}")
            return token
        else:
            print(f"❌ Error en login: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_create_quote_request(client_token, provider_id=1, item_id=1):
    """Crear una solicitud de cotización"""
    print(f"\n📋 Creando solicitud de cotización...")
    
    headers = {'Authorization': f'Bearer {client_token}'}
    
    quote_data = {
        "provider_id": provider_id,
        "item_id": item_id,
        "item_type": "producto",
        "quantity": 10,
        "message": "Necesito cotización urgente para este producto. Por favor incluir especificaciones técnicas y tiempo de entrega."
    }
    
    try:
        response = requests.post(f"{BASE_URL}/quotes/request", json=quote_data, headers=headers)
        if response.status_code == 201:
            quote = response.json().get('quote_request', {})
            quote_id = quote.get('id')
            print(f"✅ Cotización creada exitosamente - ID: {quote_id}")
            print(f"   Estado: {quote.get('status', 'N/A')}")
            print(f"   Mensaje: {quote.get('message', 'N/A')}")
            return quote_id
        else:
            print(f"❌ Error creando cotización: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_upload_document(client_token, quote_id):
    """Subir documento a la cotización"""
    print(f"\n📎 Subiendo documento a cotización {quote_id}...")
    
    headers = {'Authorization': f'Bearer {client_token}'}
    
    # Crear un archivo de prueba
    test_file_path = f"test_document_{quote_id}.txt"
    with open(test_file_path, 'w') as f:
        f.write(f"Documento de prueba para cotización {quote_id}\n")
        f.write(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write("Especificaciones técnicas requeridas:\n")
        f.write("- Material: Acero inoxidable\n")
        f.write("- Dimensiones: 100x50x25 cm\n")
        f.write("- Peso máximo: 50 kg\n")
    
    try:
        with open(test_file_path, 'rb') as f:
            files = {'file': (test_file_path, f, 'text/plain')}
            
            response = requests.post(f"{BASE_URL}/quotes/{quote_id}/attachments", 
                                   files=files, headers=headers)
        
        # Limpiar archivo de prueba
        os.remove(test_file_path)
        
        if response.status_code == 201:
            upload = response.json().get('attachment', {})
            print(f"✅ Documento subido exitosamente - ID: {upload.get('id')}")
            print(f"   Archivo: {upload.get('original_filename', 'N/A')}")
            return upload.get('id')
        else:
            print(f"❌ Error subiendo documento: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        if os.path.exists(test_file_path):
            os.remove(test_file_path)
        return None

def test_get_quote_details(client_token, quote_id):
    """Obtener detalles de la cotización"""
    print(f"\n📋 Obteniendo detalles de cotización {quote_id}...")
    
    headers = {'Authorization': f'Bearer {client_token}'}
    
    try:
        response = requests.get(f"{BASE_URL}/quotes/{quote_id}", headers=headers)
        if response.status_code == 200:
            quote = response.json().get('quote', {})
            print(f"✅ Detalles obtenidos exitosamente")
            print(f"   Estado: {quote.get('status', 'N/A')}")
            print(f"   Proveedor: {quote.get('provider', {}).get('name', 'N/A')}")
            print(f"   Producto: {quote.get('item', {}).get('name', 'N/A')}")
            print(f"   Cantidad: {quote.get('quantity', 'N/A')}")
            print(f"   Fecha: {quote.get('created_at', 'N/A')}")
            
            # Mostrar documentos adjuntos
            attachments = quote.get('attachments', [])
            if attachments:
                print(f"   Documentos adjuntos: {len(attachments)}")
                for attachment in attachments:
                    print(f"     - {attachment.get('original_filename', 'N/A')}")
            else:
                print(f"   Documentos adjuntos: Ninguno")
            
            return quote
        else:
            print(f"❌ Error obteniendo detalles: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_provider_view_quotes(provider_token):
    """Proveedor ve las cotizaciones pendientes"""
    print(f"\n👨‍💼 Proveedor revisando cotizaciones pendientes...")
    
    headers = {'Authorization': f'Bearer {provider_token}'}
    
    try:
        response = requests.get(f"{BASE_URL}/quotes/received", headers=headers)
        if response.status_code == 200:
            data = response.json()
            quotes = data.get('quote_requests', [])
            print(f"✅ Cotizaciones obtenidas: {len(quotes)}")
            
            for quote in quotes:
                print(f"   📋 ID: {quote.get('id')} - Estado: {quote.get('status')}")
                print(f"      Cliente: {quote.get('client_name', 'N/A')}")
                print(f"      Producto: {quote.get('item_name', 'N/A')}")
                print(f"      Cantidad: {quote.get('quantity', 'N/A')}")
                print(f"      Fecha: {quote.get('created_at', 'N/A')}")
                
                # Mostrar documentos si los hay
                attachments = quote.get('attachments', [])
                if attachments:
                    print(f"      Documentos: {len(attachments)} adjuntos")
                
                print()
            
            return quotes
        else:
            print(f"❌ Error obteniendo cotizaciones: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_provider_respond_quote(provider_token, quote_id):
    """Proveedor responde a la cotización"""
    print(f"\n💼 Proveedor respondiendo cotización {quote_id}...")
    
    headers = {'Authorization': f'Bearer {provider_token}'}
    
    response_data = {
        "price": 1500.00,
        "delivery_time": "15 días hábiles",
        "message": "Cotización enviada. Producto disponible en stock. Incluye garantía de 1 año y soporte técnico.",
        "terms": "Pago 50% al momento del pedido, 50% antes del envío. Garantía de 1 año."
    }
    
    try:
        response = requests.post(f"{BASE_URL}/provider/quotes/{quote_id}/respond", 
                               json=response_data, headers=headers)
        if response.status_code == 200:
            quote_response = response.json().get('quote_response', {})
            print(f"✅ Respuesta enviada exitosamente - ID: {quote_response.get('id')}")
            print(f"   Precio: ${quote_response.get('price', 'N/A')}")
            print(f"   Tiempo de entrega: {quote_response.get('delivery_time', 'N/A')}")
            print(f"   Mensaje: {quote_response.get('message', 'N/A')}")
            return quote_response.get('id')
        else:
            print(f"❌ Error enviando respuesta: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_client_view_responses(client_token, quote_id):
    """Cliente ve las respuestas a su cotización"""
    print(f"\n👤 Cliente revisando respuestas a cotización {quote_id}...")
    
    headers = {'Authorization': f'Bearer {client_token}'}
    
    try:
        response = requests.get(f"{BASE_URL}/api/quotes/{quote_id}/responses", headers=headers)
        if response.status_code == 200:
            data = response.json()
            responses = data.get('quote_responses', [])
            print(f"✅ Respuestas obtenidas: {len(responses)}")
            
            for resp in responses:
                print(f"   💼 Respuesta ID: {resp.get('id')}")
                print(f"      Proveedor: {resp.get('provider_name', 'N/A')}")
                print(f"      Precio: ${resp.get('price', 'N/A')}")
                print(f"      Tiempo de entrega: {resp.get('delivery_time', 'N/A')}")
                print(f"      Mensaje: {resp.get('message', 'N/A')}")
                print(f"      Fecha: {resp.get('created_at', 'N/A')}")
                print()
            
            return responses
        else:
            print(f"❌ Error obteniendo respuestas: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def main():
    """Función principal de prueba"""
    print("🚀 Iniciando prueba del flujo completo de cotizaciones")
    print("=" * 60)
    
    # Login como cliente
    client_token = test_login("cliente1@mineraandes.cl", "password123")
    if not client_token:
        print("❌ No se pudo obtener token de cliente")
        return
    
    # Login como proveedor
    provider_token = test_login("juan.perez@solucioneshidraulicas.cl", "password123")
    if not provider_token:
        print("❌ No se pudo obtener token de proveedor")
        return
    
    # 1. Cliente crea cotización
    quote_id = test_create_quote_request(client_token)
    if not quote_id:
        print("❌ No se pudo crear la cotización")
        return
    
    # 2. Cliente sube documento
    upload_id = test_upload_document(client_token, quote_id)
    if not upload_id:
        print("⚠️  No se pudo subir documento, continuando...")
    
    # 3. Cliente verifica detalles
    quote_details = test_get_quote_details(client_token, quote_id)
    if not quote_details:
        print("❌ No se pudieron obtener detalles de la cotización")
        return
    
    # 4. Proveedor ve cotizaciones pendientes
    pending_quotes = test_provider_view_quotes(provider_token)
    if not pending_quotes:
        print("❌ No se pudieron obtener cotizaciones pendientes")
        return
    
    # 5. Proveedor responde a la cotización
    response_id = test_provider_respond_quote(provider_token, quote_id)
    if not response_id:
        print("❌ No se pudo enviar respuesta")
        return
    
    # 6. Cliente ve las respuestas
    responses = test_client_view_responses(client_token, quote_id)
    if not responses:
        print("❌ No se pudieron obtener respuestas")
        return
    
    print("\n" + "=" * 60)
    print("✅ FLUJO COMPLETO DE COTIZACIONES EXITOSO")
    print("=" * 60)
    print("📋 Resumen del flujo:")
    print(f"   1. ✅ Cotización creada (ID: {quote_id})")
    print(f"   2. ✅ Documento subido (ID: {upload_id})" if upload_id else "   2. ⚠️  Documento no subido")
    print(f"   3. ✅ Detalles verificados")
    print(f"   4. ✅ Proveedor vio {len(pending_quotes)} cotizaciones")
    print(f"   5. ✅ Respuesta enviada (ID: {response_id})")
    print(f"   6. ✅ Cliente vio {len(responses)} respuestas")
    print("\n🎉 ¡Flujo de cotizaciones funcionando correctamente!")

if __name__ == "__main__":
    main() 