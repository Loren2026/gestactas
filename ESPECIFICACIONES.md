# GestActas — Especificaciones Técnicas del MVP

**Versión:** 1.0 (Borrador)  
**Fecha:** 27 de abril de 2026  
**Autor:** Loren2026  
**Cliente:** Carlos · Agencia Carigan  
**Estado:** Especificaciones técnicas del MVP funcional

---

## 📋 Índice

1. [Visión general](#visión-general)
2. [Arquitectura del MVP](#arquitectura-del-mvp)
3. [Flujo de trabajo completo](#flujo-de-trabajo-completo)
4. [Componentes técnicos](#componentes-técnicos)
5. [APIs integradas](#apis-integradas)
6. [Base de datos](#base-de-datos)
7. [Endpoints y endpoints](#endpoints-y-endpoints)
8. [Proceso de transcripción](#proceso-de-transcripción)
9. [Proceso de generación de actas](#proceso-de-generación-de-actas)
10. [Proceso de exportación](#proceso-de-exportación)
11. [PWA y instalabilidad](#pwa-y-instalabilidad)
12. [Roadmap de desarrollo](#roadmap-de-desarrollo)

---

## 🎯 Visión general

**GestActas** es una aplicación PWA (Progressive Web App) diseñada para gestionar automáticamente el proceso completo de juntas de propietarios de comunidades de vecinos.

**Objetivo:** Automatizar desde la grabación del audio hasta la generación del acta legal con IA, sin servidor propio ni suscripción mensual.

**Cliente:** Carlos, administrador de fincas en Lugones (Siero, Asturias)  
**Alcance:** Gestión de juntas de propietarios con transcripción automática y generación de actas con IA

---

## 🏗️ Arquitectura del MVP

### Stack tecnológico

```
┌─────────────────────────────────────────────────────┐
│              PWA (Progressive Web App)              │
│  ┌──────────────────────────────────────────────┐   │
│  │          Frontend (React PWA)                │   │
│  │  - UI/UX con 14 pantallas                    │   │
│  │  - Gestión de estado local                   │   │
│  │  - Interfaz con usuario                      │   │
│  └──────────────────────────────────────────────┘   │
│                       ↓                              │
│  ┌──────────────────────────────────────────────┐   │
│  │          IndexedDB (Almacenamiento)          │   │
│  │  - Comunidades, propietarios, juntas         │   │
│  │  - Grabaciones, transcripciones, actas       │   │
│  │  - Sin servidor, datos privados              │   │
│  └──────────────────────────────────────────────┘   │
│                       ↓                              │
│  ┌──────────────────────────────────────────────┐   │
│  │      APIs Externas (Opcional)                │   │
│  │  - OpenAI Whisper (transcripción)            │   │
│  │  - Anthropic Claude (generación actas)       │   │
│  └──────────────────────────────────────────────┘   │
│                       ↓                              │
│  ┌──────────────────────────────────────────────┐   │
│  │      Funcionalidades locales (Gratis)       │   │
│  │  - Web Speech API (transcripción local)      │   │
│  │  - MediaRecorder API (grabación)             │   │
│  │  - docx-js (exportación Word)                │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### Componentes principales

#### 1. Frontend (React PWA)
- **Framework:** React 18 + Vite + PWA plugin
- **Estados:** 14 pantallas navegables
- **Rutas:** React Router
- **Estado local:** Zustand o Context API
- **Estilos:** Tailwind CSS o styled-components

#### 2. Almacenamiento (IndexedDB)
- **Base de datos:** IndexedDB v1
- **Stores:**
  - `comunidades` (1:1 con comunidades)
  - `propietarios` (1:N con comunidades)
  - `juntas` (1:1 con comunidades)
  - `grabaciones` (1:1 con juntas)
  - `transcripciones` (1:1 con juntas)
  - `actas` (1:1 con juntas)

#### 3. Funcionalidades locales
- **Grabación:** MediaRecorder API
- **Transcripción local:** Web Speech API
- **Exportación:** docx-js (generar .docx en navegador)

#### 4. APIs externas (opcional)
- **Transcripción:** OpenAI Whisper API
- **Generación actas:** Anthropic Claude API

---

## 🔄 Flujo de trabajo completo

### Flujo 1: Crear comunidad

```
Usuario → Formulario Nueva Comunidad
         ↓
  [Validación de datos]
         ↓
  [Guardar en IndexedDB]
         ↓
  [Volver a lista de comunidades]
```

**Paso 1.1:** Usuario rellena formulario
- Nombre de la comunidad
- Dirección completa (tipo de vía, nombre, número, CP, localidad, municipio, provincia)
- CIF
- Administrador (predefinido: Agencia Carigan)
- Lista de propietarios con cuota y cargo

**Paso 1.2:** Usuario sube plantilla de acta (.docx)

**Paso 1.3:** Sistema analiza la plantilla con IA
- Detecta campos fijos (verde)
- Detecta campos de junta (naranja)
- Detecta campos que rellena la IA (azul)

**Paso 1.4:** Usuario marca campos IA con badges toggleables
- 🤖 IA → campo generado automáticamente por IA
- ✏️ MANUAL → campo que el usuario debe editar manualmente

**Paso 1.5:** Sistema guarda la comunidad en IndexedDB

**Paso 1.6:** Sistema muestra confirmación y redirige a lista de comunidades

---

### Flujo 2: Crear junta

```
Usuario → Formulario Nueva Junta
         ↓
  [Validación de datos]
         ↓
  [Calcular 2.ª convocatoria +30 min]
         ↓
  [Preselección de asistentes]
         ↓
  [Guardar en IndexedDB]
         ↓
  [Volver a lista de juntas]
```

**Paso 2.1:** Usuario selecciona comunidad
- Dropdown con comunidades existentes

**Paso 2.2:** Usuario selecciona tipo de junta
- Ordinaria
- Extraordinaria

**Paso 2.3:** Usuario selecciona fecha y hora
- Fecha (input type="date")
- Hora 1.ª convocatoria (input type="time")
- Hora 2.ª convocatoria (calculada automáticamente +30 min)

**Paso 2.4:** Usuario define orden del día
- Lista editable de puntos
- Cada punto tiene número y texto

**Paso 2.5:** Usuario marca asistentes
- Checkbox en cada propietario
- Cálculo automático de quórum

**Paso 2.6:** Sistema guarda la junta en IndexedDB

**Paso 2.7:** Sistema muestra confirmación y redirige a detalle de junta

---

### Flujo 3: Grabar junta

```
Usuario → Pantalla de Grabación
         ↓
  [Iniciar grabación con MediaRecorder]
         ↓
  [Visualización de waveform]
         ↓
  [Detección automática de temas con IA]
         ↓
  [Marcadores manuales]
         ↓
  [Pausa/reanudación]
         ↓
  [Finalizar grabación]
         ↓
  [Guardar audio en IndexedDB]
```

**Paso 3.1:** Usuario inicia grabación
- Botón ⏺ grabar
- Sistema inicializa MediaRecorder API
- Visualizador de waveform en tiempo real

**Paso 3.2:** IA detecta temas automáticamente
- Apertura de sesión
- Cada punto del orden del día
- Votaciones
- Cierre de sesión
- Cada marca tiene:
  - Timestamp
  - Texto del tema
  - Tipo (AUTO/VOTO)

**Paso 3.3:** Usuario puede añadir marcadores manuales
- Botón 🔖
- Añade marca con texto personalizado
- Tipo: MANUAL

**Paso 3.4:** Usuario pausa/reanuda grabación
- Botón ⏸ pausar
- Botón ▶ reanudar

**Paso 3.5:** Usuario finaliza grabación
- Botón ⏹ parar
- Sistema detiene MediaRecorder
- Sistema guarda archivo de audio en IndexedDB
- Sistema calcula duración

**Paso 3.6:** Sistema muestra resumen y redirige a transcripción

---

### Flujo 4: Transcribir grabación

```
Usuario → Pantalla de Transcripción
         ↓
  [Seleccionar método de transcripción]
         ↓
  [Procesar audio]
         ↓
  [Visualización de progreso]
         ↓
  [Generar transcripción]
         ↓
  [Guardar en IndexedDB]
```

**Paso 4.1:** Usuario selecciona método de transcripción

**Opción A - Whisper (nube, 95% precisión):**
- Envía audio a OpenAI Whisper API
- Coste: 0,36€/hora
- Tiempo de espera: ~10-20 segundos
- Retorno: transcripción con timestamps

**Opción B - Local (gratis, ~65% eficacia):**
- Usa Web Speech API
- Coste: 0,00€
- Tiempo de espera: ~1-2 minutos
- Retorno: transcripción con timestamps

**Paso 4.2:** Sistema inicia proceso de transcripción
- Si es Whisper: muestra progreso de carga
- Si es local: muestra progreso de transcripción

**Paso 4.3:** Sistema genera transcripción
- Whisper: llama a API, espera respuesta
- Local: usa Web Speech API con audio como input

**Paso 4.4:** Sistema guarda transcripción en IndexedDB
- Texto completo
- Timestamps
- Marcadores vinculados a audio
- Método usado (Whisper/local)

**Paso 4.5:** Sistema muestra transcripción y redirige a generar acta

---

### Flujo 5: Generar acta con IA

```
Usuario → Pantalla Generar Acta
         ↓
  [Seleccionar plantilla de comunidad]
         ↓
  [Prompt estructurado a Claude]
         ↓
  [Generar acta con IA]
         ↓
  [Vista previa del acta]
         ↓
  [Guardar acta en IndexedDB]
```

**Paso 5.1:** Usuario selecciona comunidad
- Dropdown con comunidades existentes

**Paso 5.2:** Sistema prepara datos para Claude
- Comunidad: nombre, dirección, CIF, administrador
- Junta: fecha, hora, tipo, asistentes, quórum
- Transcripción: texto completo con timestamps
- Marcadores: temas detectados
- Plantilla: campos marcados (IA/MANUAL)

**Paso 5.3:** Sistema genera prompt para Claude
```
Genera un acta legal de junta de propietarios usando:

TRANSCRIPCIÓN:
[texto de la transcripción con timestamps]

DATOS COMUNIDAD:
- Nombre: Edificio Astur
- Dirección: Lugones, Siero, Asturias
- CIF: B-33XXXXXX
- Administrador: Carigan Servicios Integrados S.L.
- Presidente: Mª Luisa Ardisana López (1ºA, 10,77%)
- Secretario: Administrador

DATOS DE LA JUNTA:
- Fecha: 25/04/2026
- Hora: 18:30h
- Tipo: Ordinaria (2.ª convocatoria)
- Asistentes: 3 de 5 (36,53% cuota)
- Quórum: 36,53%
- Orden del día:
  1. Aprobación de cuentas 2025 y presupuesto 2026
  2. Renovación de cargos
  3. Ruegos y preguntas

PLANTILLA DE ACTA:
[campos marcados como IA/MANUAL]
```

**Paso 5.4:** Sistema llama a Claude API
- Coste: ~0,03€/acta
- Tiempo de espera: ~5-10 segundos

**Paso 5.5:** Claude genera el acta legal
- Formato estándar español
- Contiene:
  - Apertura de sesión
  - Orden del día
  - Desarrollo de puntos
  - Asistentes
  - Votaciones
  - Cierre de sesión
  - Firmas

**Paso 5.6:** Sistema guarda acta en IndexedDB
- Texto completo
- Fecha de generación
- Método usado (Claude)

**Paso 5.7:** Sistema muestra vista previa del acta y redirige a exportar

---

### Flujo 6: Exportar acta

```
Usuario → Pantalla Vista previa Acta
         ↓
  [Revisar acta generada]
         ↓
  [Editar si es necesario]
         ↓
  [Exportar a .docx]
         ↓
  [Descargar archivo]
```

**Paso 6.1:** Usuario revisa acta generada
- Muestra en formato documento
- Texto completo con formato

**Paso 6.2:** Usuario puede editar acta manualmente
- Texto editable
- Campos marcados como MANUAL

**Paso 6.3:** Usuario selecciona exportar
- Botón "Exportar a .docx"

**Paso 6.4:** Sistema genera archivo .docx
- Usa docx-js
- Formato legal estándar
- Nombre: `Acta_[Comunidad]_[Fecha].docx`

**Paso 6.5:** Sistema descarga el archivo
- En navegador
- Listo para imprimir y firmar

**Paso 6.6:** Sistema guarda acta como exportada en IndexedDB

---

## 🧩 Componentes técnicos

### Componente 1: Gestión de Comunidades

**Funciones:**
- CRUD completo de comunidades
- Validación de datos
- Subida de plantillas (.docx)
- Análisis de plantilla con IA

**Estructura de datos:**
```typescript
interface Comunidad {
  id: string;
  nombre: string;
  direccion: {
    tipo_via: string;
    nombre_via: string;
    numero: string;
    codigo_postal: string;
    localidad: string;
    municipio: string;
    provincia: string;
  };
  cif: string;
  administrador: string;
  propietarios: Propietario[];
  cargos: {
    presidente: string;
    secretario: string;
  };
  plantilla_acta: Blob; // .docx
  campos_ia: CampoIA[]; // Campos marcados como IA
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}
```

---

### Componente 2: Gestión de Propietarios

**Funciones:**
- CRUD completo de propietarios
- Validación de datos
- Cálculo automático de cuotas
- Selección de cargos

**Estructura de datos:**
```typescript
interface Propietario {
  id: string;
  comunidad_id: string;
  nombre: string;
  dni: string;
  telefono1: string;
  telefono2: string;
  email: string;
  tipo_propiedad: string;
  identificador: string;
  cuota: number; // en %
  cuota_decimal: number; // en 0-1
  cargo: string; // 'Presidente', 'Secretario', 'Propietario', 'Vocal'
  estado_pagos: string; // 'Pagado', 'Pendiente', 'Impagado'
  direccion_notificaciones: string;
  representante: string;
  observaciones: string;
  fecha_creacion: Date;
}
```

---

### Componente 3: Gestión de Juntas

**Funciones:**
- CRUD completo de juntas
- Doble convocatoria automática
- Preselección de asistentes
- Cálculo de quórum

**Estructura de datos:**
```typescript
interface Junta {
  id: string;
  comunidad_id: string;
  tipo: 'ordinaria' | 'extraordinaria';
  fecha: Date;
  hora_primera: string; // HH:MM
  hora_segunda: string; // HH:MM
  lugar: string;
  orden_dia: string[]; // Puntos numerados
  asistentes: Asistente[];
  estado: 'preparada' | 'en_curso' | 'finalizada';
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}
```

---

### Componente 4: Grabación de Audio

**Funciones:**
- Grabación con MediaRecorder API
- Visualización de waveform
- Detección automática de temas con IA
- Marcadores manuales
- Pausa/reanudación

**Estructura de datos:**
```typescript
interface Grabacion {
  id: string;
  junta_id: string;
  archivo_audio: Blob;
  duracion: number; // en segundos
  fecha: Date;
}
```

---

### Componente 5: Transcripción

**Funciones:**
- Transcripción con Whisper (nube)
- Transcripción local con Web Speech API
- Edición manual de texto
- Marcadores vinculados a timestamps

**Estructura de datos:**
```typescript
interface Transcripcion {
  id: string;
  junta_id: string;
  texto: string;
  metodo: 'whisper' | 'local';
  idioma: string;
  fecha: Date;
  marcas: Marca[]; // Marcadores de temas
}

interface Marca {
  tiempo: number; // en segundos
  texto: string;
  tipo: 'auto' | 'manual';
  punto: number; // punto del orden del día
}
```

---

### Componente 6: Generación de Actas

**Funciones:**
- Generación con Claude API
- Prompt estructurado
- Vista previa del acta
- Edición manual

**Estructura de datos:**
```typescript
interface Acta {
  id: string;
  junta_id: string;
  contenido: string; // Texto completo del acta
  archivo_docx: Blob; // .docx generado
  generada_por: 'claude' | 'manual';
  fecha_generacion: Date;
  exportada: boolean;
}
```

---

## 🔌 APIs integradas

### API 1: OpenAI Whisper

**Propósito:** Transcripción de audio a texto

**Endpoint:** `POST https://api.openai.com/v1/audio/transcriptions`

**Headers:**
```
Authorization: Bearer sk-...
Content-Type: multipart/form-data
```

**Parámetros:**
```json
{
  "file": "audio.mp3",
  "model": "whisper-1",
  "language": "es",
  "response_format": "verbose_json"
}
```

**Respuesta:**
```json
{
  "text": "Texto de la transcripción...",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 10.5,
      "text": "...",
      "temperature": 0.0
    }
  ]
}
```

**Coste:**
- $0.006 por minuto
- ~0,36€ por hora

**Precisión:**
- 95% en español

**Implementación:**
```typescript
async function transcribirConWhisper(audioBlob: Blob): Promise<Transcripcion> {
  const formData = new FormData();
  formData.append('file', audioBlob);
  formData.append('model', 'whisper-1');
  formData.append('language', 'es');
  formData.append('response_format', 'verbose_json');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  const data = await response.json();
  return {
    texto: data.text,
    marcas: data.segments.map(seg => ({
      tiempo: seg.start,
      texto: seg.text,
      tipo: 'auto',
      punto: 0,
    })),
  };
}
```

---

### API 2: Anthropic Claude

**Propósito:** Generación de actas legales

**Endpoint:** `POST https://api.anthropic.com/v1/messages`

**Headers:**
```
x-api-key: sk-ant-...
anthropic-version: 2023-06-01
content-type: application/json
```

**Parámetros:**
```json
{
  "model": "claude-3-sonnet-20240229",
  "max_tokens": 4096,
  "messages": [
    {
      "role": "user",
      "content": "Prompt completo..."
    }
  ]
}
```

**Prompt de ejemplo:**
```
Genera un acta legal de junta de propietarios usando:

TRANSCRIPCIÓN:
[texto de la transcripción con timestamps]

DATOS COMUNIDAD:
- Nombre: Edificio Astur
- Dirección: Lugones, Siero, Asturias
- CIF: B-33XXXXXX
- Administrador: Carigan Servicios Integrados S.L.
- Presidente: Mª Luisa Ardisana López (1ºA, 10,77%)
- Secretario: Administrador

DATOS DE LA JUNTA:
- Fecha: 25/04/2026
- Hora: 18:30h
- Tipo: Ordinaria (2.ª convocatoria)
- Asistentes: 3 de 5 (36,53% cuota)
- Quórum: 36,53%
- Orden del día:
  1. Aprobación de cuentas 2025 y presupuesto 2026
  2. Renovación de cargos
  3. Ruegos y preguntas

PLANTILLA DE ACTA:
[campos marcados como IA/MANUAL]
```

**Respuesta:**
```json
{
  "id": "msg_...",
  "type": "message",
  "content": [
    {
      "type": "text",
      "text": "Acta de la Junta General Ordinaria...\n\nEn Lugones-Siero, siendo las 18:30 horas...\n\nPreside D.ª Mª Luisa Ardisana López.\n\nSe aprueban las cuentas por UNANIMIDAD.\n\nSe levanta la sesión a las 19:45 horas.\n\nLa Presidenta\nMª Luisa Ardisana López\n\nEl Secretario-Administrador\nCarigan Servicios Integrados S.L."
    }
  ],
  "model": "claude-3-sonnet-20240229",
  "stop_reason": "end_turn"
}
```

**Coste:**
- ~0,03€ por acta

**Implementación:**
```typescript
async function generarActaConClaude(datos: ActaDatos): Promise<string> {
  const prompt = `
Genera un acta legal de junta de propietarios usando:

TRANSCRIPCIÓN:
${datos.transcripcion.texto}

DATOS COMUNIDAD:
- Nombre: ${datos.comunidad.nombre}
- Dirección: ${datos.comunidad.direccion.full}
- CIF: ${datos.comunidad.cif}
- Administrador: ${datos.comunidad.administrador}
- Presidente: ${datos.comunidad.cargos.presidente}
- Secretario: ${datos.comunidad.cargos.secretario}

DATOS DE LA JUNTA:
- Fecha: ${datos.junta.fecha}
- Hora: ${datos.junta.hora_primera}
- Tipo: ${datos.junta.tipo}
- Asistentes: ${datos.junta.asistentes.length} de ${datos.junta.asistentes.length}
- Quórum: ${datos.junta.quórum}%
- Orden del día:
  ${datos.junta.orden_dia.map((p, i) => `${i+1}. ${p}`).join('\n')}

PLANTILLA DE ACTA:
${datos.camposIA.map(c => c.tipo === 'IA' ? `🤖 ${c.nombre}` : `✏️ ${c.nombre}`).join('\n')}
  `.trim();

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        }
      ]
    }),
  });

  const data = await response.json();
  return data.content[0].text;
}
```

---

## 💾 Base de datos

### IndexedDB Schema

**Database name:** `gestactas_db`  
**Version:** 1

#### Store 1: `comunidades`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | Identificador único |
| `nombre` | string | Nombre de la comunidad |
| `direccion` | object | Dirección completa |
| `cif` | string | CIF de la comunidad |
| `administrador` | string | Nombre del administrador |
| `propietarios` | array | Lista de propietarios |
| `cargos` | object | Presidenta y Secretaria |
| `plantilla_acta` | Blob | Plantilla .docx |
| `campos_ia` | array | Campos marcados como IA |
| `fecha_creacion` | Date | Fecha de creación |
| `fecha_actualizacion` | Date | Última actualización |

**Índice:** `id`

---

#### Store 2: `propietarios`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | Identificador único |
| `comunidad_id` | string | ID de la comunidad |
| `nombre` | string | Nombre del propietario |
| `dni` | string | DNI/NIE |
| `telefono1` | string | Teléfono 1 |
| `telefono2` | string | Teléfono 2 |
| `email` | string | Email |
| `tipo_propiedad` | string | Tipo de propiedad |
| `identificador` | string | Identificador (piso, etc.) |
| `cuota` | number | Cuota en % |
| `cuota_decimal` | number | Cuota en 0-1 |
| `cargo` | string | Cargo (Presidente, etc.) |
| `estado_pagos` | string | Estado de pagos |
| `direccion_notificaciones` | string | Dirección de notificaciones |
| `representante` | string | Representante/apoderado |
| `observaciones` | string | Observaciones |
| `fecha_creacion` | Date | Fecha de creación |
| `fecha_actualizacion` | Date | Última actualización |

**Índices:** `comunidad_id`

---

#### Store 3: `juntas`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | Identificador único |
| `comunidad_id` | string | ID de la comunidad |
| `tipo` | string | 'ordinaria' | 'extraordinaria' |
| `fecha` | Date | Fecha de la junta |
| `hora_primera` | string | Hora 1.ª convocatoria |
| `hora_segunda` | string | Hora 2.ª convocatoria |
| `lugar` | string | Lugar de la junta |
| `orden_dia` | array | Puntos del orden del día |
| `asistentes` | array | Lista de asistentes |
| `estado` | string | 'preparada' | 'en_curso' | 'finalizada' |
| `fecha_creacion` | Date | Fecha de creación |
| `fecha_actualizacion` | Date | Última actualización |

**Índices:** `comunidad_id`, `fecha`

---

#### Store 4: `grabaciones`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | Identificador único |
| `junta_id` | string | ID de la junta |
| `archivo_audio` | Blob | Archivo de audio |
| `duracion` | number | Duración en segundos |
| `fecha` | Date | Fecha de grabación |

**Índice:** `junta_id`

---

#### Store 5: `transcripciones`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | Identificador único |
| `junta_id` | string | ID de la junta |
| `texto` | string | Texto de la transcripción |
| `metodo` | string | 'whisper' | 'local' |
| `idioma` | string | Idioma de la transcripción |
| `fecha` | Date | Fecha de transcripción |
| `marcas` | array | Marcadores de temas |

**Índice:** `junta_id`

---

#### Store 6: `actas`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string (UUID) | Identificador único |
| `junta_id` | string | ID de la junta |
| `contenido` | string | Texto completo del acta |
| `archivo_docx` | Blob | Archivo .docx |
| `generada_por` | string | 'claude' | 'manual' |
| `fecha_generacion` | Date | Fecha de generación |
| `exportada` | boolean | ¿Ya exportada? |

**Índice:** `junta_id`

---

### Operaciones CRUD

#### CRUD de Comunidades

```typescript
// Crear comunidad
async function crearComunidad(comunidad: Comunidad): Promise<string> {
  return await db.put('comunidades', comunidad);
}

// Leer comunidad
async function leerComunidad(id: string): Promise<Comunidad | null> {
  return await db.get('comunidades', id);
}

// Actualizar comunidad
async function actualizarComunidad(comunidad: Comunidad): Promise<void> {
  comunidad.fecha_actualizacion = new Date();
  await db.put('comunidades', comunidad);
}

// Eliminar comunidad
async function eliminarComunidad(id: string): Promise<void> {
  await db.delete('comunidades', id);
}

// Listar comunidades
async function listarComunidades(): Promise<Comunidad[]> {
  return await db.getAllFromIndex('comunidades', 'id');
}
```

#### CRUD de Propietarios

```typescript
// Crear propietario
async function crearPropietario(propietario: Propietario): Promise<string> {
  return await db.put('propietarios', propietario);
}

// Leer propietarios por comunidad
async function leerPropietariosPorComunidad(comunidad_id: string): Promise<Propietario[]> {
  return await db.getAllFromIndex('propietarios', 'comunidad_id', IDBKeyRange.only(comunidad_id));
}

// Actualizar propietario
async function actualizarPropietario(propietario: Propietario): Promise<void> {
  propietario.fecha_actualizacion = new Date();
  await db.put('propietarios', propietario);
}

// Eliminar propietario
async function eliminarPropietario(id: string): Promise<void> {
  await db.delete('propietarios', id);
}
```

#### CRUD de Juntas

```typescript
// Crear junta
async function crearJunta(junta: Junta): Promise<string> {
  return await db.put('juntas', junta);
}

// Leer junta
async function leerJunta(id: string): Promise<Junta | null> {
  return await db.get('juntas', id);
}

// Actualizar junta
async function actualizarJunta(junta: Junta): Promise<void> {
  junta.fecha_actualizacion = new Date();
  await db.put('juntas', junta);
}

// Eliminar junta
async function eliminarJunta(id: string): Promise<void> {
  await db.delete('juntas', id);
}

// Listar juntas por comunidad
async function listarJuntasPorComunidad(comunidad_id: string): Promise<Junta[]> {
  return await db.getAllFromIndex('juntas', 'comunidad_id', IDBKeyRange.only(comunidad_id));
}

// Listar juntas por fecha
async function listarJuntasPorFecha(fecha: Date): Promise<Junta[]> {
  return await db.getAllFromIndex('juntas', 'fecha', IDBKeyRange.lowerBound(fecha));
}
```

---

## 🔌 Endpoints y endpoints

### Endpoints de la PWA

**Nota:** Esta es una PWA standalone, no hay endpoints REST. Los datos se gestionan directamente en IndexedDB.

#### Endpoints de configuración

**GET /api/config**
- Obtiene la configuración de la aplicación
- Respuesta:
  ```json
  {
    "idioma": "es",
    "metodo_transcripcion": "whisper",
    "api_keys": {
      "openai": "sk-...",
      "anthropic": "sk-ant-..."
    }
  }
  ```

**PUT /api/config**
- Guarda la configuración de la aplicación
- Body:
  ```json
  {
    "idioma": "es",
    "metodo_transcripcion": "whisper",
    "api_keys": {
      "openai": "sk-...",
      "anthropic": "sk-ant-..."
    }
  }
  ```

---

### Endpoints de exportación (simulados)

**POST /api/exportar-acta**
- Exporta una acta a .docx
- Body:
  ```json
  {
    "acta_id": "xxx",
    "formato": "docx"
  }
  ```
- Respuesta: Blob (.docx)

---

## 🎙️ Proceso de transcripción

### Flujo de transcripción con Whisper

```
Usuario inicia transcripción
         ↓
  [Validar API key OpenAI]
         ↓
  [Preparar archivo de audio]
         ↓
  [Enviar a Whisper API]
         ↓
  [Esperar respuesta]
         ↓
  [Procesar respuesta]
         ↓
  [Guardar transcripción en IndexedDB]
         ↓
  [Mostrar transcripción al usuario]
```

**Implementación:**
```typescript
async function transcribirConWhisper(audioBlob: Blob, junta_id: string): Promise<Transcripcion> {
  try {
    // 1. Validar API key
    if (!OPENAI_API_KEY) {
      throw new Error('Falta API key de OpenAI');
    }

    // 2. Preparar FormData
    const formData = new FormData();
    formData.append('file', audioBlob);
    formData.append('model', 'whisper-1');
    formData.append('language', 'es');
    formData.append('response_format', 'verbose_json');

    // 3. Enviar a Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error en transcripción Whisper');
    }

    const data = await response.json();

    // 4. Procesar respuesta
    const transcripcion: Transcripcion = {
      id: generarUUID(),
      junta_id: junta_id,
      texto: data.text,
      metodo: 'whisper',
      idioma: 'es',
      fecha: new Date(),
      marcas: data.segments.map((seg: any) => ({
        tiempo: seg.start,
        texto: seg.text,
        tipo: 'auto',
        punto: 0,
      })),
    };

    // 5. Guardar en IndexedDB
    await guardarTranscripcion(transcripcion);

    return transcripcion;

  } catch (error) {
    console.error('Error en transcripción Whisper:', error);
    throw error;
  }
}
```

---

### Flujo de transcripción local

```
Usuario inicia transcripción
         ↓
  [Validar soporte Web Speech API]
         ↓
  [Iniciar reconocimiento de voz]
         ↓
  [Procesar audio en tiempo real]
         ↓
  [Actualizar texto en tiempo real]
         ↓
  [Guardar transcripción en IndexedDB]
         ↓
  [Mostrar transcripción al usuario]
```

**Implementación:**
```typescript
async function transcribirLocal(audioBlob: Blob, junta_id: string): Promise<Transcripcion> {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. Validar soporte Web Speech API
      if (!('webkitSpeechRecognition' in window)) {
        throw new Error('Web Speech API no soportada');
      }

      // 2. Iniciar reconocimiento
      const recognition = new webkitSpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;

      const transcripcionTexto: string[] = [];
      const marcas: Marca[] = [];

      // 3. Procesar audio
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer());
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      // Nota: Web Speech API no puede procesar directamente archivos de audio
      // Para transcripción local, se requiere procesamiento en servidor o uso de Whisper local
      throw new Error('Transcripción local requiere procesamiento en servidor');

    } catch (error) {
      reject(error);
    }
  });
}
```

**Nota:** La transcripción local con Web Speech API requiere procesamiento en servidor o uso de Whisper local. En esta implementación, se recomienda usar Whisper API para transcripción.

---

## 🤖 Proceso de generación de actas

### Flujo de generación con Claude

```
Usuario selecciona comunidad
         ↓
  [Cargar datos de comunidad]
         ↓
  [Cargar datos de junta]
         ↓
  [Cargar transcripción]
         ↓
  [Cargar plantilla]
         ↓
  [Generar prompt estructurado]
         ↓
  [Enviar a Claude API]
         ↓
  [Esperar respuesta]
         ↓
  [Procesar respuesta]
         ↓
  [Guardar acta en IndexedDB]
         ↓
  [Mostrar vista previa al usuario]
```

**Implementación:**
```typescript
async function generarActaConClaude(
  comunidad: Comunidad,
  junta: Junta,
  transcripcion: Transcripcion
): Promise<string> {
  try {
    // 1. Validar API key Anthropic
    if (!ANTHROPIC_API_KEY) {
      throw new Error('Falta API key de Anthropic');
    }

    // 2. Preparar datos
    const datos = {
      comunidad: {
        nombre: comunidad.nombre,
        direccion: comunidad.direccion.full,
        cif: comunidad.cif,
        administrador: comunidad.administrador,
        cargos: comunidad.cargos,
      },
      junta: {
        fecha: junta.fecha,
        hora: junta.hora_primera,
        tipo: junta.tipo,
        asistentes: junta.asistentes,
        quórum: calcularQuórum(junta),
        orden_dia: junta.orden_dia,
      },
      transcripcion: transcripcion.texto,
      marcas: transcripcion.marcas,
      camposIA: comunidad.camposIA,
    };

    // 3. Generar prompt
    const prompt = generarPromptActa(datos);

    // 4. Enviar a Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error('Error en generación de acta con Claude');
    }

    const data = await response.json();

    // 5. Procesar respuesta
    const actaTexto = data.content[0].text;

    return actaTexto;

  } catch (error) {
    console.error('Error en generación de acta:', error);
    throw error;
  }
}

function generarPromptActa(datos: any): string {
  return `
Genera un acta legal de junta de propietarios usando:

TRANSCRIPCIÓN:
${datos.transcripcion}

DATOS COMUNIDAD:
- Nombre: ${datos.comunidad.nombre}
- Dirección: ${datos.comunidad.direccion}
- CIF: ${datos.comunidad.cif}
- Administrador: ${datos.comunidad.administrador}
- Presidente: ${datos.comunidad.cargos.presidente}
- Secretario: ${datos.comunidad.cargos.secretario}

DATOS DE LA JUNTA:
- Fecha: ${datos.junta.fecha}
- Hora: ${datos.junta.hora}
- Tipo: ${datos.junta.tipo}
- Asistentes: ${datos.junta.asistentes.length} de ${datos.junta.asistentes.length}
- Quórum: ${datos.junta.quórum}%
- Orden del día:
  ${datos.junta.orden_dia.map((p, i) => `${i+1}. ${p}`).join('\n')}

PLANTILLA DE ACTA:
${datos.camposIA.map(c => c.tipo === 'IA' ? `🤖 ${c.nombre}` : `✏️ ${c.nombre}`).join('\n')}
  `.trim();
}
```

---

## 📄 Proceso de exportación

### Flujo de exportación a .docx

```
Usuario selecciona acta
         ↓
  [Cargar texto del acta]
         ↓
  [Generar documento .docx]
         ↓
  [Descargar archivo]
         ↓
  [Marcar como exportada]
```

**Implementación:**
```typescript
async function exportarActaADocx(acta: Acta): Promise<Blob> {
  try {
    // 1. Cargar texto del acta
    const textoActa = acta.contenido;

    // 2. Generar documento .docx
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: 'Acta de la Junta General',
                bold: true,
                size: 28,
              }),
            ],
          }),
          new docx.Paragraph({
            children: [
              new docx.TextRun({
                text: textoActa,
                size: 24,
              }),
            ],
          }),
        ],
      }],
    });

    // 3. Generar archivo .docx
    const buffer = await docx.Packer.toBuffer(doc);

    // 4. Crear Blob
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

    // 5. Descargar archivo
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Acta_${acta.junta_id.substring(0, 8)}_${formatoFecha(acta.junta.fecha)}.docx`;
    link.click();
    URL.revokeObjectURL(url);

    // 6. Marcar como exportada
    await actualizarActaExportada(acta.id);

    return blob;

  } catch (error) {
    console.error('Error en exportación de acta:', error);
    throw error;
  }
}

function formatoFecha(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}
```

---

## 📱 PWA y instalabilidad

### manifest.json

```json
{
  "name": "GestActas",
  "short_name": "GestActas",
  "description": "Gestión inteligente de juntas de propietarios",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#0f172a",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

### service-worker.js

```javascript
const CACHE_NAME = 'gestactas-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Instalar service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Activar service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar solicitudes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
  );
});
```

---

## 🗺️ Roadmap de desarrollo

### Fase 1: Setup y configuración (1-2 semanas)
- [ ] Configurar repositorio React PWA
- [ ] Configurar Vite + PWA plugin
- [ ] Configurar Tailwind CSS
- [ ] Configurar React Router
- [ ] Configurar Zustand (gestión de estado)
- [ ] Configurar IndexedDB wrapper (idb)

### Fase 2: Frontend básico (2-3 semanas)
- [ ] Crear componentes base (Layout, Navbar, Footer)
- [ ] Crear 14 pantallas
- [ ] Implementar navegación con React Router
- [ ] Implementar gestión de estado con Zustand
- [ ] Implementar navegación con swipe gestures
- [ ] Implementar botón atrás en todas las pantallas

### Fase 3: Gestión de Comunidades (2 semanas)
- [ ] CRUD completo de comunidades
- [ ] Formulario Nueva Comunidad
- [ ] Formulario Detalle de Comunidad
- [ ] Formulario Nuevo Propietario
- [ ] Subida de plantilla .docx
- [ ] Análisis de plantilla con IA (simulado)
- [ ] Vista previa de plantilla con campos IA marcados
- [ ] Toggle badges IA/MANUAL

### Fase 4: Gestión de Juntas (2 semanas)
- [ ] CRUD completo de juntas
- [ ] Formulario Nueva Junta
- [ ] Doble convocatoria automática +30 min
- [ ] Selección de asistentes
- [ ] Cálculo de quórum
- [ ] Formulario Detalle de Junta
- [ ] Orden del día editable

### Fase 5: Grabación de Audio (1-2 semanas)
- [ ] Implementación MediaRecorder API
- [ ] Visualizador de waveform
- [ ] Controles de pausa/reanudación
- [ ] Marcadores manuales
- [ ] Detección automática de temas con IA (simulado)

### Fase 6: Transcripción (2 semanas)
- [ ] Integración OpenAI Whisper API
- [ ] Implementación Web Speech API (local)
- [ ] Visualización de progreso
- [ ] Procesamiento de timestamps
- [ ] Edición manual del texto
- [ ] Marcadores vinculados a timestamps

### Fase 7: Generación de Actas (2 semanas)
- [ ] Integración Anthropic Claude API
- [ ] Generación de prompt estructurado
- [ ] Generación del acta con IA
- [ ] Vista previa del acta
- [ ] Edición manual del acta

### Fase 8: Exportación (1 semana)
- [ ] Integración docx-js
- [ ] Generación de .docx
- [ ] Descarga del archivo
- [ ] Marcar como exportada

### Fase 9: PWA completa (1 semana)
- [ ] Crear manifest.json
- [ ] Crear service-worker.js
- [ ] Crear iconos de la app
- [ ] Configurar instalación PWA
- [ ] Testing en móvil

### Fase 10: Testing y refinamiento (1-2 semanas)
- [ ] Testing completo de todas las pantallas
- [ ] Testing en móvil
- [ ] Refinamiento de UX/UI
- [ ] Optimización de rendimiento
- [ ] Bug fixing

**Tiempo total estimado:** 14-18 semanas

---

## 📊 Métricas del MVP

### KPIs principales
- **Tasa de conversión:** % de juntas completadas (grabación → acta)
- **Precisión transcripción:** % de aciertos en transcripción
- **Precisión generación acta:** % de aciertos en generación de actas
- **Tiempo de transcripción:** segundos/acta
- **Coste por acta:** €/acta
- **Uso diario:** # de actas generadas al día

### Métricas técnicas
- **Tiempo de carga inicial:** < 2 segundos
- **Tiempo de transcripción (Whisper):** < 20 segundos
- **Tiempo de generación acta (Claude):** < 10 segundos
- **Tamaño de IndexedDB:** < 100 MB
- **Uso de memoria:** < 50 MB

---

## 🎯 Resumen

Este es el primer borrador de especificaciones técnicas del MVP de GestActas. Describe:

✅ **Arquitectura completa** - Stack tecnológico, componentes, APIs  
✅ **Flujo de trabajo** - Desde creación de comunidad hasta exportación de acta  
✅ **Componentes técnicos** - Cada componente con estructura de datos y funciones  
✅ **APIs integradas** - Whisper y Claude con endpoints y costes  
✅ **Base de datos** - IndexedDB con schema completo  
✅ **Procesos** - Transcripción, generación de actas, exportación  
✅ **PWA** - manifest.json, service-worker, instalabilidad  
✅ **Roadmap** - 10 fases con timeline estimado

**Estado actual:** Borrador de especificaciones  
**Estado objetivo:** MVP funcional con todas las características implementadas

---

**Documento generado el:** 27 de abril de 2026  
**Próxima actualización:** Cuando se complete cada fase del roadmap
