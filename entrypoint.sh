#!/bin/sh

echo "🚀 Iniciando configuración del backend..."

# Configurar variables de entorno
export FLASK_APP=run_backend.py
export FLASK_ENV=production
export PYTHONPATH=/app

echo "📊 Ejecutando migraciones de base de datos..."
python -m flask db upgrade

# Poblar la base de datos solo si SEED_DB_ON_START=true y no ha sido sembrada antes
if [ "${SEED_DB_ON_START:-false}" = "true" ]; then
  if [ ! -f "/app/instance/.seeded" ]; then
    echo "🗄️ Poblando base de datos con datos de prueba (primera vez)..."
    python populate_database.py && touch /app/instance/.seeded
  else
    echo "🗄️ Seed ya aplicado previamente. Saltando poblar base de datos."
  fi
else
  echo "⏩ SEED_DB_ON_START=false (por defecto). No se poblará la base de datos en el arranque."
fi

echo "🌐 Iniciando servidor Flask..."
python run_backend.py 