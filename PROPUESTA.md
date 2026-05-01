# GestActas — Propuesta técnica Bloque 7

## Paso en curso
Bloque 7 propuesto: conectar toda la lógica construida en los bloques anteriores con la UI real de GestActas, de forma que la app deje de mostrar datos estáticos y muestre datos reales.

## Estado actual
- Bloque 1 completado: estructura base de juntas y convocatorias.
- Bloque 2 completado: documento Word de convocatoria.
- Bloque 3 completado: grabación real de audio y almacenamiento local.
- Bloque 4 completado: transcripción con Whisper y Web Speech API.
- Bloque 5 completado: generación de actas con Claude.
- Bloque 6 completado: exportación a Word profesional.
- Bloque 7 pendiente: conexión de toda la lógica con la UI.

## Objetivo general del Bloque 7
Crear una interfaz de usuario funcional que conecte todos los servicios implementados en los Bloques 1-6, permitiendo una experiencia de usuario completa donde:
- Los datos se ingresen y almacenen realmente en IndexedDB
- La grabación de audio funcione con la API de MediaRecorder
- La transcripción se realice realmente con Whisper/Web Speech API
- Las actas se generen realmente con Claude API
- Las exportaciones a Word funcionen realmente
- La aplicación sea completamente funcional con datos reales

## Objetivos funcionales
1. Crear una interfaz de usuario completa que permita la entrada de datos reales.
2. Implementar la grabación de audio real con MediaRecorder API.
3. Implementar la transcripción real con Whisper API y Web Speech API.
4. Implementar la generación real de actas con Claude API.
5. Implementar la exportación real a Word (.docx).
6. Crear un sistema de navegación completo entre todas las pantallas.
7. Implementar el almacenamiento local de todos los datos en IndexedDB.
8. Crear un sistema de feedback visual en tiempo real.

## Alcance del Bloque 7

### 1. Conexión de datos reales con IndexedDB
Crear un servicio de almacenamiento robusto que permita:
- Almacenar juntas, convocatorias, asistentes, propietarios, etc.
- Recuperar datos almacenados
- Actualizar datos existentes
- Eliminar datos
- Establecer relaciones entre datos (ej. asistentes a una junta específica)
- Implementar migración de datos si es necesario

### 2. UI de gestión de juntas
Crear pantallas completas para:
- **Lista de juntas**: Mostrar todas las juntas con filtros y búsqueda
- **Detalle de junta**: Ver detalles completos de una junta específica
- **Formulario de nueva junta**: Entrada completa de datos de junta
- **Gestión de asistentes**: Añadir, eliminar y editar asistentes a una junta
- **Gestión de quórum**: Establecer y ver el quórum de cada junta

### 3. UI de grabación de audio
Crear una interfaz de grabación real que permita:
- **Pantalla de grabación**: Botón de grabar, pausar, detener
- **Visualizador de audio**: Waveform de audio en tiempo real
- **Gestión de grabaciones**: Ver, escuchar y eliminar grabaciones
- **Selección de grabación**: Elegir cuál grabación usar para transcripción

### 4. UI de transcripción
Crear una interfaz de transcripción que permita:
- **Selección de grabación**: Elegir grabación a transcribir
- **Transcripción en tiempo real**: Mostrar texto mientras se transcribe
- **Edición de transcripción**: Corregir, añadir y eliminar texto
- **Exportación de transcripción**: Guardar transcripción como texto

### 5. UI de generación de actas
Crear una interfaz de generación de actas que permita:
- **Selección de junta**: Elegir qué junta generar acta
- **Selección de plantilla**: Elegir plantilla de acta
- **Generación de acta**: Llamar a Claude API y mostrar resultado
- **Edición de acta generada**: Corregir, añadir y eliminar contenido
- **Validación de acta**: Verificar que la acta es válida antes de exportar

### 6. UI de exportación a Word
Crear una interfaz de exportación a Word que permita:
- **Vista previa de acta**: Ver cómo quedará el documento Word
- **Exportación a Word**: Generar el archivo .docx real
- **Descarga del archivo**: Descargar el archivo generado
- **Historial de exportaciones**: Ver actas exportadas anteriormente
- **Compartir exportación**: Generar enlace para compartir

### 7. Navegación completa
Implementar un sistema de navegación que permita:
- **Navegación entre pantallas**: Ir de una pantalla a otra
- **Navegación en árbol**: Estructura jerárquica de la aplicación
- **Navegación con tabs**: Tabs para pantallas principales
- **Navegación con drawer**: Drawer lateral para menús secundarios
- **Navegación con modales**: Modales para acciones secundarias

### 8. Sistema de feedback visual
Implementar un sistema de feedback que permita:
- **Feedback de carga**: Indicar cuando se está procesando
- **Feedback de éxito**: Confirmar acciones exitosas
- **Feedback de error**: Mostrar errores de forma clara
- **Feedback de progreso**: Mostrar progreso de operaciones largas
- **Feedback de validación**: Indicar si los datos son válidos

## Observaciones de mejora

