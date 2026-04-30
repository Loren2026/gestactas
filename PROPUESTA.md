# GestActas — Propuesta técnica Bloque 5

## Paso en curso
Bloque 5 propuesto: generación automática del acta de junta con Claude API, edición posterior, versionado e integración con transcripciones.

## Estado actual
- Bloque 1 completado y mantenido como base estable.
- Bloque 2 completado: juntas, convocatoria, asistentes, quórum y documento Word de convocatoria.
- Bloque 3 completado: grabación real, gestión de audio y almacenamiento local.
- Bloque 4 completado: transcripción con Whisper y Web Speech API, persistencia local y edición de transcripciones.

## Objetivo general del Bloque 5
Implementar en GestActas la generación automática del acta de junta usando Claude API a partir de la transcripción disponible, permitiendo revisar, editar, regenerar, versionar y exportar el acta final en distintos formatos.

## Objetivos funcionales
1. Generar automáticamente un borrador de acta a partir de la transcripción.
2. Estructurar el contenido según el formato de junta esperado.
3. Permitir edición manual del acta generada.
4. Guardar versiones de borrador y versión final.
5. Exportar a PDF, Word y texto plano.
6. Mantener vínculo entre acta, junta y transcripción origen.
7. Permitir regenerar el acta cuando el resultado no sea satisfactorio.
8. Mostrar navegación rápida entre transcripción y acta.

## Alcance del Bloque 5

### 1. Generación del acta con Claude API
Se integrará Claude API como motor de generación textual para transformar una transcripción de junta en un borrador estructurado de acta.

La generación deberá apoyarse en:
- datos de la junta,
- datos de comunidad,
- asistentes,
- orden del día,
- transcripción activa,
- metadatos necesarios para estructurar el resultado.

La salida esperada no debe ser texto libre sin control, sino un acta organizada en bloques reconocibles y editables.

### 2. Edición del acta generada
El borrador generado no se considerará definitivo. El usuario podrá:
- revisar el contenido,
- corregirlo,
- completar datos que falten,
- guardar cambios,
- marcar una versión como final,
- regenerar una nueva versión sin perder la anterior.

La interfaz puede apoyarse inicialmente en un editor tipo textarea enriquecido o Markdown estructurado, sin necesidad de incorporar todavía un editor complejo pesado.

### 3. Estructura del acta
La propuesta debe producir actas con esta estructura mínima:
- cabecera con datos de la junta,
- identificación de comunidad,
- asistencia,
- orden del día,
- desarrollo resumido por puntos,
- acuerdos adoptados,
- pendientes y responsables,
- cierre o próxima convocatoria si aplica.

### 4. Exportación del acta
Se preparará la arquitectura para exportar el acta a:
- PDF,
- Word (.docx),
- texto plano,
- impresión directa desde la app.

La exportación puede apoyarse en una representación intermedia común para no duplicar lógica por formato.

### 5. Historial de versiones
Cada regeneración o guardado relevante podrá crear una nueva versión. El usuario deberá poder:
- listar versiones,
- abrir una versión previa,
- comparar versiones de forma básica,
- recuperar una versión anterior como versión activa.

### 6. Integración con la transcripción
Cada acta deberá quedar vinculada a:
- junta,
- transcripción origen,
- versión concreta de la transcripción usada,
- método de generación.

Además, la interfaz debe permitir consultar la transcripción junto al acta para facilitar revisión y corrección.

## Arquitectura propuesta

### Principio general
Se mantendrá la arquitectura actual en HTML/CSS/JS vanilla, conservando separación por módulos y preparando el terreno para futura migración a React PWA.

### Capas previstas
1. **Modelo de acta**
   - definición de entidad principal
   - definición opcional de versiones

2. **Repositorio de actas**
   - persistencia en IndexedDB
   - consultas por junta y transcripción

3. **Servicio de actas**
   - CRUD lógico
   - gestión de versiones
   - selección de versión activa
   - preparación de exportaciones

4. **Servicio Claude API**
   - construcción de prompt
   - envío de contexto
   - recepción y normalización del resultado

5. **UI de actas**
   - generación
   - edición
   - historial
   - comparación
   - exportación

6. **Capa de exportación**
   - transformador a PDF
   - transformador a DOCX
   - transformador a TXT
   - impresión

## Modelo de datos propuesto

### Entidad `acta`
Campos recomendados:
- `id`
- `junta_id`
- `transcripcion_id`
- `version_activa_id`
- `estado` (`borrador` | `final`)
- `titulo`
- `resumen_corto`
- `created_at`
- `updated_at`
- `sync_status`

