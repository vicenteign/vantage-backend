#!/usr/bin/env python3
"""
Script para probar los endpoints del backend
"""

import requests
import json

BASE_URL = "http://127.0.0.1:5001"

def test_public_endpoints():
    """Probar endpoints públicos"""
    print("🧪 Probando endpoints públicos...")
    
    # Probar productos públicos
    try:
        response = requests.get(f"{BASE_URL}/catalog/public/products")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Productos públicos: {len(data.get('products', []))} productos encontrados")
        else:
            print(f"❌ Error en productos públicos: {response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando a productos públicos: {e}")
    
    # Probar servicios públicos
    try:
        response = requests.get(f"{BASE_URL}/catalog/public/services")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Servicios públicos: {len(data.get('services', []))} servicios encontrados")
        else:
            print(f"❌ Error en servicios públicos: {response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando a servicios públicos: {e}")
    
    # Probar categorías públicas
    try:
        response = requests.get(f"{BASE_URL}/catalog/public/categories")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Categorías públicas: {len(data.get('categories', []))} categorías encontradas")
        else:
            print(f"❌ Error en categorías públicas: {response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando a categorías públicas: {e}")

def test_login():
    """Probar login con usuarios de prueba"""
    print("\n🔐 Probando login...")
    
    test_users = [
        {"email": "ana.contreras@solhidraulicas.cl", "password": "password123", "role": "proveedor"},
        {"email": "carlos.herrera@andinanorte.cl", "password": "password123", "role": "cliente"},
        {"email": "isidora.jimenez@cobre-atacama.cl", "password": "password123", "role": "cliente"},
        {"email": "matias.rojas@gasopacifico.com", "password": "password123", "role": "cliente"}
    ]
    
    for user in test_users:
        try:
            response = requests.post(f"{BASE_URL}/auth/login", 
                                   json={"email": user["email"], "password": user["password"]})
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Login exitoso: {user['email']} ({user['role']})")
                print(f"   Token: {data.get('access_token', '')[:20]}...")
            else:
                print(f"❌ Login fallido: {user['email']} - {response.status_code}")
        except Exception as e:
            print(f"❌ Error en login de {user['email']}: {e}")

if __name__ == "__main__":
    print("🚀 Iniciando pruebas de endpoints...")
    print("=" * 50)
    
    test_public_endpoints()
    test_login()
    
    print("\n" + "=" * 50)
    print("✅ Pruebas completadas!") 