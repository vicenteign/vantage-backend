#!/bin/sh

echo "🚀 Iniciando configuración del backend..."

# Configurar variables de entorno
export FLASK_APP=run_backend.py
export FLASK_ENV=production
export PYTHONPATH=/app

echo "📊 Ejecutando migraciones de base de datos..."
python -m flask db upgrade

echo "🗄️ Poblando base de datos con datos de prueba..."
python populate_database.py

echo "🌐 Iniciando servidor Flask..."
python run_backend.py 