### Entidad `acta_version`
Recomendación importante: separar la cabecera del acta de sus versiones.

Campos recomendados:
- `id`
- `acta_id`
- `junta_id`
- `transcripcion_id`
- `numero_version`
- `origen` (`claude_api` | `manual` | `regenerada`)
- `es_version_final` (boolean)
- `prompt_utilizado`
- `modelo_utilizado`
- `contenido_markdown`
- `contenido_texto_plano`
- `estructura_json`
- `cabecera_junta_snapshot`
- `asistentes_snapshot`
- `orden_dia_snapshot`
- `coste_estimado`
- `error_codigo`
- `error_mensaje`
- `created_at`
- `updated_at`

### Decisión recomendada
Separar `acta` y `acta_version` es mejor que sobrescribir siempre el mismo documento. Permite regenerar sin perder trazabilidad y encaja bien con la necesidad real de borrador frente a final.

## Servicios propuestos

### `actas.repository.js`
Responsabilidad:
- guardar acta,
- guardar versiones,
- listar por junta,
- obtener versión activa,
- recuperar versiones anteriores,
- actualizar versión activa,
- marcar final.

### `actas.service.js`
Responsabilidad:
- crear estructura de acta,
- coordinar generación,
- gestionar borradores y finales,
- crear nuevas versiones,
- recuperar histórico,
- preparar datos para exportación.

### `claude.service.js`
Responsabilidad:
- construir prompt,
- enviar contexto a Claude API,
- recibir respuesta,
- normalizar salida.

### `actas-export.service.js`
Responsabilidad:
- convertir acta a PDF,
- convertir acta a DOCX,
- convertir acta a TXT,
- exponer impresión.

## Propuesta de prompt y generación

### Entrada mínima a Claude
- nombre de comunidad,
- fecha, hora y lugar,
- listado de asistentes,
- presidente y secretario,
- orden del día,
- transcripción activa,
- instrucciones de estilo jurídico y claridad.

### Salida recomendada
Claude no debería devolver solo prosa. Conviene pedir una salida estructurada, por ejemplo:
- JSON + bloque Markdown, o
- Markdown con secciones marcadas de forma estable.

### Recomendación técnica
La mejor opción para robustez es pedir:
1. una estructura JSON con bloques del acta,
2. un texto formateado listo para edición.

Así se facilita:
- edición posterior,
- exportación,
- validación,
- comparación entre versiones.

## UI/UX propuesta

### Pantallas o áreas funcionales
1. **Pantalla Generar Acta**
   - selección de transcripción origen,
   - vista previa del contexto,
   - botón generar con Claude,
   - coste estimado.

2. **Pantalla Editor de Acta**
   - edición del contenido,
   - guardado manual,
   - marcar como final,
   - regenerar.

3. **Panel lateral o bloque de referencia**
   - transcripción origen visible,
   - navegación rápida entre transcripción y acta.

4. **Historial de versiones**
   - lista de versiones,
   - origen de cada versión,
   - fecha de generación,
   - opción recuperar o comparar.

### Comportamientos UX importantes
- si no hay transcripción, no debe permitirse generar acta;
- la versión generada debe quedar marcada inicialmente como borrador;
- debe existir confirmación antes de sobrescribir la versión activa;
- la regeneración debe crear nueva versión, no destruir la previa;
- la vista de exportación debe ser coherente con la vista final del documento.

## Exportación propuesta

### PDF
Objetivo:
- documento presentable,
- fácil envío,
- buena impresión.

### DOCX
Objetivo:
- edición externa posterior,
- compatibilidad con Word.

### TXT
Objetivo:
- respaldo simple,
- portabilidad,
- uso técnico o archivo rápido.

### Impresión
Objetivo:
- salida directa desde navegador,
- soporte para vista tipo documento.

### Recomendación técnica
Conviene generar una representación intermedia del acta y desde ella producir PDF, DOCX y TXT. Así se evita mantener tres lógicas distintas de composición.

## Historial y comparación

### Funciones mínimas
- listar versiones por orden cronológico,
- identificar origen de versión,
- abrir cualquier versión,
- restaurar una versión previa,
- comparación básica texto a texto.

### Comparación recomendada
En una primera fase no hace falta un diff visual complejo. Basta con:
- selector de dos versiones,
- vista lado a lado,
- resaltado simple si resulta viable.

