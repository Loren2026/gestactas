# GestActas — Propuesta técnica Bloque 6

## Paso en curso
Bloque 6 propuesto: exportación final del acta a Word (.docx) profesional, lista para imprimir y enviar a propietarios.

## Estado actual
- Bloque 1 completado y mantenido como base estable.
- Bloque 2 completado: juntas, convocatoria, asistentes, quórum y documento Word de convocatoria.
- Bloque 3 completado: grabación real, gestión de audio y almacenamiento local.
- Bloque 4 completado: transcripción con Whisper y Web Speech API, persistencia local y edición de transcripciones.
- Bloque 5 completado: generación de actas con Claude, validación, tareas pendientes, exportación base y plantillas.

## Objetivo general del Bloque 6
Implementar la exportación final del acta de junta a formato Word (.docx) profesional, utilizando los datos ya estructurados en GestActas para producir un documento formal, imprimible y apto para envío a los propietarios de la comunidad.

## Objetivos funcionales
1. Generar un archivo Word (.docx) profesional desde un acta ya creada.
2. Incluir formato jurídico y presentación formal.
3. Reutilizar todos los datos ya capturados en GestActas.
4. Permitir vista previa y descarga directa.
5. Validar que el documento contiene todos los campos obligatorios.
6. Mantener compatibilidad con plantillas oficiales y personalización por comunidad.

## Alcance del Bloque 6

### 1. Exportación a Word (.docx) profesional
La exportación final debe producir un documento Word estructurado con formato formal y jurídico, incluyendo al menos:
- cabecera institucional de la comunidad,
- título principal: "ACTA DE JUNTA DE PROPIETARIOS",
- tipo y número de convocatoria,
- fecha, hora y lugar,
- asistentes con datos completos,
- quórum,
- orden del día,
- desarrollo,
- votaciones detalladas,
- acuerdos adoptados,
- tareas o pendientes,
- bloque final de firma de presidente y secretario,
- lugar y fecha de firma.

### 2. Reutilización de datos existentes
El módulo debe aprovechar datos ya existentes en la app:
- datos de junta,
- datos de comunidad,
- propietarios,
- coeficientes,
- asistentes,
- quórum,
- votaciones,
- acuerdos,
- tareas pendientes,
- texto del acta generado en Bloque 5,
- datos derivados de la transcripción y de Claude.

### 3. Plantillas profesionales
Se propondrá una capa de plantilla Word profesional con:
- márgenes y espaciado de impresión,
- tipografía legible,
- encabezado institucional,
- jerarquía visual clara,
- bloques de firma,
- tablas o listados de asistentes y votaciones,
- estilo jurídico formal.

### 4. Personalización según comunidad
La exportación deberá adaptarse a cada comunidad mediante:
- nombre de comunidad,
- dirección,
- CIF si existe,
- administrador o secretario,
- presidente,
- elementos visuales básicos configurables,
- datos de propietarios y cargos.

### 5. Validación del formato
Antes de ofrecer el archivo final, el sistema deberá validar:
- que la estructura interna del DOCX es correcta,
- que existen los campos obligatorios,
- que el documento no sale vacío,
- que el contenido es imprimible y coherente.

## Arquitectura propuesta

### Principio general
Se mantendrá la arquitectura actual en HTML/CSS/JS vanilla, sin introducir dependencias pesadas innecesarias. El bloque se integrará con el trabajo ya realizado en actas, exportación base y generación DOCX previa.

### Capas previstas
1. **Modelo de datos de exportación**
   - representación normalizada del acta final a exportar.

2. **Servicio de composición DOCX**
   - construcción del documento Word a partir de datos estructurados.

3. **Servicio de exportación de actas**
   - selección de versión final o activa,
   - validación de datos,
   - generación del blob DOCX,
   - descarga.

4. **Servicio de validación**
   - validación del contenido obligatorio,
   - validación de la estructura mínima del documento.

