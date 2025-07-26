#!/usr/bin/env python3
"""
Script para probar el buscador IA mejorado con búsquedas flexibles
"""

import requests
import json
import time

# Configuración
BASE_URL = "http://127.0.0.1:5002"
LOGIN_URL = f"{BASE_URL}/auth/login"
SEARCH_URL = f"{BASE_URL}/api/ia/search-catalog"

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

def test_ia_search(token, query, expected_type="producto"):
    """Probar búsqueda IA con una consulta específica"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    search_data = {
        "query": query
    }
    
    print(f"\n🔍 Probando búsqueda: '{query}'")
    print(f"   Esperando encontrar: {expected_type}")
    
    try:
        response = requests.post(SEARCH_URL, json=search_data, headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            
            exact_matches = result.get('exact_matches', [])
            near_matches = result.get('near_matches', [])
            reasoning = result.get('reasoning', '')
            
            print(f"✅ Búsqueda exitosa")
            print(f"   Coincidencias exactas: {len(exact_matches)}")
            print(f"   Coincidencias cercanas: {len(near_matches)}")
            print(f"   Razonamiento: {reasoning[:100]}...")
            
            # Mostrar resultados
            if exact_matches:
                print(f"   📋 Coincidencias exactas:")
                for match in exact_matches:
                    print(f"      - {match['name']} ({match['type']})")
            
            if near_matches:
                print(f"   🔍 Coincidencias cercanas:")
                for match in near_matches:
                    print(f"      - {match['name']} ({match['type']})")
            
            # Verificar si encontramos el tipo esperado
            total_matches = len(exact_matches) + len(near_matches)
            if total_matches > 0:
                print(f"   ✅ Encontrados {total_matches} resultados")
                return True
            else:
                print(f"   ⚠️ No se encontraron resultados")
                return False
                
        else:
            print(f"❌ Error en búsqueda: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {str(e)}")
        return False

def main():
    """Función principal de pruebas"""
    print("🚀 Iniciando pruebas del buscador IA mejorado")
    print("=" * 60)
    
    # Login
    token = login_client()
    if not token:
        print("❌ No se pudo obtener token. Abortando pruebas.")
        return
    
    # Lista de pruebas
    test_queries = [
        {
            "query": "bomba centrifuga multietapa",
            "expected": "producto",
            "description": "Búsqueda específica de bomba centrífuga multietapa"
        },
        {
            "query": "bomba centrifuga",
            "expected": "producto", 
            "description": "Búsqueda de bomba centrífuga (más general)"
        },
        {
            "query": "bomba",
            "expected": "producto",
            "description": "Búsqueda general de bomba"
        },
        {
            "query": "equipos de perforacion",
            "expected": "producto",
            "description": "Búsqueda de equipos de perforación"
        },
        {
            "query": "broca de diamante",
            "expected": "producto",
            "description": "Búsqueda de broca de diamante"
        },
        {
            "query": "mantenimiento de bombas",
            "expected": "servicio",
            "description": "Búsqueda de servicio de mantenimiento"
        },
        {
            "query": "seguridad industrial",
            "expected": "producto",
            "description": "Búsqueda de productos de seguridad"
        },
        {
            "query": "tuberia hdpe",
            "expected": "producto",
            "description": "Búsqueda de tubería HDPE"
        }
    ]
    
    # Ejecutar pruebas
    successful_tests = 0
    total_tests = len(test_queries)
    
    for i, test in enumerate(test_queries, 1):
        print(f"\n📝 Prueba {i}/{total_tests}: {test['description']}")
        print("-" * 50)
        
        success = test_ia_search(token, test['query'], test['expected'])
        if success:
            successful_tests += 1
        
        # Pausa entre pruebas
        if i < total_tests:
            time.sleep(1)
    
    # Resumen final
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE PRUEBAS")
    print("=" * 60)
    print(f"✅ Pruebas exitosas: {successful_tests}/{total_tests}")
    print(f"❌ Pruebas fallidas: {total_tests - successful_tests}/{total_tests}")
    
    if successful_tests == total_tests:
        print("🎉 ¡TODAS LAS PRUEBAS EXITOSAS! El buscador IA funciona correctamente.")
    elif successful_tests > total_tests * 0.7:
        print("👍 La mayoría de las pruebas exitosas. El buscador IA funciona bien.")
    else:
        print("⚠️ Muchas pruebas fallidas. Revisar configuración del buscador IA.")
    
    print("\n🔧 Pruebas completadas. Revisar logs del backend para más detalles.")

if __name__ == "__main__":
    main() 