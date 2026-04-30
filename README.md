# GestActas - Gestión Inteligente de Juntas

## Bloque 6 - Exportación a Word (.docx) Profesional

### 📋 Descripción

El Bloque 6 de GestActas implementa la funcionalidad de exportación de actas a formato Word (.docx) profesional, listo para imprimir y enviar a los propietarios de la comunidad.

### ✨ Características Implementadas

#### 1. **Exportación a Word Profesional**
- Generación de documentos Word (.docx) con formato jurídico
- Cabecera institucional de la comunidad
- Estructura formal con todas las secciones requeridas
- Márgenes y espaciado optimizados para impresión

#### 2. **Reutilización de Datos**
- Uso completo de datos ya capturados en GestActas
- Datos de comunidad, junta, asistentes, quórum, votaciones y acuerdos
- Integración con el acta generada en el Bloque 5

#### 3. **Validación de Documentos**
- Validación de campos obligatorios antes de exportar
- Comprobación de estructura mínima del documento
- Reporte detallado de errores y advertencias

#### 4. **Vista Previa Interactiva**
- Previsualización del documento antes de exportar
- Navegación por secciones
- Metadatos del acta visibles

#### 5. **Sistema de Compartir**
- Generación de enlaces para compartir documentos
- Copia al portapapeles
- Opción de compartir por email

#### 6. **Historial de Exportaciones**
- Registro de todas las exportaciones realizadas
- Búsqueda y filtros
- Reexportación de documentos anteriores

#### 7. **Manejo Robusto de Errores**
- Mensajes de error específicos
- Fallback en caso de fallos
- Log de errores para depuración

#### 8. **Exportación a PDF (Preparado)**
- Arquitectura lista para exportación a PDF
- Mismo formato profesional que Word
- Compatibilidad con múltiples formatos

#### 9. **Guía de Configuración de Impresión**
- Configuración de márgenes
- Presets de impresión (A4, carta, legal)
- Vista de impresión personalizable

### 📁 Estructura de Archivos

```
gestactas/
├── index.html                          # Interfaz principal
├── styles.css                          # Estilos CSS
├── README.md                           # Documentación
├── PROPUESTA.md                        # Propuesta técnica
└── src/
    ├── modules/
    │   └── actas/
    │       ├── acta-docx.service.js    # Servicio de generación DOCX
    │       ├── docx-validation.service.js  # Servicio de validación
    │       └── actas-export.service.js # Servicio de exportación
    ├── shared/
    │   └── docx.js                    # Utilidades compartidas DOCX
    └── core/
        ├── bootstrap.js                # Inicialización de la app
        └── store.js                    # Gestión de estado
```

### 🔧 Arquitectura

#### Capas del Sistema

1. **Capa de Datos**
   - Store centralizado para gestión de estado
   - Persistencia en localStorage
   - Suscripciones a cambios de estado

2. **Capa de Servicios**
   - `ActaDocxService`: Construcción de documentos Word
   - `DocxValidationService`: Validación de contenido
   - `ActasExportService`: Coordinación de exportación

3. **Capa de Utilidades**
   - Formateo de fechas, horas, monedas
   - Validación de DNI, email, código postal
   - Descarga de blobs

4. **Capa de UI**
   - Interfaz de usuario con tabs
   - Vista previa de documentos
   - Historial de exportaciones

### 🚀 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/Loren2026/gestactas.git
cd gestactas
```

2. Abrir `index.html` en un navegador moderno

### 📖 Uso

#### Exportar un Acta a Word

1. Ir a la pestaña "Exportar"
2. Seleccionar el acta a exportar
3. (Opcional) Personalizar el nombre del archivo
4. Configurar opciones de validación y descarga
5. Hacer clic en "Exportar a Word (.docx)"

#### Vista Previa

1. Ir a la pestaña "Vista previa"
2. Seleccionar el acta
3. Hacer clic en "Generar vista previa"
4. Revisar el documento antes de exportar

#### Validar un Acta

1. Ir a la pestaña "Validar"
2. Seleccionar el acta
3. Hacer clic en "Validar acta"
4. Revisar el reporte de validación

#### Compartir un Acta

1. Ir a la pestaña "Compartir"
2. Seleccionar el acta
3. Hacer clic en "Generar enlace para compartir"
4. Copiar el enlace generado

### 🧪 Pruebas

Para probar la funcionalidad:

1. Abrir el archivo `index.html` en un navegador
2. Navegar a la pestaña "Exportar"
3. Usar los datos de prueba (simulados)
4. Probar cada funcionalidad: exportar, vista previa, validar, compartir

### 📊 Estado del Bloque 6

- ✅ Exportación a Word profesional
- ✅ Validación de documentos
- ✅ Vista previa interactiva
- ✅ Sistema de compartir
- ✅ Historial de exportaciones
- ✅ Manejo robusto de errores
- ✅ Exportación a PDF (preparado)
- ✅ Guía de configuración de impresión

### 🔮 Próximos Pasos

- Integración con Claude API para generación de contenido
- Firma electrónica avanzada
- Envío automático por email
- Registro telemático externo

### 📝 Notas

- El Bloque 6 mantiene la arquitectura HTML/CSS/JS vanilla
- No introduce dependencias pesadas
- Compatible con navegadores modernos
- Diseño responsive para móviles

### 🤝 Contribuciones

Este proyecto es parte del desarrollo de GestActas para la agencia Carigan.

### 📄 Licencia

Proyecto privado para uso interno de la agencia Carigan.

---

**Desarrollado por:** Turín (Agente IA Personal de Lorenzo)
**Cliente:** Carlos · Agencia Carigan
**Fecha:** 30 de abril de 2026
**Bloque:** 6
**Estado:** ✅ Completado