**Observación 1: Arquitectura de navegación**
Actualmente no hay una arquitectura clara de navegación. Se recomienda implementar un patrón de navegación basado en:
- **Tabs principales**: Juntas, Actas, Grabación, Exportar, Historial
- **Navegación en árbol**: Para detalles y formularios
- **Modales**: Para acciones secundarias
- **Drawer lateral**: Para menús contextuales

**Observación 2: Manejo de errores**
Se debe implementar un sistema robusto de manejo de errores que permita:
- Capturar errores en todas las operaciones
- Mostrar errores de forma clara al usuario
- Registrar errores para depuración
- Proporcionar soluciones o workarounds

**Observación 3: Persistencia de datos**
Se debe asegurar que todos los datos se guarden en IndexedDB de forma consistente:
- Validar que los datos se guarden correctamente
- Implementar respaldo de datos
- Implementar recuperación de datos
- Implementar migración de datos si cambia la estructura

**Observación 4: Feedback del usuario**
Se debe proporcionar feedback constante al usuario:
- Indicar estado de operaciones
- Mostrar progreso de operaciones largas
- Confirmar acciones exitosas
- Mostrar errores de forma clara
- Proporcionar ayuda cuando sea necesario

**Observación 5: Accesibilidad**
Se debe mejorar la accesibilidad de la aplicación:
- Añadir etiquetas ARIA a elementos interactivos
- Añadir atajos de teclado
- Añadir soporte para navegación por teclado
- Mejorar contraste de colores
- Añadir soporte para lectores de pantalla

**Observación 6: Responsividad**
Se debe mejorar la responsividad de la aplicación:
- Optimizar para móviles
- Optimizar para tablets
- Optimizar para escritorio
- Implementar diseño responsive
- Añadir soporte para diferentes tamaños de pantalla

**Observación 7: Internacionalización**
Se debe prepararse para internacionalización:
- Preparar textos para traducción
- Preparar fechas para diferentes formatos
- Preparar monedas para diferentes países
- Añadir soporte para múltiples idiomas

## Arquitectura propuesta

### Principio general
Se mantendrá la arquitectura actual en HTML/CSS/JS vanilla, sin introducir dependencias pesadas innecesarias. El bloque se integrará con el trabajo ya realizado en los Bloques 1-6.

### Capas previstas
1. **Capa de datos**
   - Servicio de almacenamiento en IndexedDB
   - Servicio de migración de datos
   - Servicio de validación de datos

2. **Capa de servicios**
   - Servicio de juntas
   - Servicio de asistentes
   - Servicio de grabaciones
   - Servicio de transcripciones
   - Servicio de actas
   - Servicio de exportaciones

3. **Capa de UI**
   - Pantallas de gestión de juntas
   - Pantallas de grabación
   - Pantallas de transcripción
   - Pantallas de generación de actas
   - Pantallas de exportación
   - Sistema de navegación

4. **Capa de utilidades**
   - Utilidades de almacenamiento
   - Utilidades de validación
   - Utilidades de formateo
   - Utilidades de feedback

## Archivos previstos

### Archivos de servicio
- `gestactas/src/services/indexeddb.service.js` - Servicio de almacenamiento en IndexedDB
- `gestactas/src/services/juntas.service.js` - Servicio de gestión de juntas
- `gestactas/src/services/grabacion.service.js` - Servicio de grabación de audio
- `gestactas/src/services/transcripcion.service.js` - Servicio de transcripción
- `gestactas/src/services/actas.service.js` - Servicio de gestión de actas

### Archivos de UI
- `gestactas/src/ui/pantallas/juntas-lista.html` - Lista de juntas
- `gestactas/src/ui/pantallas/junta-detalle.html` - Detalle de junta
- `gestactas/src/ui/pantallas/junta-crear.html` - Formulario de nueva junta
- `gestactas/src/ui/pantallas/grabacion.html` - Pantalla de grabación
- `gestactas/src/ui/pantallas/transcripcion.html` - Pantalla de transcripción
- `gestactas/src/ui/pantallas/actas.html` - Pantalla de actas
- `gestactas/src/ui/pantallas/exportar.html` - Pantalla de exportación
- `gestactas/src/ui/navegacion.html` - Sistema de navegación

### Archivos de utilidades
- `gestactas/src/utilidades/storage.js` - Utilidades de almacenamiento
- `gestactas/src/utilidades/validacion.js` - Utilidades de validación
- `gestactas/src/utilidades/feedback.js` - Utilidades de feedback

## Criterio de cierre propuesto para el Bloque 7
El Bloque 7 se considerará correctamente ejecutado cuando:
- Un usuario pueda crear una junta real con datos
- Un usuario pueda grabar audio real
- Un usuario pueda transcribir el audio
- Un usuario pueda generar un acta real con Claude
- Un usuario pueda exportar el acta a Word real
- La aplicación sea completamente funcional con datos reales
- La aplicación tenga una interfaz de usuario completa
- La aplicación tenga un sistema de navegación completo

## Fuera de alcance de este bloque
Este bloque no debe incluir todavía:
- Firma electrónica avanzada
- Envío automático por email
- Registro telemático externo
- Integración con plataformas legales de terceros
- Sistema de notificaciones push
- Integración con servicios de terceros

## Esperando autorización
SÍ

No se ejecutará ningún desarrollo del Bloque 7 sin autorización expresa de Lorenzo.

---