5. **UI de vista previa y exportación**
   - vista previa del documento,
   - exportación,
   - impresión,
   - mensajes de validación.

## Modelo de datos propuesto

### Estructura intermedia `actaExportData`
No necesariamente persistida como entidad independiente, pero sí recomendable como objeto normalizado.

Campos recomendados:
- `acta_id`
- `version_id`
- `comunidad`
  - `nombre`
  - `direccion`
  - `cif`
  - `presidente`
  - `secretario`
- `junta`
  - `tipo`
  - `convocatoria`
  - `fecha`
  - `hora`
  - `lugar`
- `asistentes`
  - `nombre`
  - `dni`
  - `coeficiente`
  - `direccion_vivienda`
  - `cargo`
- `quorum`
- `orden_dia`
- `desarrollo`
- `votaciones`
  - `asunto`
  - `a_favor`
  - `en_contra`
  - `abstenciones`
  - `porcentaje_participacion`
  - `resultado`
  - `decision_aprobada`
- `acuerdos`
- `pendientes`
- `firmas`
  - `presidente`
  - `secretario`
  - `lugar_firma`
  - `fecha_firma`

## Servicios propuestos

### `acta-docx.service.js`
Responsabilidad:
- `buildActaDocx(actaData)`
- composición del documento Word profesional
- bloques de cabecera, asistentes, votaciones, acuerdos y firmas
- generación del blob DOCX final

### `actas-export.service.js`
Responsabilidad:
- `exportActaToDocx(actaId, filename)`
- recuperar el acta y la versión correcta
- convertir a estructura exportable
- invocar al generador DOCX
- lanzar descarga

### `docx-validation.service.js`
Responsabilidad:
- `validateActaFormat(docxContent)`
- comprobar estructura mínima del ZIP DOCX
- comprobar presencia de bloques esenciales
- detectar documentos vacíos o incompletos

### `acta-preview.service.js` o apoyo en UI
Responsabilidad:
- preparar una representación HTML o texto enriquecido similar al documento final
- facilitar revisión visual antes de descargar

## Integración con Claude API
El Bloque 6 no generará el acta desde cero, sino que consumirá el resultado ya estructurado del Bloque 5.

Por tanto, la integración con Claude API será indirecta pero crítica:
- tomará la estructura JSON y/o Markdown generada por Claude,
- la transformará a formato Word,
- respetará acuerdos, tareas, votaciones y firmas,
- evitará rehacer el contenido en exportación salvo formateo.

### Decisión recomendada
La exportación debe basarse preferentemente en la `estructura_json` del acta, no solo en Markdown. Esto mejora la fiabilidad para tablas, asistentes, votaciones y firmas.

## Plantillas profesionales propuestas

### Plantilla oficial por defecto
Características:
- encabezado institucional limpio,
- título centrado,
- secciones jurídicas bien separadas,
- tabla de asistencia,
- bloque de votaciones,
- bloque de acuerdos,
- bloque de pendientes,
- firmas al final.

### Plantillas por tipo de junta
Además de la plantilla base, se pueden adaptar variantes para:
- junta ordinaria,
- junta extraordinaria,
- asamblea general,
- junta de vecinos.

### Personalización visual mínima
- tipografía profesional,
- tamaños jerarquizados,
- espaciado consistente,
- negritas para datos clave,
- tablas sobrias para impresión.

## UI/UX propuesta

### Pantalla de exportación Word
Elementos previstos:
- botón "Exportar a Word (.docx)"
- botón "Vista previa del documento"
- resumen de validación previa
- nombre sugerido de archivo
- aviso si faltan datos obligatorios

### Vista previa del documento
La app mostrará una vista previa aproximada del acta final con:
- cabecera,
- asistentes,
- acuerdos,
- votaciones,
- firmas.

### Impresión
Se mantendrá opción de impresión directa desde la app para revisión rápida o salida inmediata.

## Validación propuesta

