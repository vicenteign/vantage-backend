#!/usr/bin/env python3
"""
Test script for the featured products and services endpoint
"""

import requests
import json

def test_featured_endpoint():
    """Test the featured products and services endpoint"""
    
    # Test the featured endpoint
    url = "http://localhost:5002/catalog/public/featured"
    
    try:
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ Featured endpoint is working correctly!")
            print(f"📦 Featured Products: {len(data.get('featured_products', []))}")
            print(f"🔧 Featured Services: {len(data.get('featured_services', []))}")
            
            # Print featured products
            if data.get('featured_products'):
                print("\n📦 Featured Products:")
                for product in data['featured_products']:
                    print(f"  - {product['name']} (SKU: {product['sku']})")
                    print(f"    Provider: {product['provider']['company_name'] if product['provider'] else 'N/A'}")
                    print(f"    Category: {product['category']['name'] if product['category'] else 'N/A'}")
                    print()
            
            # Print featured services
            if data.get('featured_services'):
                print("🔧 Featured Services:")
                for service in data['featured_services']:
                    print(f"  - {service['name']}")
                    print(f"    Provider: {service['provider']['company_name'] if service['provider'] else 'N/A'}")
                    print(f"    Category: {service['category']['name'] if service['category'] else 'N/A'}")
                    print(f"    Modality: {service['modality']}")
                    print()
            
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to the backend server")
        print("Make sure the backend is running on http://localhost:5002")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_public_products_endpoint():
    """Test the public products endpoint"""
    
    url = "http://localhost:5002/catalog/public/products"
    
    try:
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Public products endpoint: {len(data.get('products', []))} products")
            return True
        else:
            print(f"❌ Public products endpoint error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Public products endpoint error: {e}")
        return False

def test_public_services_endpoint():
    """Test the public services endpoint"""
    
    url = "http://localhost:5002/catalog/public/services"
    
    try:
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Public services endpoint: {len(data.get('services', []))} services")
            return True
        else:
            print(f"❌ Public services endpoint error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Public services endpoint error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Featured Products and Services Endpoints")
    print("=" * 50)
    
    # Test all endpoints
    featured_ok = test_featured_endpoint()
    products_ok = test_public_products_endpoint()
    services_ok = test_public_services_endpoint()
    
    print("\n" + "=" * 50)
    if featured_ok and products_ok and services_ok:
        print("🎉 All endpoints are working correctly!")
        print("\n📋 Next steps:")
        print("1. Open http://localhost:3001 in your browser")
        print("2. Login as a client user")
        print("3. Check the dashboard for featured products and services")
    else:
        print("❌ Some endpoints are not working correctly")
        print("Please check the backend server and database") 