## Integración con Bloque 4
La relación entre transcripción y acta debe ser directa.

Cada acta generada debe saber:
- qué transcripción la originó,
- qué versión del texto se usó,
- qué método de transcripción estaba detrás.

La navegación esperada:
- desde transcripción → generar acta,
- desde acta → abrir transcripción origen.

## Gestión de errores
Se contemplarán al menos estos casos:
- no hay transcripción disponible,
- Claude API no responde,
- clave API ausente o inválida,
- salida incompleta o mal formada,
- error al guardar versión,
- fallo en exportación,
- fallo en impresión.

La UI deberá ofrecer mensajes directos y reutilizables, con opción de reintento cuando tenga sentido.

## Estructura de archivos prevista
- `gestactas/src/models/acta.js`
- `gestactas/src/models/acta-version.js`
- `gestactas/src/modules/actas/actas.repository.js`
- `gestactas/src/modules/actas/actas.service.js`
- `gestactas/src/modules/actas/actas.ui.js`
- `gestactas/src/modules/actas/claude.service.js`
- `gestactas/src/modules/actas/actas-export.service.js`
- `gestactas/src/core/bootstrap.js`
- `gestactas/src/core/store.js`
- `gestactas/src/db/schema.js`
- `gestactas/index.html`
- `gestactas/styles.css`

## Criterio de cierre propuesto para el Bloque 5
El Bloque 5 se considerará correctamente ejecutado cuando:
- una transcripción válida pueda generar un borrador de acta con Claude,
- el usuario pueda editar el resultado,
- el borrador se pueda guardar como versión,
- exista una versión final distinguible,
- el historial de versiones sea recuperable,
- el acta se pueda exportar a PDF, DOCX y TXT,
- y la app permita navegar entre transcripción y acta.

## Fuera de alcance de este bloque
Este bloque no debe incluir todavía:
- firma digital avanzada,
- envío automático a propietarios,
- integración con correo,
- automatización legal avanzada,
- análisis semántico profundo de conflictos o votaciones complejas.

## Esperando autorización
SÍ

No se ejecutará ningún desarrollo del Bloque 5 sin autorización expresa de Lorenzo.


---

## 📌 MEJORAS PROPUESTAS POR TURÍN

A continuación presento las mejoras técnicas y de experiencia de usuario que recomiendo para el Bloque 5:

### 1. **[TÉCNICA] Prompt estructurado con ejemplos para Claude** ⭐⭐⭐⭐⭐
**Problema:** La propuesta menciona pedir JSON + Markdown a Claude, pero sin ejemplos concretos puede generar formatos inconsistentes.

**Mejora propuesta:** Construir un prompt que incluya:
- Ejemplo de estructura JSON esperado
- Ejemplo de formato Markdown deseado
- Reglas explícitas de formato jurídico
- Plantilla de salida predefinida

**Beneficio:** Mayor consistencia en la generación y menos necesidad de edición posterior.

**Implementación:** Crear un archivo `prompt-templates.js` con plantillas de prompt reutilizables y parametrizables.

---

### 2. **[TÉCNICA] Cálculo de coste estimado de Claude API** ⭐⭐⭐⭐⭐
**Problema:** La propuesta menciona "coste estimado" en el modelo pero no especifica cómo calcularlo. El usuario debería saber cuánto costará generar el acta.

**Mejora propuesta:** Implementar cálculo basado en:
- Longitud de la transcripción (caracteres/tokens)
- Modelo de Claude a usar (Haiku, Sonnet, Opus)
- Tasa actual de tokens/precio
- Mostrar coste estimado ANTES de generar

**Beneficio:** Transparencia de costes para el usuario y control del gasto.

**Implementación:** Función en `claude.service.js` que calcule `estimatedCost = (inputTokens + outputTokens) * pricePerMillionTokens`.

---

### 3. **[UX] Editor Markdown con vista previa en tiempo real** ⭐⭐⭐⭐
**Problema:** La propuesta sugiere un editor tipo textarea simple, que no permite ver cómo quedará el formato final.

**Mejora propuesta:** Implementar editor Markdown con:
- Panel de edición a la izquierda
- Vista previa en tiempo real a la derecha (split screen en móvil: pestañas)
- Sintaxis coloreada básica
- Botones de formato rápido (negrita, cursiva, lista, encabezado)

**Beneficio:** El usuario ve cómo quedará el acta mientras la edita, reduciendo errores de formato.