### Validación funcional
Antes de exportar, comprobar:
- existe acta activa o final,
- existe estructura suficiente,
- hay datos mínimos de junta,
- hay asistentes o constancia expresa,
- hay firmas o bloque preparado de firma.

### Validación documental
Comprobar que el DOCX generado:
- es un ZIP válido,
- contiene `word/document.xml`,
- contiene texto esencial esperado,
- no está vacío,
- se puede descargar con MIME correcto.

## Estructura de archivos prevista

### Nuevos archivos previstos
- `gestactas/src/modules/actas/acta-docx.service.js`
- `gestactas/src/modules/actas/docx-validation.service.js`

### Archivos previsiblemente modificados
- `gestactas/src/modules/actas/actas-export.service.js`
- `gestactas/src/modules/actas/actas.service.js`
- `gestactas/src/shared/docx.js`
- `gestactas/index.html`
- `gestactas/styles.css`
- `gestactas/src/core/bootstrap.js`
- `gestactas/src/core/store.js`
- `Loren2026/gestactas/PROPUESTA.md`

## Criterio de cierre propuesto para el Bloque 6
El Bloque 6 se considerará correctamente ejecutado cuando:
- un acta generada pueda exportarse a Word,
- el documento tenga formato profesional,
- incluya asistentes, quórum, votaciones, acuerdos y firmas,
- la exportación se base en datos reales de GestActas,
- se valide la estructura del archivo,
- y el resultado quede listo para imprimir o enviar.

## Fuera de alcance de este bloque
Este bloque no debe incluir todavía:
- firma electrónica avanzada,
- envío automático por email o WhatsApp,
- registro telemático externo,
- integración con plataformas legales de terceros.

## Esperando autorización
SÍ

No se ejecutará ningún desarrollo del Bloque 6 sin autorización expresa de Lorenzo.

---

## 📌 MEJORAS PROPUESTAS POR TURÍN

He revisado la propuesta del Bloque 6 y propongo las siguientes mejoras técnicas y de UX:

### 1. **[TÉCNICA] Integración con plantillas existentes** ⭐⭐⭐⭐⭐

**Problema:** La propuesta menciona plantillas profesionales pero no explica explícitamente cómo se integrará con el módulo de plantillas del Bloque 5.

**Mejora propuesta:** Integración completa con plantillas existentes:
- Reutilizar módulo de plantillas del Bloque 5
- Crear plantillas de acta profesionales (no solo convocatoria)
- Permite personalización con colores, logos, tipografías
- Permite crear plantillas personalizadas por comunidad

**Beneficio:** Reutilización de código, plantillas más profesionales, más flexibilidad.

---

### 2. **[TÉCNICA] Estrategia de migración de datos** ⭐⭐⭐⭐⭐

**Problema:** No se especifica cómo se migrarán los datos de la estructura JSON a formato DOCX.

**Mejora propuesta:** Implementar estrategia clara de migración:
- Función `convertirJsonADocx(structuraJson)` - Transforma estructura JSON a estructura DOCX
- Función `convertirMarkdownADocx(markdown)` - Transforma Markdown a formato Word
- Soporte para ambos formatos (JSON preferido, Markdown alternativo)
- Validación de datos antes de conversión
- Reporte de errores si hay campos faltantes

**Beneficio:** Transición clara, menos errores, más robustez.

---

### 3. **[UX] Preview interactivo y editable** ⭐⭐⭐⭐⭐

**Problema:** La propuesta menciona vista previa pero no especifica si será interactiva o estática.

**Mejora propuesta:** Implementar preview interactivo y editable:
- Vista previa interactiva con navegación por secciones
- Edición manual de datos antes de exportar (opcional)
- Cambio de plantilla en tiempo real
- Ajuste de márgenes y espaciado antes de exportar
- Vista de impresión personalizable

**Beneficio:** Mayor control del usuario, menos sorpresas, mayor satisfacción.

---

### 4. **[TÉCNICA] Manejo de errores robusto** ⭐⭐⭐⭐

