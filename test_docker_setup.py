#!/usr/bin/env python3
"""
Script para probar que la aplicación dockerizada funciona correctamente
"""

import requests
import json
import time

BASE_URL = "http://localhost:5002"
FRONTEND_URL = "http://localhost:3000"

def test_backend_health():
    """Probar que el backend responde"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend health check: OK")
            return True
        else:
            print(f"❌ Backend health check: Error {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend health check: Error de conexión - {str(e)}")
        return False

def test_frontend_health():
    """Probar que el frontend responde"""
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend health check: OK")
            return True
        else:
            print(f"❌ Frontend health check: Error {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend health check: Error de conexión - {str(e)}")
        return False

def test_products_endpoint():
    """Probar endpoint de productos"""
    try:
        response = requests.get(f"{BASE_URL}/catalog/public/products", timeout=5)
        if response.status_code == 200:
            data = response.json()
            products_count = len(data.get('products', []))
            print(f"✅ Products endpoint: OK ({products_count} productos)")
            return True
        else:
            print(f"❌ Products endpoint: Error {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Products endpoint: Error de conexión - {str(e)}")
        return False

def test_login():
    """Probar login con usuario de prueba"""
    try:
        login_data = {
            "email": "cliente1@mineraandes.cl",
            "password": "password123"
        }
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if 'access_token' in data:
                print("✅ Login: OK (token obtenido)")
                return data['access_token']
            else:
                print("❌ Login: No se obtuvo token")
                return None
        else:
            print(f"❌ Login: Error {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Login: Error de conexión - {str(e)}")
        return None

def test_authenticated_endpoint(token):
    """Probar endpoint autenticado"""
    if not token:
        print("❌ Authenticated endpoint: No hay token")
        return False
    
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/api/ia/search-catalog", headers=headers, timeout=5)
        if response.status_code == 200:
            print("✅ Authenticated endpoint: OK")
            return True
        else:
            print(f"❌ Authenticated endpoint: Error {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Authenticated endpoint: Error de conexión - {str(e)}")
        return False

def main():
    """Función principal de pruebas"""
    print("🚀 Iniciando pruebas de la aplicación dockerizada")
    print("=" * 60)
    
    tests = [
        {"name": "Backend Health", "function": test_backend_health},
        {"name": "Frontend Health", "function": test_frontend_health},
        {"name": "Products Endpoint", "function": test_products_endpoint},
        {"name": "Login", "function": test_login},
    ]
    
    successful_tests = 0
    total_tests = len(tests)
    token = None
    
    for i, test in enumerate(tests, 1):
        print(f"\n📝 Prueba {i}/{total_tests}: {test['name']}")
        print("-" * 40)
        
        if test['name'] == "Login":
            result = test['function']()
            if result:
                token = result
                successful_tests += 1
        else:
            result = test['function']()
            if result:
                successful_tests += 1
        
        if i < total_tests:
            time.sleep(1)
    
    # Prueba adicional con token
    if token:
        print(f"\n📝 Prueba adicional: Endpoint autenticado")
        print("-" * 40)
        if test_authenticated_endpoint(token):
            successful_tests += 1
        total_tests += 1
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS - APLICACIÓN DOCKERIZADA")
    print("=" * 60)
    print(f"✅ Pruebas exitosas: {successful_tests}/{total_tests}")
    print(f"❌ Pruebas fallidas: {total_tests - successful_tests}/{total_tests}")
    
    if successful_tests == total_tests:
        print("🎉 ¡TODAS LAS PRUEBAS EXITOSAS! La aplicación dockerizada funciona correctamente.")
        print("\n🌐 URLs de acceso:")
        print(f"   Frontend: {FRONTEND_URL}")
        print(f"   Backend API: {BASE_URL}")
        print("\n👤 Credenciales de prueba:")
        print("   Email: cliente1@mineraandes.cl")
        print("   Password: password123")
    elif successful_tests > total_tests * 0.7:
        print("👍 La mayoría de las pruebas exitosas. La aplicación funciona bien.")
    else:
        print("⚠️ Muchas pruebas fallidas. Revisar configuración de Docker.")
    
    print("\n🔧 Para ver logs de los contenedores:")
    print("   docker compose logs backend")
    print("   docker compose logs frontend")

if __name__ == "__main__":
    main() 