**Implementación:** Usar una librería ligera como `simplemde` o `marked` con `highlight.js`.

---

### 4. **[TÉCNICA] Autoguardado mientras se edita** ⭐⭐⭐⭐
**Problema:** Si el usuario cierra el navegador accidentalmente, pierde todos los cambios del acta que estaba editando.

**Mejora propuesta:** Implementar autoguardado:
- Guardar automáticamente cada 30 segundos mientras se edita
- Guardar al perder el foco del editor
- Recuperar borrador si hay uno guardado
- Indicador visual de "Guardado" o "Guardando..."

**Beneficio:** Protección contra pérdida de datos y mejor UX.

---

### 5. **[TÉCNICA] Validación de estructura del acta generada** ⭐⭐⭐⭐
**Problema:** Claude podría generar un acta incompleta sin alguna sección requerida (ej: sin acuerdos o sin pendientes).

**Mejora propuesta:** Validar que el JSON generado incluya:
- Todas las secciones requeridas (cabecera, asistencia, orden del día, desarrollo, acuerdos, pendientes, cierre)
- Campos obligatorios no vacíos
- Formato de fechas correcto

**Beneficio:** Detección temprana de errores y posibilidad de regenerar automáticamente si falla la validación.

---

### 6. **[TÉCNICA] Manejo de límites de tokens para transcripciones largas** ⭐⭐⭐⭐
**Problema:** Las transcripciones de juntas largas (1-2 horas) pueden superar el límite de entrada de Claude API.

**Mejora propuesta:** Implementar resumen inteligente:
- Si la transcripción supera el límite de tokens, generar un resumen primero
- Enviar el resumen a Claude en lugar de la transcripción completa
- Opcionalmente: dividir en partes y procesar por secciones

**Beneficio:** Poder generar actas de juntas largas sin errores de API.

---

### 7. **[UX] Templates de actas predefinidos** ⭐⭐⭐⭐
**Problema:** No todas las juntas son iguales. Algunas requieren formatos especiales (ej: juntas extraordinarias, asambleas generales, etc.).

**Mejora propuesta:** Crear plantillas de actas:
- Junta ordinaria (plantilla por defecto)
- Junta extraordinaria
- Asamblea general
- Junta de vecinos

**Beneficio:** Menos edición posterior y formato más adecuado para cada tipo de junta.

---

### 8. **[UX] Extracción automática de tareas pendientes** ⭐⭐⭐⭐
**Problema:** La propuesta menciona "pendientes y responsables" como parte del acta, pero no cómo extraerlos de la transcripción.

**Mejora propuesta:** Pedir a Claude que:
- Identifique explícitamente tareas pendientes
- Asigne responsables cuando sea posible
- Establezca fechas límite si se mencionan
- Las presente en una tabla separada en el acta

**Beneficio:** Mayor utilidad del acta y seguimiento más fácil de acciones.

---

### 9. **[UX] Diferentes modos de edición** ⭐⭐⭐
**Problema:** Algunos usuarios prefieren editar texto plano, otros prefieren Markdown con formato.

**Mejora propuesta:** Ofrecer dos modos:
- Modo Simple: edición de texto plano sin formato
- Modo Avanzado: edición Markdown con vista previa

**Beneficio:** Flexibilidad para diferentes tipos de usuarios.

---

### 10. **[TÉCNICA] Comparación de versiones con diff simple** ⭐⭐⭐
**Problema:** La propuesta menciona comparación básica lado a lado, pero sin resaltar los cambios es difícil ver qué cambió entre versiones.

**Mejora propuesta:** Implementar diff simple con:
- Resaltado en verde para texto añadido
- Resaltado en rojo para texto eliminado
- Vista línea por línea de las diferencias

**Beneficio:** Comparación de versiones más clara y útil.

**Implementación:** Usar una librería ligera como `diff-match-patch` o `jsdiff`.

---

### 11. **[UX] Resumen ejecutivo automático** ⭐⭐⭐
**Problema:** Para lectura rápida, un acta completa puede ser demasiado larga. Un resumen ejecutivo sería muy útil.

**Mejora propuesta:** Pedir a Claude que genere un resumen ejecutivo al inicio del acta:
- Puntos clave de la reunión
- Decisiones más importantes
- Tareas más críticas
- Máximo 200-300 palabras

**Beneficio:** Lectura rápida del contenido más importante.

---

### 12. **[UX] Exportación con marca de agua opcional** ⭐⭐⭐
**Problema:** Para envío a terceros, puede ser útil añadir una marca de agua que identifique el documento como oficial.