**Problema:** No se detallan estrategias de manejo de errores específicas para la exportación.

**Mejora propuesta:** Implementar manejo de errores robusto:
- Manejo de errores de datos faltantes con mensajes claros
- Manejo de errores de generación DOCX con fallback
- Mensajes de error específicos por tipo de problema
- Log de errores para depuración
- Opción de intentar de nuevo si falla

**Beneficio:** Menos frustración del usuario, más fácil depurar problemas.

---

### 5. **[UX] Exportación a PDF como alternativa** ⭐⭐⭐⭐

**Problema:** Solo se menciona exportación a Word, pero muchos usuarios prefieren PDF.

**Mejora propuesta:** Implementar exportación a PDF:
- Usar librería de generación PDF (ej: jsPDF, html2pdf)
- Mantener mismo formato profesional de Word
- Exportar a PDF también cuando no se pueda usar Word
- Permitir exportación a Word o PDF según preferencia del usuario

**Beneficio:** Más opciones para el usuario, mayor compatibilidad.

---

### 6. **[UX] Guía de configuración de impresión** ⭐⭐⭐⭐

**Problema:** No se menciona una guía de configuración de impresión (márgenes, papel, etc.).

**Mejora propuesta:** Implementar guía de configuración de impresión:
- Pantalla de configuración de impresión
- Presets de impresión (A4, carta, legal)
- Ajuste de márgenes (normal, estrecho, amplio)
- Configuración de encabezado/pie de página
- Vista de cómo quedará en papel antes de imprimir

**Beneficio:** Mayor calidad de impresión, menos sorpresas.

---

### 7. **[TÉCNICA] Optimización de tamaño de archivo** ⭐⭐⭐

**Problema:** No se menciona cómo se optimizará el tamaño del archivo DOCX.

**Mejora propuesta:** Implementar optimización de tamaño de archivo:
- Comprimir imágenes en el DOCX si existen
- Eliminar metadatos innecesarios
- Minimizar tamaño del ZIP DOCX
- Opción de "tamaño optimizado" vs "calidad máxima"

**Beneficio:** Archivos más pequeños, más fáciles de compartir.

---

### 8. **[UX] Compartir documento** ⭐⭐⭐⭐

**Problema:** No se menciona la posibilidad de compartir el documento generado.

**Mejora propuesta:** Implementar sistema de compartir documento:
- Botón "Compartir" que genera enlace de descarga
- Generar enlace directo para compartir
- Opción de compartir por email
- Opción de copiar enlace al portapapeles
- Copia del documento al portapapeles

**Beneficio:** Fácil compartir con propietarios, mayor utilidad.

---

### 9. **[UX] Historial de exportaciones** ⭐⭐⭐⭐

**Problema:** No se menciona un historial de documentos exportados.

**Mejora propuesta:** Implementar historial de exportaciones:
- Historial de documentos exportados
- Acceso rápido a documentos exportados anteriormente
- Búsqueda en historial
- Filtro por fecha, tipo de junta, etc.
- Opción de reexportar documentos antiguos

**Beneficio:** Reutilización de documentos, mayor comodidad.

---

### 10. **[UX] Plantillas personalizadas por usuario** ⭐⭐⭐⭐

**Problema:** No se menciona la posibilidad de que los usuarios creen sus propias plantillas.

**Mejora propuesta:** Implementar sistema de plantillas personalizadas:
- Crear plantillas personalizadas para cada comunidad
- Editor de plantillas visual (drag & drop)
- Guardar y usar plantillas personalizadas
- Exportar plantillas personalizadas
- Importar plantillas personalizadas

**Beneficio:** Mayor personalización, adaptación a necesidades específicas.

---

### 11. **[TÉCNICA] Soporte para múltiples idiomas** ⭐⭐⭐

**Problema:** No se menciona soporte para idiomas diferentes al español.

