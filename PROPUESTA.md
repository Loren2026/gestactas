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

\n---\n\n## ⏸️ Esperando autorizaciónutorización\n\nEl Bloque 7 está preparado y esperando autorización de Lorenzo. No se ejecutará ningún desarrollo sin autorización expresa.\n\n---