**Mejora propuesta:** Añadir opción en exportación PDF:
- Sin marca de agua (por defecto)
- Con marca de agua (texto configurable, ej: "BORRADOR - NO OFICIAL")
- Posición de la marca de agua (centro, esquina)

**Beneficio:** Mayor control sobre la apariencia del documento final.

---

### 13. **[TÉCNICA] Cache de prompts y respuestas** ⭐⭐⭐
**Problema:** Si el usuario regenera el acta varias veces con los mismos parámetros, se está gastando tokens innecesariamente.

**Mejora propuesta:** Implementar cache local:
- Guardar el prompt exacto enviado
- Guardar la respuesta recibida
- Si se intenta regenerar con el mismo prompt, ofrecer usar la cache

**Beneficio:** Ahorro de tokens y tiempo, con opción de forzar regeneración.

---

### 14. **[UX] Indicador de progreso durante generación** ⭐⭐⭐
**Problema:** Para transcripciones largas, la generación del acta puede tardar varios segundos. Sin feedback, el usuario puede pensar que la app se colgó.

**Mejora propuesta:** Mostrar progreso claro:
- "Enviando datos a Claude..."
- "Generando acta..."
- "Procesando respuesta..."
- Barra de progreso o spinner animado
- Tiempo estimado restante (si es posible)

**Beneficio:** Mejor percepción de la app y menor ansiedad del usuario.

---

### 15. **[TÉCNICA] Manejo de errores de Claude API con reintentos** ⭐⭐⭐
**Problema:** La propuesta menciona errores de Claude API pero no cómo manejarlos cuando son temporales (ej: rate limits, timeouts).

**Mejora propuesta:** Implementar reintentos automáticos con backoff exponencial:
- Primer intento: inmediato
- Segundo intento: 2 segundos después
- Tercer intento: 5 segundos después
- Máximo 3 intentos
- Mostrar mensaje al usuario si fallan todos

**Beneficio:** Mayor robustez y menor frustración por errores temporales.

---

## 📊 RESUMEN DE MEJORAS PROPUESTAS POR TURÍN

| Prioridad | Mejora | Impacto |
|-----------|--------|---------|
| ⭐⭐⭐⭐⭐ Alta | Prompt estructurado con ejemplos | Técnico ⭐⭐⭐⭐⭐ |
| ⭐⭐⭐⭐⭐ Alta | Cálculo de coste estimado | Técnico ⭐⭐⭐⭐⭐ |
| ⭐⭐⭐⭐ Alta | Editor Markdown con vista previa | UX ⭐⭐⭐⭐ |
| ⭐⭐⭐⭐ Alta | Autoguardado mientras se edita | UX/Técnico ⭐⭐⭐⭐ |
| ⭐⭐⭐⭐ Alta | Validación de estructura del acta | Técnico ⭐⭐⭐⭐ |
| ⭐⭐⭐⭐ Alta | Manejo de límites de tokens | Técnico ⭐⭐⭐⭐ |
| ⭐⭐⭐⭐ Alta | Templates de actas predefinidos | UX ⭐⭐⭐⭐ |
| ⭐⭐⭐⭐ Alta | Extracción automática de tareas pendientes | UX ⭐⭐⭐⭐ |
| ⭐⭐⭐ Media | Diferentes modos de edición | UX ⭐⭐⭐ |
| ⭐⭐⭐ Media | Comparación de versiones con diff | Técnico ⭐⭐⭐ |
| ⭐⭐⭐ Media | Resumen ejecutivo automático | UX ⭐⭐⭐ |
| ⭐⭐⭐ Media | Exportación con marca de agua | UX ⭐⭐⭐ |
| ⭐⭐⭐ Media | Cache de prompts y respuestas | Técnico ⭐⭐⭐ |
| ⭐⭐⭐ Media | Indicador de progreso durante generación | UX ⭐⭐⭐ |
| ⭐⭐⭐ Media | Manejo de errores con reintentos | Técnico ⭐⭐⭐ |

**Recomendación:** Implementar las 8 mejoras de prioridad Alta (⭐⭐⭐⭐⭐) para el MVP del Bloque 5. Las mejoras de prioridad Media (⭐⭐⭐) pueden considerarse para iteraciones futuras.

---

**Nota:** Estas mejoras propuestas por Turín están sujetas a aprobación de Lorenzo antes de ser implementadas.
