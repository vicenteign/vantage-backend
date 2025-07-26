#!/usr/bin/env python3
"""
Script de prueba para verificar que la cotización funciona correctamente
"""

import requests
import json

# Configuración
BASE_URL = "http://127.0.0.1:5002"
LOGIN_URL = f"{BASE_URL}/auth/login"
QUOTE_URL = f"{BASE_URL}/quotes/request"

def test_quote_request():
    """Probar el envío de una cotización"""
    
    # 1. Login como cliente
    print("1. Iniciando sesión como cliente...")
    login_data = {
        "email": "cliente1@mineraandes.cl",
        "password": "password123"
    }
    
    login_response = requests.post(LOGIN_URL, json=login_data)
    if login_response.status_code != 200:
        print(f"❌ Error en login: {login_response.status_code}")
        print(login_response.text)
        return
    
    token = login_response.json().get('access_token')
    if not token:
        print("❌ No se obtuvo token de acceso")
        return
    
    print("✅ Login exitoso")
    
    # 2. Enviar cotización sin branch_id
    print("\n2. Enviando cotización sin branch_id...")
    headers = {"Authorization": f"Bearer {token}"}
    
    quote_data = {
        "provider_id": 1,
        "item_id": 1,
        "item_type": "producto",
        "quantity": 2,
        "message": "Prueba de cotización sin sucursal específica"
    }
    
    quote_response = requests.post(QUOTE_URL, json=quote_data, headers=headers)
    print(f"Status: {quote_response.status_code}")
    print(f"Response: {quote_response.text}")
    
    if quote_response.status_code == 201:
        print("✅ Cotización enviada exitosamente sin branch_id")
    else:
        print("❌ Error al enviar cotización sin branch_id")
    
    # 3. Enviar cotización con branch_id (si existe)
    print("\n3. Enviando cotización con branch_id...")
    quote_data_with_branch = {
        "provider_id": 1,
        "item_id": 1,
        "item_type": "producto",
        "quantity": 1,
        "message": "Prueba de cotización con sucursal específica",
        "branch_id": 1  # Intentar con ID 1
    }
    
    quote_response2 = requests.post(QUOTE_URL, json=quote_data_with_branch, headers=headers)
    print(f"Status: {quote_response2.status_code}")
    print(f"Response: {quote_response2.text}")
    
    if quote_response2.status_code == 201:
        print("✅ Cotización enviada exitosamente con branch_id")
    elif quote_response2.status_code == 404:
        print("ℹ️  Sucursal no encontrada (esperado si no hay sucursales en la BD)")
    else:
        print("❌ Error inesperado al enviar cotización con branch_id")

if __name__ == "__main__":
    print("🧪 Probando corrección de cotización...")
    test_quote_request()
    print("\n✅ Prueba completada") 