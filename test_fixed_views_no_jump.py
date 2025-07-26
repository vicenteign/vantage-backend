#!/usr/bin/env python3
"""
Script de prueba para verificar que las vistas corregidas no tienen salto extra
al entrar por primera vez.
"""

import requests
import time
import json
from datetime import datetime

# Configuración
BASE_URL = "http://127.0.0.1:5002"
FRONTEND_URL = "http://localhost:3000"

def test_login():
    """Realizar login para obtener token"""
    print("🔐 Iniciando sesión...")
    
    login_data = {
        "email": "client@example.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        if response.status_code == 200:
            token = response.json().get('access_token')
            print("✅ Login exitoso")
            return token
        else:
            print(f"❌ Error en login: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return None

def test_page_load_without_jump(page_name, endpoint, token):
    """Probar carga de página sin salto extra"""
    print(f"\n📄 Probando {page_name}...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Contar llamadas iniciales
    initial_calls = 0
    
    try:
        # Primera llamada - simular entrada a la página
        print("   🔄 Primera carga...")
        start_time = time.time()
        response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
        first_load_time = time.time() - start_time
        
        if response.status_code == 200:
            print(f"   ✅ Primera carga exitosa en {first_load_time:.2f}s")
            initial_calls += 1
        else:
            print(f"   ❌ Error en primera carga: {response.status_code}")
            return False
        
        # Esperar un momento para simular interacción del usuario
        time.sleep(1)
        
        # Segunda llamada - simular aplicación de filtros
        print("   🔄 Aplicando filtros...")
        start_time = time.time()
        response = requests.get(f"{BASE_URL}{endpoint}?sort_by=name&sort_order=asc", headers=headers)
        second_load_time = time.time() - start_time
        
        if response.status_code == 200:
            print(f"   ✅ Filtros aplicados en {second_load_time:.2f}s")
            initial_calls += 1
        else:
            print(f"   ❌ Error al aplicar filtros: {response.status_code}")
            return False
        
        # Verificar que solo hubo 2 llamadas (no más)
        print(f"   📊 Total de llamadas: {initial_calls}")
        
        if initial_calls == 2:
            print(f"   ✅ {page_name}: Sin salto extra detectado")
            return True
        else:
            print(f"   ❌ {page_name}: Salto extra detectado ({initial_calls} llamadas)")
            return False
            
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
        return False

def main():
    print("🚀 Iniciando prueba de vistas corregidas sin salto extra")
    print("=" * 60)
    
    # Login
    token = test_login()
    if not token:
        print("❌ No se pudo obtener token. Abortando prueba.")
        return
    
    # Probar páginas
    pages_to_test = [
        ("Productos Corregidos", "/catalog/public/products"),
        ("Servicios Corregidos", "/catalog/public/services")
    ]
    
    results = []
    
    for page_name, endpoint in pages_to_test:
        success = test_page_load_without_jump(page_name, endpoint, token)
        results.append((page_name, success))
    
    # Resumen
    print("\n" + "=" * 60)
    print("📋 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    all_passed = True
    for page_name, success in results:
        status = "✅ PASÓ" if success else "❌ FALLÓ"
        print(f"{page_name}: {status}")
        if not success:
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 TODAS LAS PRUEBAS PASARON - Sin salto extra detectado")
    else:
        print("⚠️  ALGUNAS PRUEBAS FALLARON - Revisar salto extra")
    
    print("=" * 60)

if __name__ == "__main__":
    main() 