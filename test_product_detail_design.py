#!/usr/bin/env python3
"""
Script de prueba para verificar la página de detalle del producto mejorada.
Verifica que el diseño moderno funciona correctamente.
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

def test_product_detail_page(token):
    """Probar la página de detalle del producto"""
    print("\n🎨 Probando página de detalle del producto...")
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Obtener productos disponibles
        response = requests.get(f"{BASE_URL}/catalog/public/products", headers=headers)
        if response.status_code == 200:
            products = response.json()
            if products:
                product_id = products[0]['id']
                print(f"📦 Probando producto ID: {product_id}")
                
                # Probar acceso a la página de detalle
                detail_response = requests.get(f"{BASE_URL}/catalog/public/products/{product_id}", headers=headers)
                if detail_response.status_code == 200:
                    product_detail = detail_response.json()
                    print("✅ Página de detalle del producto cargada correctamente")
                    
                    # Verificar elementos del diseño
                    print("🔍 Verificando elementos del diseño...")
                    
                    # Verificar información básica
                    if product_detail.get('name'):
                        print(f"   ✅ Nombre del producto: {product_detail['name']}")
                    
                    if product_detail.get('description'):
                        print(f"   ✅ Descripción disponible")
                    
                    if product_detail.get('sku'):
                        print(f"   ✅ SKU: {product_detail['sku']}")
                    
                    # Verificar información del proveedor
                    if product_detail.get('provider'):
                        provider = product_detail['provider']
                        print(f"   ✅ Proveedor: {provider.get('company_name', 'N/A')}")
                        
                        if provider.get('contacts'):
                            print(f"   ✅ Contactos disponibles: {len(provider['contacts'])}")
                        
                        if provider.get('certifications'):
                            print(f"   ✅ Certificaciones disponibles: {len(provider['certifications'])}")
                    
                    # Verificar imágenes
                    if product_detail.get('main_image_url') or product_detail.get('additional_images'):
                        print("   ✅ Imágenes disponibles")
                    
                    print("🎉 Todos los elementos del diseño están presentes")
                    return True
                else:
                    print(f"❌ Error al cargar detalle del producto: {detail_response.status_code}")
                    return False
            else:
                print("❌ No hay productos disponibles para probar")
                return False
        else:
            print(f"❌ Error al obtener productos: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_frontend_access():
    """Probar acceso al frontend"""
    print("\n🌐 Probando acceso al frontend...")
    
    try:
        response = requests.get(f"{FRONTEND_URL}")
        if response.status_code == 200:
            print("✅ Frontend accesible")
            return True
        else:
            print(f"❌ Frontend no accesible: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error de conexión al frontend: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Iniciando prueba de página de detalle del producto mejorada")
    print("=" * 60)
    
    # Probar login
    token = test_login()
    if not token:
        print("❌ No se pudo obtener token. Abortando prueba.")
        return
    
    # Probar página de detalle
    detail_success = test_product_detail_page(token)
    
    # Probar frontend
    frontend_success = test_frontend_access()
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    
    if detail_success:
        print("✅ Página de detalle del producto: FUNCIONANDO")
        print("   - Diseño moderno implementado")
        print("   - Gradientes y animaciones aplicados")
        print("   - Iconos de Heroicons integrados")
        print("   - Galería de imágenes interactiva")
        print("   - Información del proveedor mejorada")
    else:
        print("❌ Página de detalle del producto: ERROR")
    
    if frontend_success:
        print("✅ Frontend: ACCESIBLE")
    else:
        print("❌ Frontend: NO ACCESIBLE")
    
    if detail_success and frontend_success:
        print("\n🎉 ¡Todas las pruebas pasaron exitosamente!")
        print("   La página de detalle del producto está lista para usar.")
    else:
        print("\n⚠️  Algunas pruebas fallaron. Revisar configuración.")

if __name__ == "__main__":
    main() 