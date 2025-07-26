# Datos de Prueba - Vantage.ai

## 📊 Resumen de Datos Creados

La base de datos ha sido poblada con datos de prueba realistas para el sector industrial chileno:

### 📋 Planes de Suscripción (3)
- **Inicio**: 10 productos, 5 servicios
- **Intermedio**: 50 productos, 25 servicios  
- **Avanzado**: 200 productos, 100 servicios

### 📂 Categorías (15)
- **Productos**: Bombas y Tuberías, Equipos de Perforación, Seguridad Industrial, etc.
- **Servicios**: Mantenimiento Industrial, Consultoría Geológica, Transporte y Logística, etc.
- **Subcategorías**: Bombas Centrífugas, Protección Respiratoria

### 🏢 Empresas Cliente (7)
Empresas de diferentes industrias:
- **Minería**: Minera Andina del Norte S.A., Cobre de Atacama S.A.
- **Oil & Gas**: Gasoducto Pacífico Austral
- **Termoeléctricas**: Termoeléctrica del Norte Grande, ENERGÍA S.A.
- **Construcción**: Constructora Altiplano Ltda.
- **Forestal**: Celulosa del Maule S.A.

### 🏭 Proveedores (9)
Empresas especializadas en diferentes áreas:
- **Soluciones Hidráulicas del Pacífico**: Sistemas de bombeo
- **Seguridad Total Ltda.**: Equipos de protección personal
- **Servicios Industriales RM**: Mantenimiento predictivo
- **Drilltech Ingeniería**: Perforación diamantina
- **TECMAQ Maquinarias**: Maquinaria pesada
- **Logística Andina Express**: Transporte especializado
- **Metrología y Control**: Instrumentos de medición
- **Ambiental Solutions Chile**: Consultoría ambiental
- **NDT Experts**: Ensayos no destructivos

### 📦 Productos (20)
Productos realistas con especificaciones técnicas detalladas:
- Bombas centrífugas multietapa
- Tuberías HDPE
- Equipos de seguridad industrial
- Brocas de diamante
- Maquinaria pesada
- Instrumentos de medición
- Drones para topografía

### 🔧 Servicios (14)
Servicios especializados con modalidades de contratación:
- Mantenimiento predictivo
- Alineamiento láser
- Transporte de carga sobredimensionada
- Capacitación y certificación
- Ensayos no destructivos
- Estudios de impacto ambiental

## 🔑 Credenciales de Acceso

**Todos los usuarios tienen la contraseña**: `password123`

### 👥 Usuarios Destacados para Pruebas

#### Proveedores
- **Ana Contreras** (Soluciones Hidráulicas del Pacífico)
  - Email: `ana.contreras@solhidraulicas.cl`
  - Plan: Intermedio (50 productos, 25 servicios)

- **Roberto Fuentes** (Seguridad Total Ltda.)
  - Email: `roberto.fuentes@seguridadtotal.cl`
  - Plan: Inicio (10 productos, 5 servicios)

- **Fernanda Soto** (Servicios Industriales RM)
  - Email: `fernanda.soto@serviciosrm.cl`
  - Plan: Avanzado (200 productos, 100 servicios)

#### Clientes
- **Carlos Herrera** (Minera Andina del Norte S.A.)
  - Email: `carlos.herrera@andinanorte.cl`
  - Industria: Minería

- **Isidora Jimenez** (Cobre de Atacama S.A.)
  - Email: `isidora.jimenez@cobre-atacama.cl`
  - Industria: Minería

- **Matias Rojas** (Gasoducto Pacífico Austral)
  - Email: `matias.rojas@gasopacifico.com`
  - Industria: Oil & Gas

## 🚀 Cómo Usar los Datos

### 1. Iniciar el Backend
```bash
python3 run_backend.py
```

### 2. Iniciar el Frontend
```bash
cd vantageai-frontend
npm run dev
```

### 3. Probar los Listados

#### Como Proveedor:
1. Inicia sesión con cualquier cuenta de proveedor
2. Ve a "Productos" para ver los productos creados
3. Ve a "Servicios" para ver los servicios creados
4. Ve a "Perfil" para ver la información de la empresa

#### Como Cliente:
1. Inicia sesión con cualquier cuenta de cliente
2. Explora el catálogo público de productos y servicios
3. Ve a "Perfil" para ver la información de la empresa

### 4. Probar Funcionalidades
- **Filtros**: Usa las categorías para filtrar productos/servicios
- **Búsqueda**: Busca por nombre, SKU o descripción
- **Estados**: Ver productos en diferentes estados (activo, inactivo, borrador)
- **Categorías**: Explora la jerarquía de categorías (padre/hijo)

## 📝 Notas Importantes

- Los datos incluyen productos y servicios en diferentes estados para probar filtros
- Las categorías tienen una estructura jerárquica (categorías padre e hijas)
- Los proveedores tienen diferentes planes para probar límites
- Todos los datos son realistas y representativos del sector industrial chileno
- Los SKUs siguen un patrón lógico por empresa

## 🔄 Repoblar la Base de Datos

Si necesitas repoblar la base de datos con datos frescos:

```bash
python3 populate_database.py
```

El script es idempotente, por lo que puedes ejecutarlo múltiples veces sin duplicar datos. 