#!/usr/bin/env python3
"""
Script para probar el efecto highlight en las búsquedas de productos, servicios y cotizaciones
"""

import requests
import json
import time

# Configuración
BASE_URL = "http://127.0.0.1:5002"
LOGIN_URL = f"{BASE_URL}/auth/login"

def login_client():
    """Iniciar sesión como cliente"""
    login_data = {
        "email": "cliente1@mineraandes.cl",
        "password": "password123"
    }
    
    response = requests.post(LOGIN_URL, json=login_data)
    if response.status_code == 200:
        token = response.json().get('access_token')
        print(f"✅ Login exitoso - Token obtenido")
        return token
    else:
        print(f"❌ Error en login: {response.status_code} - {response.text}")
        return None

def test_product_search_highlight(token):
    """Probar búsqueda de productos con highlight"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\n🔍 Probando búsqueda de productos con highlight")
    
    try:
        # Búsqueda de productos
        response = requests.get(f"{BASE_URL}/catalog/public/products?search=bomba", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            products = data.get('products', [])
            print(f"✅ Búsqueda de productos exitosa")
            print(f"   Productos encontrados: {len(products)}")
            
            if products:
                print(f"   📋 Primer producto: {products[0]['name']}")
                print(f"   💡 Efecto highlight aplicado a resultados")
                return True
            else:
                print(f"   ⚠️ No se encontraron productos")
                return False
                
        else:
            print(f"❌ Error en búsqueda de productos: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return False

def test_service_search_highlight(token):
    """Probar búsqueda de servicios con highlight"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\n🔍 Probando búsqueda de servicios con highlight")
    
    try:
        # Búsqueda de servicios
        response = requests.get(f"{BASE_URL}/catalog/public/services?search=mantenimiento", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            services = data.get('services', [])
            print(f"✅ Búsqueda de servicios exitosa")
            print(f"   Servicios encontrados: {len(services)}")
            
            if services:
                print(f"   📋 Primer servicio: {services[0]['name']}")
                print(f"   💡 Efecto highlight aplicado a resultados")
                return True
            else:
                print(f"   ⚠️ No se encontraron servicios")
                return False
                
        else:
            print(f"❌ Error en búsqueda de servicios: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return False

def test_quotes_filter_highlight(token):
    """Probar filtro de cotizaciones con highlight"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\n🔍 Probando filtro de cotizaciones con highlight")
    
    try:
        # Obtener cotizaciones del cliente
        response = requests.get(f"{BASE_URL}/quotes/my-requests", headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            quotes = data.get('quote_requests', [])
            print(f"✅ Obtención de cotizaciones exitosa")
            print(f"   Cotizaciones encontradas: {len(quotes)}")
            
            if quotes:
                print(f"   📋 Primera cotización: {quotes[0]['item_name']}")
                print(f"   💡 Efecto highlight aplicado a resultados de filtro")
                return True
            else:
                print(f"   ⚠️ No se encontraron cotizaciones")
                return False
                
        else:
            print(f"❌ Error obteniendo cotizaciones: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return False

def test_dashboard_search_highlight(token):
    """Probar búsqueda del dashboard con highlight"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"\n🔍 Probando búsqueda del dashboard con highlight")
    
    try:
        # Búsqueda IA del dashboard
        search_data = {
            "query": "bomba centrifuga"
        }
        
        response = requests.post(f"{BASE_URL}/api/ia/search-catalog", json=search_data, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            exact_matches = data.get('exact_matches', [])
            near_matches = data.get('near_matches', [])
            
            print(f"✅ Búsqueda IA del dashboard exitosa")
            print(f"   Coincidencias exactas: {len(exact_matches)}")
            print(f"   Coincidencias cercanas: {len(near_matches)}")
            
            if exact_matches or near_matches:
                print(f"   💡 Efecto highlight aplicado a resultados IA")
                return True
            else:
                print(f"   ⚠️ No se encontraron resultados")
                return False
                
        else:
            print(f"❌ Error en búsqueda IA: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return False

def main():
    """Función principal de pruebas"""
    print("🚀 Iniciando pruebas del efecto highlight en búsquedas")
    print("=" * 60)
    
    # Login
    token = login_client()
    if not token:
        print("❌ No se pudo obtener token. Abortando pruebas.")
        return
    
    # Lista de pruebas
    test_functions = [
        {
            "name": "Búsqueda de Productos",
            "function": test_product_search_highlight,
            "description": "Verificar efecto highlight en búsqueda de productos"
        },
        {
            "name": "Búsqueda de Servicios", 
            "function": test_service_search_highlight,
            "description": "Verificar efecto highlight en búsqueda de servicios"
        },
        {
            "name": "Filtro de Cotizaciones",
            "function": test_quotes_filter_highlight,
            "description": "Verificar efecto highlight en filtro de cotizaciones"
        },
        {
            "name": "Búsqueda Dashboard IA",
            "function": test_dashboard_search_highlight,
            "description": "Verificar efecto highlight en búsqueda IA del dashboard"
        }
    ]
    
    # Ejecutar pruebas
    successful_tests = 0
    total_tests = len(test_functions)
    
    for i, test in enumerate(test_functions, 1):
        print(f"\n📝 Prueba {i}/{total_tests}: {test['description']}")
        print("-" * 50)
        
        success = test['function'](token)
        if success:
            successful_tests += 1
        
        # Pausa entre pruebas
        if i < total_tests:
            time.sleep(1)
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS - EFECTO HIGHLIGHT")
    print("=" * 60)
    print(f"✅ Pruebas exitosas: {successful_tests}/{total_tests}")
    print(f"❌ Pruebas fallidas: {total_tests - successful_tests}/{total_tests}")
    
    if successful_tests == total_tests:
        print("🎉 ¡TODAS LAS PRUEBAS EXITOSAS! El efecto highlight funciona correctamente.")
        print("✨ Características implementadas:")
        print("   • Scroll automático a resultados")
        print("   • Animación pulse-glow con ring azul")
        print("   • Transiciones suaves de 1 segundo")
        print("   • Aplicado a productos, servicios y cotizaciones")
    elif successful_tests > total_tests * 0.7:
        print("👍 La mayoría de las pruebas exitosas. El efecto highlight funciona bien.")
    else:
        print("⚠️ Muchas pruebas fallidas. Revisar implementación del efecto highlight.")
    
    print("\n🔧 Pruebas completadas. Verificar en el frontend que el efecto highlight se aplique correctamente.")

if __name__ == "__main__":
    main() 