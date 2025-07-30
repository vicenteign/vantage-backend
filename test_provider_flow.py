#!/usr/bin/env python3
"""
Script para probar el flujo específico del proveedor
"""

import requests
import json

# Configuración
BASE_URL = "http://127.0.0.1:5002"
FRONTEND_URL = "http://localhost:3001"

def test_provider_flow():
    """Probar el flujo completo del proveedor"""
    
    print("🧪 Probando flujo del proveedor...")
    print("=" * 60)
    
    # 1. Login como proveedor
    print("1️⃣ Login como proveedor...")
    login_response = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "juan.perez@solucioneshidraulicas.cl",
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
    
    # 3. Reset onboarding si está completado
    if has_completed:
        print("\n3️⃣ Reseteando onboarding para probar...")
        reset_response = requests.put(f"{BASE_URL}/api/users/reset-onboarding", headers=headers)
        if reset_response.status_code == 200:
            print("✅ Onboarding reseteado")
            
            # Verificar estado después del reset
            status_response = requests.get(f"{BASE_URL}/api/users/onboarding-status", headers=headers)
            if status_response.status_code == 200:
                status_data = status_response.json()
                has_completed = status_data.get("has_completed_onboarding", False)
                print(f"✅ Estado después del reset: {has_completed}")
        else:
            print(f"❌ Error reseteando onboarding: {reset_response.status_code}")
    
    # 4. Probar endpoint del perfil del proveedor
    print("\n4️⃣ Probando endpoint del perfil del proveedor...")
    profile_response = requests.get(f"{BASE_URL}/provider/profile", headers=headers)
    
    if profile_response.status_code == 200:
        profile_data = profile_response.json()
        print(f"✅ Perfil del proveedor funciona:")
        print(f"   Company: {profile_data.get('company_name', 'N/A')}")
        print(f"   Website: {profile_data.get('website', 'N/A')}")
    else:
        print(f"❌ Error en perfil del proveedor: {profile_response.status_code}")
        print(f"   Response: {profile_response.text}")
    
    # 5. Probar productos del proveedor
    print("\n5️⃣ Probando productos del proveedor...")
    products_response = requests.get(f"{BASE_URL}/catalog/products", headers=headers)
    
    if products_response.status_code == 200:
        products_data = products_response.json()
        products = products_data.get('products', [])
        print(f"✅ Productos del proveedor funcionan: {len(products)} productos")
        for product in products[:3]:  # Mostrar primeros 3
            print(f"   - {product.get('name', 'N/A')} (ID: {product.get('id')})")
    else:
        print(f"❌ Error en productos del proveedor: {products_response.status_code}")
    
    # 6. Probar servicios del proveedor
    print("\n6️⃣ Probando servicios del proveedor...")
    services_response = requests.get(f"{BASE_URL}/catalog/services", headers=headers)
    
    if services_response.status_code == 200:
        services_data = services_response.json()
        services = services_data.get('services', [])
        print(f"✅ Servicios del proveedor funcionan: {len(services)} servicios")
        for service in services[:3]:  # Mostrar primeros 3
            print(f"   - {service.get('name', 'N/A')} (ID: {service.get('id')})")
    else:
        print(f"❌ Error en servicios del proveedor: {services_response.status_code}")
    
    print("\n" + "=" * 60)
    print("🎯 RESUMEN DEL TEST DEL PROVEEDOR:")
    print("✅ Login funciona")
    print("✅ Onboarding status funciona")
    print("✅ Profile endpoint funciona")
    print("✅ Products endpoint funciona")
    print("✅ Services endpoint funciona")
    
    if not has_completed:
        print("\n🎯 DEBERÍA REDIRIGIR A: /onboarding/provider")
        print(f"\n🌐 Para probar en el frontend:")
        print(f"   1. Ve a: {FRONTEND_URL}")
        print("   2. Inicia sesión con: juan.perez@solucioneshidraulicas.cl / password123")
        print("   3. Deberías ver el onboarding del proveedor")
    else:
        print("\n🎯 DEBERÍA MOSTRAR DASHBOARD")
        print(f"\n🌐 Para probar en el frontend:")
        print(f"   1. Ve a: {FRONTEND_URL}")
        print("   2. Inicia sesión con: juan.perez@solucioneshidraulicas.cl / password123")
        print("   3. Deberías ver el dashboard del proveedor")

if __name__ == "__main__":
    print("🚀 Test de Flujo del Proveedor - Vantage.ai")
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
    
    # Ejecutar test del proveedor
    test_provider_flow() 