**Mejora propuesta:** Implementar soporte para múltiples idiomas:
- Traducción de plantillas a múltiples idiomas
- Soporte para idiomas de España (es-ES, es-PT, etc.)
- Soporte para otros idiomas (francés, portugués, etc.)
- Selección de idioma en la configuración

**Beneficio:** Aplicación usable en diferentes países, mayor alcance.

---

### 12. **[UX] Notificaciones de exportación completada** ⭐⭐⭐

**Problema:** No se menciona notificaciones cuando la exportación se completa.

**Mejora propuesta:** Implementar notificaciones de exportación:
- Notificación al completar la exportación exitosamente
- Notificación si hay errores en la exportación
- Opción de guardar automáticamente en carpeta descargas
- Opción de abrir directamente el archivo generado

**Beneficio:** Mayor feedback al usuario, más control.

---

### 13. **[UX] Previsualización de formato de impresión** ⭐⭐⭐⭐

**Problema:** No se menciona cómo se verá el documento en papel.

**Mejora propuesta:** Implementar previsualización de formato de impresión:
- Vista de cómo quedará en papel
- Vista de cómo quedará en pantalla
- Vista de cómo quedará en PDF
- Vista de cómo quedará en Word

**Beneficio:** Mayor claridad, menos sorpresas, mejor toma de decisiones.

---

### 14. **[TÉCNICA] Validación avanzada de plantillas** ⭐⭐⭐

**Problema:** No se menciona cómo se validará que las plantillas son correctas.

**Mejora propuesta:** Implementar validación avanzada de plantillas:
- Validar que la plantilla tiene todos los campos obligatorios
- Validar que la plantilla no tiene errores de formato
- Validar que la plantilla es compatible con el formato DOCX
- Validar que la plantilla se puede generar correctamente

**Beneficio:** Menos errores, más robustez, mejor calidad.

---

### 15. **[UX] Sistema de favoritos de plantillas** ⭐⭐⭐

**Problema:** No se menciona la posibilidad de marcar plantillas como favoritas.

**Mejora propuesta:** Implementar sistema de favoritos de plantillas:
- Marcar plantillas como favoritas
- Acceso rápido a plantillas favoritas
- Búsqueda en plantillas favoritas
- Organización por categorías

**Beneficio:** Mayor comodidad, acceso rápido a plantillas usadas frecuentemente.

---

## 📊 RESUMEN DE MEJORAS PROPUESTAS POR TURÍN

| Prioridad | Mejora | Impacto |
|-----------|--------|---------|
| ⭐⭐⭐⭐⭐ Alta | Integración con plantillas existentes | Técnico |
| ⭐⭐⭐⭐⭐ Alta | Estrategia de migración de datos | Técnico |
| ⭐⭐⭐⭐⭐ Alta | Preview interactivo y editable | UX |
| ⭐⭐⭐⭐ Alta | Manejo de errores robusto | Técnico |
| ⭐⭐⭐⭐ Alta | Exportación a PDF como alternativa | UX |
| ⭐⭐⭐⭐ Alta | Guía de configuración de impresión | UX |
| ⭐⭐⭐ Media | Optimización de tamaño de archivo | Técnico |
| ⭐⭐⭐⭐ Alta | Compartir documento | UX |
| ⭐⭐⭐⭐ Alta | Historial de exportaciones | UX |
| ⭐⭐⭐⭐ Alta | Plantillas personalizadas por usuario | UX |
| ⭐⭐⭐ Media | Soporte para múltiples idiomas | Técnico |
| ⭐⭐⭐ Alta | Notificaciones de exportación completada | UX |
| ⭐⭐⭐⭐ Alta | Previsualización de formato de impresión | UX |
| ⭐⭐⭐ Media | Validación avanzada de plantillas | Técnico |
| ⭐⭐⭐ Media | Sistema de favoritos de plantillas | UX |

**Recomendación:** Implementar las 9 mejoras de prioridad Alta para el MVP del Bloque 6. Las 6 mejoras de prioridad Media pueden considerarse para iteraciones futuras.
