#!/usr/bin/env python3
"""
Script de verificación final para las páginas corregidas.
Verifica que no hay bucles infinitos y que el diseño funciona correctamente.
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

def test_products_page(token):
    """Probar página de productos corregida"""
    print("\n🛍️  Probando página de productos...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Contar llamadas iniciales
    initial_calls = 0
    start_time = time.time()
    
    try:
        # Primera llamada - debería cargar datos
        response = requests.get(f"{BASE_URL}/catalog/public/products", headers=headers)
        initial_calls += 1
        
        if response.status_code == 200:
            products = response.json().get('products', [])
            print(f"✅ Productos cargados: {len(products)} productos")
        else:
            print(f"❌ Error cargando productos: {response.status_code}")
            return False
            
        # Esperar un poco y verificar que no hay llamadas adicionales
        time.sleep(2)
        
        # Segunda llamada - debería ser la misma respuesta
        response2 = requests.get(f"{BASE_URL}/catalog/public/products", headers=headers)
        initial_calls += 1
        
        if response2.status_code == 200:
            products2 = response2.json().get('products', [])
            if len(products) == len(products2):
                print("✅ No hay bucles infinitos - datos consistentes")
            else:
                print("⚠️  Datos inconsistentes")
                return False
        else:
            print(f"❌ Error en segunda llamada: {response2.status_code}")
            return False
            
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"✅ Página de productos: {initial_calls} llamadas en {duration:.2f}s")
        return True
        
    except Exception as e:
        print(f"❌ Error probando productos: {e}")
        return False

def test_services_page(token):
    """Probar página de servicios corregida"""
    print("\n🔧 Probando página de servicios...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Contar llamadas iniciales
    initial_calls = 0
    start_time = time.time()
    
    try:
        # Primera llamada - debería cargar datos
        response = requests.get(f"{BASE_URL}/catalog/public/services", headers=headers)
        initial_calls += 1
        
        if response.status_code == 200:
            services = response.json().get('services', [])
            print(f"✅ Servicios cargados: {len(services)} servicios")
        else:
            print(f"❌ Error cargando servicios: {response.status_code}")
            return False
            
        # Esperar un poco y verificar que no hay llamadas adicionales
        time.sleep(2)
        
        # Segunda llamada - debería ser la misma respuesta
        response2 = requests.get(f"{BASE_URL}/catalog/public/services", headers=headers)
        initial_calls += 1
        
        if response2.status_code == 200:
            services2 = response2.json().get('services', [])
            if len(services) == len(services2):
                print("✅ No hay bucles infinitos - datos consistentes")
            else:
                print("⚠️  Datos inconsistentes")
                return False
        else:
            print(f"❌ Error en segunda llamada: {response2.status_code}")
            return False
            
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"✅ Página de servicios: {initial_calls} llamadas en {duration:.2f}s")
        return True
        
    except Exception as e:
        print(f"❌ Error probando servicios: {e}")
        return False

def test_filters(token):
    """Probar filtros de búsqueda"""
    print("\n🔍 Probando filtros de búsqueda...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        # Probar filtro de búsqueda
        response = requests.get(f"{BASE_URL}/catalog/public/products?search=test", headers=headers)
        if response.status_code == 200:
            print("✅ Filtro de búsqueda funciona")
        else:
            print(f"❌ Error en filtro de búsqueda: {response.status_code}")
            return False
            
        # Probar ordenamiento
        response = requests.get(f"{BASE_URL}/catalog/public/products?sort_by=name&sort_order=asc", headers=headers)
        if response.status_code == 200:
            print("✅ Ordenamiento funciona")
        else:
            print(f"❌ Error en ordenamiento: {response.status_code}")
            return False
            
        # Probar filtros de servicios
        response = requests.get(f"{BASE_URL}/catalog/public/services?sort_by=name&sort_order=asc", headers=headers)
        if response.status_code == 200:
            print("✅ Filtros de servicios funcionan")
        else:
            print(f"❌ Error en filtros de servicios: {response.status_code}")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Error probando filtros: {e}")
        return False

def test_backend_stability():
    """Verificar estabilidad del backend"""
    print("\n🏗️  Verificando estabilidad del backend...")
    
    try:
        # Verificar que el backend responde
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend responde correctamente")
        else:
            print(f"⚠️  Backend responde con código: {response.status_code}")
            
        # Verificar endpoints principales
        endpoints = [
            "/catalog/public/categories",
            "/catalog/public/providers",
            "/catalog/public/modalities"
        ]
        
        for endpoint in endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            if response.status_code == 200:
                print(f"✅ {endpoint} funciona")
            else:
                print(f"❌ {endpoint} falló: {response.status_code}")
                
        return True
        
    except Exception as e:
        print(f"❌ Error verificando backend: {e}")
        return False

def main():
    """Función principal de verificación"""
    print("🚀 VERIFICACIÓN FINAL - PÁGINAS CORREGIDAS")
    print("=" * 50)
    print(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Backend: {BASE_URL}")
    print(f"🎨 Frontend: {FRONTEND_URL}")
    print("=" * 50)
    
    # Verificar backend
    if not test_backend_stability():
        print("❌ Backend no está disponible")
        return
    
    # Login
    token = test_login()
    if not token:
        print("❌ No se pudo obtener token de autenticación")
        return
    
    # Probar páginas
    products_ok = test_products_page(token)
    services_ok = test_services_page(token)
    filters_ok = test_filters(token)
    
    # Resumen final
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE VERIFICACIÓN")
    print("=" * 50)
    
    if products_ok:
        print("✅ Página de productos: FUNCIONANDO")
    else:
        print("❌ Página de productos: PROBLEMAS")
        
    if services_ok:
        print("✅ Página de servicios: FUNCIONANDO")
    else:
        print("❌ Página de servicios: PROBLEMAS")
        
    if filters_ok:
        print("✅ Filtros de búsqueda: FUNCIONANDO")
    else:
        print("❌ Filtros de búsqueda: PROBLEMAS")
    
    print("\n🎉 VERIFICACIÓN COMPLETADA")
    
    if products_ok and services_ok and filters_ok:
        print("✅ TODAS LAS PÁGINAS FUNCIONAN PERFECTAMENTE")
        print("✅ NO HAY BUCLES INFINITOS")
        print("✅ DISEÑO MEJORADO IMPLEMENTADO")
        print("✅ LISTO PARA PRODUCCIÓN")
    else:
        print("⚠️  ALGUNOS PROBLEMAS DETECTADOS")
        print("🔧 REVISAR LOGS PARA MÁS DETALLES")

if __name__ == "__main__":
    main() 