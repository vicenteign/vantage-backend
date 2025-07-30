#!/usr/bin/env python3
"""
Script para verificar y actualizar usuarios para que aparezca el onboarding
"""

import requests
import json

# Configuración
BASE_URL = "http://127.0.0.1:5002"
# Para EC2, cambiar a: BASE_URL = "http://tu-ip-ec2:5002"

def test_login_and_onboarding():
    """Probar login y verificar estado de onboarding"""
    
    print("🔍 Verificando usuarios y onboarding...")
    print("=" * 50)
    
    # Lista de usuarios de prueba
    test_users = [
        # Clientes
        {
            "email": "cliente1@mineraandes.cl",
            "password": "password123",
            "expected_role": "cliente"
        },
        {
            "email": "cliente2@mineraoriente.cl", 
            "password": "password123",
            "expected_role": "cliente"
        },
        # Proveedores
        {
            "email": "juan.perez@solucioneshidraulicas.cl",
            "password": "password123",
            "expected_role": "proveedor"
        },
        {
            "email": "carlos.rodriguez@seguridadtotal.cl",
            "password": "password123", 
            "expected_role": "proveedor"
        }
    ]
    
    for user in test_users:
        print(f"\n👤 Probando usuario: {user['email']}")
        print("-" * 30)
        
        try:
            # 1. Login
            login_response = requests.post(f"{BASE_URL}/auth/login", json={
                "email": user["email"],
                "password": user["password"]
            })
            
            if login_response.status_code == 200:
                login_data = login_response.json()
                token = login_data.get("access_token")
                user_info = login_data.get("user", {})
                
                print(f"✅ Login exitoso")
                print(f"   Rol: {user_info.get('role')}")
                print(f"   Onboarding completado: {user_info.get('has_completed_onboarding', False)}")
                
                # 2. Verificar estado de onboarding
                headers = {"Authorization": f"Bearer {token}"}
                onboarding_response = requests.get(f"{BASE_URL}/api/users/onboarding-status", headers=headers)
                
                if onboarding_response.status_code == 200:
                    onboarding_data = onboarding_response.json()
                    has_completed = onboarding_data.get("has_completed_onboarding", False)
                    user_role = onboarding_data.get("user_role")
                    
                    print(f"✅ Estado de onboarding obtenido")
                    print(f"   has_completed_onboarding: {has_completed}")
                    print(f"   user_role: {user_role}")
                    
                    # 3. Determinar si debería aparecer onboarding
                    should_show_onboarding = not has_completed
                    
                    if should_show_onboarding:
                        print(f"🎯 DEBERÍA MOSTRAR ONBOARDING")
                        if user_role == "cliente":
                            print(f"   → Redirigir a: /onboarding/client")
                        elif user_role == "proveedor":
                            print(f"   → Redirigir a: /onboarding/provider")
                    else:
                        print(f"✅ NO debería mostrar onboarding (ya completado)")
                        if user_role == "cliente":
                            print(f"   → Redirigir a: /client/dashboard")
                        elif user_role == "proveedor":
                            print(f"   → Redirigir a: /provider/dashboard")
                            
                else:
                    print(f"❌ Error obteniendo estado de onboarding: {onboarding_response.status_code}")
                    print(f"   Response: {onboarding_response.text}")
                    
            else:
                print(f"❌ Error en login: {login_response.status_code}")
                print(f"   Response: {login_response.text}")
                
        except Exception as e:
            print(f"❌ Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("📋 RESUMEN DE REQUISITOS PARA ONBOARDING:")
    print("1. Usuario debe existir en la base de datos")
    print("2. role debe ser 'cliente' o 'proveedor'")
    print("3. has_completed_onboarding debe ser False")
    print("4. Usuario debe estar autenticado (token válido)")
    print("5. Frontend debe hacer request a /api/users/onboarding-status")
    print("6. Si has_completed_onboarding = False → mostrar onboarding")
    print("7. Si has_completed_onboarding = True → ir al dashboard")

def reset_onboarding_for_test():
    """Reset onboarding para usuarios de prueba (solo para desarrollo)"""
    
    print("\n🔄 Reseteando onboarding para usuarios de prueba...")
    
    test_users = [
        "cliente1@mineraandes.cl",
        "cliente2@mineraoriente.cl", 
        "juan.perez@solucioneshidraulicas.cl",
        "carlos.rodriguez@seguridadtotal.cl"
    ]
    
    for email in test_users:
        try:
            # Login
            login_response = requests.post(f"{BASE_URL}/auth/login", json={
                "email": email,
                "password": "password123"
            })
            
            if login_response.status_code == 200:
                token = login_response.json().get("access_token")
                
                # Reset onboarding (marcar como no completado)
                headers = {"Authorization": f"Bearer {token}"}
                reset_response = requests.put(f"{BASE_URL}/api/users/reset-onboarding", headers=headers)
                
                if reset_response.status_code == 200:
                    print(f"✅ Reset onboarding para: {email}")
                else:
                    print(f"❌ Error reseteando onboarding para: {email}")
                    
        except Exception as e:
            print(f"❌ Error con {email}: {str(e)}")

if __name__ == "__main__":
    print("🚀 Verificador de Onboarding - Vantage.ai")
    print("=" * 50)
    
    # Verificar estado actual
    test_login_and_onboarding()
    
    # Preguntar si quiere resetear onboarding
    print("\n" + "=" * 50)
    response = input("¿Quieres resetear el onboarding para usuarios de prueba? (y/n): ")
    
    if response.lower() == 'y':
        reset_onboarding_for_test()
        print("\n✅ Onboarding reseteado. Ahora debería aparecer para usuarios de prueba.")
    else:
        print("\n✅ No se reseteó el onboarding.")
    
    print("\n🎯 Para probar:")
    print("1. Ve a http://localhost:3001")
    print("2. Inicia sesión con cualquier usuario de prueba")
    print("3. Deberías ver el onboarding si has_completed_onboarding = False") 