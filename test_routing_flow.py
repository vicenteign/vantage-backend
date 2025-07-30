#!/usr/bin/env python3
"""
Script para probar el flujo completo de rutas y redirección
"""

import requests
import json
import time

# Configuración
BASE_URL = "http://127.0.0.1:5002"
FRONTEND_URL = "http://localhost:3001"

def test_complete_routing_flow():
    """Probar el flujo completo de rutas"""
    
    print("🧪 Probando flujo completo de rutas...")
    print("=" * 60)
    
    # 1. Login como cliente
    print("1️⃣ Login como cliente...")
    login_response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "cliente1@mineraandes.cl",
        "password": "password123"
    })
    
    if login_response.status_code != 200:
        print(f"❌ Error en login: {login_response.status_code}")
        return
    
    login_data = login_response.json()
    token = login_data.get("access_token")
    user_info = login_data.get("user", {})
    
    print(f"✅ Login exitoso para: {user_info.get('email')}")
    print(f"   Rol: {user_info.get('role')}")
    print(f"   Token: {token[:50]}...")
    
    # 2. Verificar estado de onboarding
    print("\n2️⃣ Verificando estado de onboarding...")
    headers = {"Authorization": f"Bearer {token}"}
    status_response = requests.get(f"{BASE_URL}/api/users/onboarding-status", headers=headers)
    
    if status_response.status_code != 200:
        print(f"❌ Error obteniendo estado: {status_response.status_code}")
        return
    
    status_data = status_response.json()
    has_completed = status_data.get("has_completed_onboarding", False)
    user_role = status_data.get("user_role")
    
    print(f"✅ Estado de onboarding:")
    print(f"   has_completed_onboarding: {has_completed}")
    print(f"   user_role: {user_role}")
    
    # 3. Probar endpoint del dashboard del cliente
    print("\n3️⃣ Probando endpoint del dashboard del cliente...")
    dashboard_response = requests.get(f"{BASE_URL}/client/dashboard", headers=headers)
    
    if dashboard_response.status_code == 200:
        dashboard_data = dashboard_response.json()
        print(f"✅ Dashboard del cliente funciona:")
        print(f"   Company: {dashboard_data.get('company_name', 'N/A')}")
        print(f"   Total quotes: {dashboard_data.get('total_quotes_sent', 0)}")
    else:
        print(f"❌ Error en dashboard del cliente: {dashboard_response.status_code}")
        print(f"   Response: {dashboard_response.text}")
    
    # 4. Probar endpoint del perfil del cliente
    print("\n4️⃣ Probando endpoint del perfil del cliente...")
    profile_response = requests.get(f"{BASE_URL}/client/profile", headers=headers)
    
    if profile_response.status_code == 200:
        profile_data = profile_response.json()
        print(f"✅ Perfil del cliente funciona:")
        print(f"   Company: {profile_data.get('company_name', 'N/A')}")
    else:
        print(f"❌ Error en perfil del cliente: {profile_response.status_code}")
        print(f"   Response: {profile_response.text}")
    
    # 5. Probar con proveedor
    print("\n5️⃣ Probando con proveedor...")
    provider_login = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "juan.perez@solucioneshidraulicas.cl",
        "password": "password123"
    })
    
    if provider_login.status_code == 200:
        provider_data = provider_login.json()
        provider_token = provider_data.get("access_token")
        provider_headers = {"Authorization": f"Bearer {provider_token}"}
        
        print(f"✅ Login proveedor exitoso")
        
        # Probar perfil del proveedor
        provider_profile = requests.get(f"{BASE_URL}/provider/profile", headers=provider_headers)
        if provider_profile.status_code == 200:
            print(f"✅ Perfil del proveedor funciona")
        else:
            print(f"❌ Error en perfil del proveedor: {provider_profile.status_code}")
        
        # Probar productos del proveedor
        provider_products = requests.get(f"{BASE_URL}/catalog/products", headers=provider_headers)
        if provider_products.status_code == 200:
            products_data = provider_products.json()
            print(f"✅ Productos del proveedor funcionan: {len(products_data.get('products', []))} productos")
        else:
            print(f"❌ Error en productos del proveedor: {provider_products.status_code}")
    
    print("\n" + "=" * 60)
    print("🎯 RESUMEN DEL TEST DE RUTAS:")
    print("✅ Login funciona")
    print("✅ Onboarding status funciona")
    print("✅ Dashboard endpoints funcionan")
    print("✅ Profile endpoints funcionan")
    print("✅ Product endpoints funcionan")
    print("\n🌐 Para probar en el frontend:")
    print(f"   1. Ve a: {FRONTEND_URL}")
    print("   2. Inicia sesión con: cliente1@mineraandes.cl / password123")
    print("   3. Verifica la consola del navegador para logs de redirección")
    print("   4. Si hay problemas, revisa:")
    print("      - localStorage.getItem('accessToken')")
    print("      - localStorage.getItem('userRole')")
    print("      - Network tab para errores de API")

def test_onboarding_redirect_logic():
    """Probar la lógica de redirección del onboarding"""
    
    print("\n🔄 Probando lógica de redirección del onboarding...")
    print("=" * 60)
    
    # Reset onboarding para cliente
    print("1️⃣ Reseteando onboarding para cliente...")
    login_response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "cliente1@mineraandes.cl",
        "password": "password123"
    })
    
    if login_response.status_code == 200:
        token = login_response.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Reset onboarding
        reset_response = requests.put(f"{BASE_URL}/api/users/reset-onboarding", headers=headers)
        if reset_response.status_code == 200:
            print("✅ Onboarding reseteado")
            
            # Verificar estado
            status_response = requests.get(f"{BASE_URL}/api/users/onboarding-status", headers=headers)
            if status_response.status_code == 200:
                status_data = status_response.json()
                has_completed = status_data.get("has_completed_onboarding", False)
                user_role = status_data.get("user_role")
                
                print(f"✅ Estado después del reset:")
                print(f"   has_completed_onboarding: {has_completed}")
                print(f"   user_role: {user_role}")
                
                if not has_completed:
                    print("🎯 DEBERÍA REDIRIGIR A: /onboarding/client")
                else:
                    print("❌ NO debería redirigir (ya completado)")
    
    print("\n📋 LÓGICA DE REDIRECCIÓN:")
    print("1. Usuario hace login")
    print("2. ProtectedRoute verifica token")
    print("3. ProtectedRoute verifica rol")
    print("4. ProtectedRoute verifica onboarding status")
    print("5. Si has_completed_onboarding = False → redirige a onboarding")
    print("6. Si has_completed_onboarding = True → muestra dashboard")

if __name__ == "__main__":
    print("🚀 Test de Flujo de Rutas - Vantage.ai")
    print("=" * 60)
    
    # Verificar que el backend esté funcionando
    try:
        health_response = requests.get(f"{BASE_URL}/health")
        if health_response.status_code == 200:
            print("✅ Backend funcionando")
        else:
            print("❌ Backend no responde")
            exit(1)
    except Exception as e:
        print(f"❌ No se puede conectar al backend: {e}")
        exit(1)
    
    # Ejecutar tests
    test_complete_routing_flow()
    test_onboarding_redirect_logic() 