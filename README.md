# GestActas — Gestión Inteligente de Juntas

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Autor:** Loren2026  
**Despliegue:** https://loren2026.github.io/gestactas/

---

## 📋 Índice

1. [Descripción general](#descripción-general)
2. [Características principales](#características-principales)
3. [Arquitectura técnica](#arquitectura-técnica)
4. [Flujo de trabajo](#flujo-de-trabajo)
5. [Funcionalidades](#funcionalidades)
6. [Integraciones con IA](#integraciones-con-ia)
7. [Base de datos local](#base-de-datos-local)
8. [Configuración de API Keys](#configuración-de-api-keys)
9. [Despliegue](#despliegue)
10. [Roadmap futuro](#roadmap-futuro)

---

## 🎯 Descripción general

**GestActas** es una aplicación PWA (Progressive Web App) para la gestión inteligente de juntas de propietarios de comunidades de vecinos. Diseñada para uso móvil, permite grabar, transcribir y generar actas automáticamente utilizando inteligencia artificial.

### Características clave:
- ✅ **100% PWA** - Funciona offline sin servidor backend
- ✅ **IA integrada** - Whisper (transcripción) + Claude (actas)
- ✅ **Datos locales** - IndexedDB para privacidad total
- ✅ **Mobile-first** - Optimizada para uso en móvil
- ✅ **Automatización** - Detección automática de temas y marcadores

---

## ⚡ Características principales

### 📊 Dashboard
- Estadísticas en tiempo real (comunidades, juntas, actas, pendientes)
- Vista de próximas juntas
- Actividad reciente
- Navegación rápida a todas las secciones

### 🏢 Gestión de comunidades
- **Crear comunidad:**
  - Nombre y dirección completa
  - CIF y administrador
  - Lista de propietarios con cuotas y cargos
  - Subir plantilla de acta personalizada (.docx)
  - Vista previa de plantilla con campos IA marcados

- **Vista detallada:**
  - Información completa de la comunidad
  - Tabla de propietarios con cuotas y cargos
  - Historial de juntas

### 📋 Gestión de juntas
- **Crear junta:**
  - Selección de comunidad
  - Tipo (ordinaria/extraordinaria)
  - Fecha y hora con doble convocatoria automática (+30 min)
  - Lugar y orden del día
  - Preselección de asistentes

- **Detalle de junta:**
  - Información completa
  - Orden del día numerado
  - Lista de asistentes con cuotas
  - Control de quórum

### 🎙️ Grabación
- **Grabadora con waveform visual**
- **Detección automática de temas por IA:**
  - Apertura de sesión
  - Cada punto del orden del día
  - Votaciones
  - Cierre de sesión
- **Marcadores manuales:** 🔖 para puntos clave
- **Control de tiempo** en tiempo real

### 📝 Transcripción
- **Dos métodos disponibles:**
  1. **Whisper (nube):**
     - Precisión: 95%
     - Coste: ~0,36 €/hora
     - API: OpenAI Whisper
     - Idioma: Detectado automáticamente

  2. **Local (gratis):**
     - Precisión: 60-70%
     - Coste: 0,00 €
     - API: Web Speech API
     - Idioma: Español preconfigurado

- **Características:**
  - Progreso en tiempo real
  - Timestamps automáticos
  - Edición manual del texto
  - Marcadores vinculados a audio

### 🤖 Generación de actas
- **Integración con Claude:**
  - Analiza transcripción
  - Incorpora datos de la comunidad
  - Incluye asistentes y quórum
  - Genera formato legal estándar
  - Coste estimado: ~0,03 € por acta

- **Vista previa:**
  - Formato documento
  - Revisión previa a exportación
  - Edición manual si es necesario

### 📚 Histórico
- **Buscador completo:**
  - Por comunidad
  - Por fecha
  - Por tipo de junta
  - Por contenido de acta

- **Filtros:**
  - Todas
  - Con acta
  - Pendientes

### ⚙️ Configuración
- **API Keys:**
  - OpenAI (Whisper)
  - Anthropic (Claude)

- **Transcripción:**
  - Método por defecto
  - Idioma

- **Datos:**
  - Exportar backup (JSON)
  - Importar backup
  - Borrar todos los datos

---

## 🏗️ Arquitectura técnica

### Stack tecnológico:
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript
- **Almacenamiento:** IndexedDB (datos locales)
- **Transcripción:**
  - OpenAI Whisper API (nube, 95% precisión)
  - Web Speech API (local, gratis, 60-70%)
- **Generación actas:** Anthropic Claude API
- **Exportación:** .docx (librería docx.js)
- **PWA:** Service Worker + Manifest

### Estructura de archivos:
```
gestactas/
├── index.html          # App principal
├── manifest.json       # Configuración PWA
├── service-worker.js   # Cache offline
├── README.md           # Documentación
└── vercel.json         # Configuración despliegue
```

### Flujo de datos:
```
Usuario → App PWA → IndexedDB → (opcional) APIs IA → Generación acta → Exportación
```

---

## 🔄 Flujo de trabajo

### 1. Configuración inicial
1. Añadir comunidad (datos, propietarios, cargos)
2. Subir plantilla de acta (.docx)
3. Configurar API keys (opcional para funciones IA)

### 2. Preparar junta
1. Crear nueva junta
2. Seleccionar comunidad y tipo (ordinaria/extraordinaria)
3. Configurar fecha y hora (doble convocatoria automática)
4. Definir orden del día
5. Marcar asistentes previstos

### 3. Durante la junta
1. Iniciar grabación de audio
2. **IA detecta temas automáticamente** (puntos del orden del día)
3. Añadir marcadores manuales si es necesario
4. Control de tiempo y asistencia

### 4. Procesar acta
1. Finalizar grabación
2. Elegir método de transcripción:
   - **Whisper (nube):** 95% precisión, ~0,36 €/hora
   - **Local (gratis):** 60-70% precisión, 0,00 €
3. Revisar transcripción
4. Generar acta con Claude
5. Revisar y editar acta generada

### 5. Finalizar
1. Exportar acta a .docx
2. Guardar en histórico
3. Archivar audio y transcripción

---

## 🎨 Funcionalidades detalladas

### Dashboard
- Estadísticas en tiempo real (comunidades, juntas, actas, pendientes)
- Vista de próximas juntas con badges
- Actividad reciente
- Swipe para navegar entre secciones

### Comunidades
- CRUD completo de comunidades
- Gestión de propietarios con cuotas y cargos
- Subida de plantilla de acta con vista previa IA
- Búsqueda de comunidades

### Juntas
- Creación con doble convocatoria automática
- Gestión de asistentes con control de quórum
- Orden del día numerado
- Estados: preparada, en curso, finalizada

### Grabación
- Waveform visual en tiempo real
- Detección automática de temas por IA
- Marcadores automáticos (AUTO) y manuales (MANUAL)
- Detección de votaciones
- Control de tiempo con formato HH:MM:SS

### Transcripción
- Progreso visual con barra de carga
- Timestamps automáticos [HH:MM:SS]
- Edición manual del texto
- Marcadores vinculados a timestamps

### Generación de actas
- Integración con Claude
- Vista previa en formato documento
- Edición manual antes de exportar
- Exportación a .docx

### Histórico
- Búsqueda full-text
- Filtros por estado
- Vista de duración de grabaciones
- Acceso rápido a actas

---

## 🤖 Integraciones con IA

### Whisper (OpenAI)
**Uso:** Transcripción de audio a texto

**Configuración:**
```javascript
const OPENAI_API_KEY = 'sk-...';
```

**Endpoint:**
```
POST https://api.openai.com/v1/audio/transcriptions
```

**Parámetros:**
- `model`: whisper-1
- `language`: es (español)
- `response_format`: verbose_json (incluye timestamps)

**Coste:**
- $0.006 por minuto
- ~0,36 € por hora de grabación

**Precisión:** 95% en español

---

### Claude (Anthropic)
**Uso:** Generación de actas legales

**Configuración:**
```javascript
const ANTHROPIC_API_KEY = 'sk-ant-...';
```

**Endpoint:**
```
POST https://api.anthropic.com/v1/messages
```

**Modelo:**
- `claude-3-sonnet-20240229` (equilibrio calidad/coste)
- `claude-3-haiku-20240307` (más rápido, más económico)

**Prompt de ejemplo:**
```
Genera un acta legal de junta de propietarios usando:

TRANSCRIPCIÓN:
[texto de la transcripción]

DATOS COMUNIDAD:
- Nombre: Edificio Astur
- Fecha: 25/04/2026
- Hora: 18:30h
- Asistentes: [lista con cuotas]
- Quórum: 36,53%

ORDEN DEL DÍA:
1. Aprobación cuentas 2025
2. Renovación de cargos
3. Ruegos y preguntas

Formato: Estándar legal español
```

**Coste:**
- ~0,03 € por acta generada

---

## 💾 Base de datos local

### Estructura IndexedDB

**Base de datos:** `gestactas_db`
**Versión:** 1

#### Stores:

1. **comunidades**
   ```javascript
   {
     id: UUID,
     nombre: string,
     direccion: {
       tipo_via: string,
       nombre_via: string,
       numero: string,
       codigo_postal: string,
       localidad: string,
       municipio: string,
       provincia: string
     },
     cif: string,
     administrador: string,
     propietarios: [{
       nombre: string,
       piso: string,
       cuota: number,
       cargo: string // Presidente, Secretario, Propietario
     }],
     cargos: {
       presidente: string,
       secretario: string
     },
     plantilla_acta: string // base64 del .docx
   }
   ```

2. **juntas**
   ```javascript
   {
     id: UUID,
     comunidad_id: UUID,
     tipo: string, // 'ordinaria' | 'extraordinaria'
     fecha: Date,
     hora_primera: string, // HH:MM
     hora_segunda: string, // HH:MM
     lugar: string,
     orden_dia: string[],
     asistentes: [{
       propietario_id: UUID,
       presente: boolean
     }],
     estado: string // 'preparada' | 'en_curso' | 'finalizada'
   }
   ```

3. **grabaciones**
   ```javascript
   {
     id: UUID,
     junta_id: UUID,
     archivo_audio: Blob,
     duracion: number, // segundos
     fecha: Date
   }
   ```

4. **transcripciones**
   ```javascript
   {
     id: UUID,
     junta_id: UUID,
     texto: string,
     metodo: string, // 'whisper' | 'local'
     idioma: string,
     fecha: Date,
     marcas: [{
       tiempo: number,
       texto: string,
       tipo: string // 'auto' | 'manual'
     }]
   }
   ```

5. **actas**
   ```javascript
   {
     id: UUID,
     junta_id: UUID,
     contenido: string, // texto del acta
     archivo_docx: Blob,
     generada_por: string, // 'claude' | 'manual'
     fecha_generacion: Date,
     exportada: boolean
   }
   ```

---

## 🔑 Configuración de API Keys

### OpenAI (Whisper)

**Obtener API Key:**
1. Ir a https://platform.openai.com/api-keys
2. Crear nueva clave
3. Copiar y guardar

**Configuración en app:**
```
Configuración → Claves API → OpenAI (Whisper)
→ Pegar clave: sk-...
```

**Uso:** Transcripción de audio
**Coste:** $0.006/minuto (~0,36 €/hora)

---

### Anthropic (Claude)

**Obtener API Key:**
1. Ir a https://console.anthropic.com/settings/keys
2. Crear nueva clave
3. Copiar y guardar

**Configuración en app:**
```
Configuración → Claves API → Anthropic (Claude)
→ Pegar clave: sk-ant-...
```

**Uso:** Generación de actas
**Coste:** ~0,03 € por acta

---

## 🚀 Despliegue

### GitHub Pages (gratis)

**Repositorio:** `Loren2026/gestactas`

**Pasos:**
1. Asegurar que `index.html` está en la raíz
2. Subir cambios a GitHub
3. Habilitar GitHub Pages en Settings → Pages
4. Fuente: main branch
5. URL: `https://loren2026.github.io/gestactas/`

### Vercel (recomendado)

**URL:** `https://gestactas.vercel.app`

**Configuración:**
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ]
}
```

---

## 🗺️ Roadmap futuro

### Versión 1.1 (Corto plazo)
- [ ] Exportación a PDF además de .docx
- [ ] Envío de actas por email directo
- [ ] Sincronización automática con Google Drive
- [ ] Modo oscuro/claro

### Versión 1.2 (Medio plazo)
- [ ] Integración con calendario (Google, Apple)
- [ ] Notificaciones push de próximas juntas
- [ ] Firma digital de actas
- [ ] Estadísticas avanzadas por comunidad

### Versión 2.0 (Largo plazo)
- [ ] App nativa (iOS/Android)
- [ ] Múltiples usuarios por comunidad
- [ ] Votación digital
- [ ] Chat interno entre propietarios

---

## 📞 Soporte

**Desarrollador:** Loren2026  
**Email:** lorenzosantiagoiglesias@gmail.com  
**Repositorio:** https://github.com/Loren2026/gestactas

---

## 📄 Licencia

**Uso personal** - Loren2026

---

## 🎨 Guía de estilos

### Colores principales:
- `--bg-deep`: #0a0e1a
- `--bg-primary`: #0f172a
- `--accent`: #3b82f6
- `--success`: #10b981
- `--warning`: #f59e0b
- `--danger`: #ef4444

### Tipografía:
- **Principal:** DM Sans (Google Fonts)
- **Monoespaciada:** JetBrains Mono

### Componentes clave:
- Cards con hover y active states
- Botones con iconos
- Formularios con validación
- Animaciones suaves (0.2s transitions)

---

## 🚀 Quick Start

1. **Clonar repositorio:**
   ```bash
   git clone https://github.com/Loren2026/gestactas.git
   ```

2. **Abrir en navegador:**
   - Local: abrir `index.html`
   - Producción: `https://loren2026.github.io/gestactas/`

3. **Configurar API keys:**
   - Configuración → Claves API
   - Añadir OpenAI (opcional)
   - Añadir Anthropic (opcional)

4. **Crear primera comunidad:**
   - Comunidades → + Nueva
   - Rellenar datos
   - Subir plantilla de acta

5. **Crear primera junta:**
   - Juntas → + Nueva
   - Seleccionar comunidad
   - Configurar fecha y hora
   - ¡Listo para grabar!

---

**Última actualización:** Abril 2026  
**Versión:** 1.0
