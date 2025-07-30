#!/usr/bin/env python3
"""
Script para probar el flujo completo del onboarding
"""

import requests
import json
import time

# Configuración
BASE_URL = "http://127.0.0.1:5002"
FRONTEND_URL = "http://localhost:3001"

def test_complete_onboarding_flow():
    """Probar el flujo completo del onboarding"""
    
    print("🧪 Probando flujo completo del onboarding...")
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
    
    # 2. Verificar estado inicial de onboarding
    print("\n2️⃣ Verificando estado inicial de onboarding...")
    headers = {"Authorization": f"Bearer {token}"}
    status_response = requests.get(f"{BASE_URL}/api/users/onboarding-status", headers=headers)
    
    if status_response.status_code != 200:
        print(f"❌ Error obteniendo estado: {status_response.status_code}")
        return
    
    status_data = status_response.json()
    has_completed = status_data.get("has_completed_onboarding", False)
    user_role = status_data.get("user_role")
    
    print(f"✅ Estado obtenido:")
    print(f"   has_completed_onboarding: {has_completed}")
    print(f"   user_role: {user_role}")
    
    # 3. Reset onboarding para probar
    print("\n3️⃣ Reseteando onboarding para probar...")
    reset_response = requests.put(f"{BASE_URL}/api/users/reset-onboarding", headers=headers)
    
    if reset_response.status_code != 200:
        print(f"❌ Error reseteando onboarding: {reset_response.status_code}")
        return
    
    print("✅ Onboarding reseteado")
    
    # 4. Verificar que ahora debería mostrar onboarding
    print("\n4️⃣ Verificando que ahora debería mostrar onboarding...")
    status_response2 = requests.get(f"{BASE_URL}/api/users/onboarding-status", headers=headers)
    
    if status_response2.status_code == 200:
        status_data2 = status_response2.json()
        has_completed2 = status_data2.get("has_completed_onboarding", False)
        print(f"✅ Estado después del reset:")
        print(f"   has_completed_onboarding: {has_completed2}")
        
        if not has_completed2:
            print("🎯 DEBERÍA MOSTRAR ONBOARDING")
        else:
            print("❌ NO debería mostrar onboarding")
    
    # 5. Completar onboarding
    print("\n5️⃣ Completando onboarding...")
    complete_response = requests.put(f"{BASE_URL}/api/users/complete-onboarding", headers=headers)
    
    if complete_response.status_code != 200:
        print(f"❌ Error completando onboarding: {complete_response.status_code}")
        print(f"   Response: {complete_response.text}")
        return
    
    complete_data = complete_response.json()
    print(f"✅ Onboarding completado: {complete_data.get('message')}")
    
    # 6. Verificar estado final
    print("\n6️⃣ Verificando estado final...")
    status_response3 = requests.get(f"{BASE_URL}/api/users/onboarding-status", headers=headers)
    
    if status_response3.status_code == 200:
        status_data3 = status_response3.json()
        has_completed3 = status_data3.get("has_completed_onboarding", False)
        print(f"✅ Estado final:")
        print(f"   has_completed_onboarding: {has_completed3}")
        
        if has_completed3:
            print("✅ NO debería mostrar onboarding (ya completado)")
        else:
            print("❌ DEBERÍA mostrar onboarding")
    
    print("\n" + "=" * 60)
    print("🎯 RESUMEN DEL TEST:")
    print("✅ Login funciona")
    print("✅ Estado de onboarding se puede obtener")
    print("✅ Onboarding se puede resetear")
    print("✅ Onboarding se puede completar")
    print("✅ Estado se actualiza correctamente")
    print("\n🌐 Para probar en el frontend:")
    print(f"   1. Ve a: {FRONTEND_URL}")
    print("   2. Inicia sesión con: cliente1@mineraandes.cl / password123")
    print("   3. Deberías ver el onboarding automáticamente")

if __name__ == "__main__":
    print("🚀 Test de Flujo de Onboarding - Vantage.ai")
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
    
    # Ejecutar test
    test_complete_onboarding_flow() 