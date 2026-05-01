/**
 * GestActas - Utilidades de Validación de Comunidades y Propietarios
 * 
 * Utilidades centralizadas para validar datos de comunidades y propietarios.
 */

import { ValidationUtils } from './validacion.js';

class ValidacionComunidadPropietario {
    /**
     * Valida los datos de una comunidad completa
     */
    static validarComunidad(datos) {
        const errores = [];
        const advertencias = [];

        // Campos requeridos
        if (!datos.nombre || datos.nombre.trim() === '') {
            errores.push('El nombre de la comunidad es obligatorio');
        } else if (datos.nombre.length < 3) {
            errores.push('El nombre debe tener al menos 3 caracteres');
        } else if (datos.nombre.length > 100) {
            errores.push('El nombre no puede exceder 100 caracteres');
        }

        if (!datos.direccion || datos.direccion.trim() === '') {
            errores.push('La dirección es obligatoria');
        } else if (datos.direccion.length < 5) {
            errores.push('La dirección debe tener al menos 5 caracteres');
        } else if (datos.direccion.length > 200) {
            errores.push('La dirección no puede exceder 200 caracteres');
        }

        if (!datos.codigoPostal || datos.codigoPostal.trim() === '') {
            errores.push('El código postal es obligatorio');
        } else if (!ValidationUtils.validarCodigoPostal(datos.codigoPostal)) {
            errores.push('El código postal no es válido (formato español)');
        }

        if (!datos.ciudad || datos.ciudad.trim() === '') {
            errores.push('La ciudad es obligatoria');
        } else if (datos.ciudad.length < 2) {
            errores.push('La ciudad debe tener al menos 2 caracteres');
        } else if (datos.ciudad.length > 50) {
            errores.push('La ciudad no puede exceder 50 caracteres');
        }

        if (!datos.provincia || datos.provincia.trim() === '') {
            errores.push('La provincia es obligatoria');
        } else if (!this.provinciaValida(datos.provincia)) {
            advertencias.push('La provincia no coincide con una provincia española estándar');
        }

        // Campos opcionales con validación si se proporcionan
        if (datos.cif && datos.cif.trim() !== '') {
            if (!this.validarCIF(datos.cif)) {
                errores.push('El CIF no es válido (formato español)');
            }
        }

        if (datos.email && datos.email.trim() !== '') {
            if (!ValidationUtils.validarEmail(datos.email)) {
                errores.push('El email no es válido');
            }
        }

        if (datos.telefono && datos.telefono.trim() !== '') {
            if (!ValidationUtils.validarTelefono(datos.telefono)) {
                errores.push('El teléfono no es válido (formato español)');
            }
        }

        if (datos.numeroCatastral && datos.numeroCatastral.trim() !== '') {
            if (!this.validarNumeroCatastral(datos.numeroCatastral)) {
                errores.push('El número catastral no es válido');
            }
        }

        return {
            valida: errores.length === 0,
            errores,
            advertencias
        };
    }

    /**
     * Valida los datos de un propietario completo
     */
    static validarPropietario(datos) {
        const errores = [];
        const advertencias = [];

        // Campos requeridos
        if (!datos.nombre || datos.nombre.trim() === '') {
            errores.push('El nombre del propietario es obligatorio');
        } else if (datos.nombre.length < 2) {
            errores.push('El nombre debe tener al menos 2 caracteres');
        } else if (datos.nombre.length > 50) {
            errores.push('El nombre no puede exceder 50 caracteres');
        }

        if (!datos.apellidos || datos.apellidos.trim() === '') {
            errores.push('Los apellidos son obligatorios');
        } else if (datos.apellidos.length < 2) {
            errores.push('Los apellidos deben tener al menos 2 caracteres');
        } else if (datos.apellidos.length > 100) {
            errores.push('Los apellidos no pueden exceder 100 caracteres');
        }

        if (!datos.comunidadId) {
            errores.push('La comunidad es obligatoria');
        }

        if (!datos.direccion || datos.direccion.trim() === '') {
            errores.push('La dirección es obligatoria');
        } else if (datos.direccion.length < 5) {
            errores.push('La dirección debe tener al menos 5 caracteres');
        } else if (datos.direccion.length > 200) {
            errores.push('La dirección no puede exceder 200 caracteres');
        }

        if (!datos.codigoPostal || datos.codigoPostal.trim() === '') {
            errores.push('El código postal es obligatorio');
        } else if (!ValidationUtils.validarCodigoPostal(datos.codigoPostal)) {
            errores.push('El código postal no es válido (formato español)');
        }

        if (!datos.ciudad || datos.ciudad.trim() === '') {
            errores.push('La ciudad es obligatoria');
        } else if (datos.ciudad.length < 2) {
            errores.push('La ciudad debe tener al menos 2 caracteres');
        }

        if (!datos.coeficiente && datos.coeficiente !== 0) {
            errores.push('El coeficiente es obligatorio');
        } else if (!this.validarCoeficiente(datos.coeficiente)) {
            errores.push('El coeficiente debe estar entre 0 y 100');
        }

        if (!datos.piso || datos.piso.trim() === '') {
            errores.push('El piso es obligatorio');
        } else if (!this.validarPiso(datos.piso)) {
            errores.push('El formato del piso no es válido (ej: 1º, 2º, Bajo, Planta Baja)');
        }

        // Campos opcionales con validación si se proporcionan
        if (datos.dni && datos.dni.trim() !== '') {
            if (!ValidationUtils.validarDNI(datos.dni)) {
                errores.push('El DNI no es válido (formato español)');
            }
        }

        if (datos.email && datos.email.trim() !== '') {
            if (!ValidationUtils.validarEmail(datos.email)) {
                errores.push('El email no es válido');
            }
        }

        if (datos.telefono && datos.telefono.trim() !== '') {
            if (!ValidationUtils.validarTelefono(datos.telefono)) {
                errores.push('El teléfono no es válido (formato español)');
            }
        }

        if (datos.representante) {
            if (!datos.representanteNombre || datos.representanteNombre.trim() === '') {
                advertencias.push('El propietario es representante pero no se especifica el nombre del representado');
            }
        }

        return {
            valida: errores.length === 0,
            errores,
            advertencias
        };
    }

    /**
     * Valida un CIF español
     */
    static validarCIF(cif) {
        // Eliminar espacios y guiones
        const cifLimpio = cif.replace(/[-\s]/g, '').toUpperCase();

        // Verificar formato: letra inicial + 7 dígitos + letra de control
        const regex = /^[ABCDEFGHJKLMNPQRSUVW]\d{7}[0-9A-J]$/;
        
        if (!regex.test(cifLimpio)) {
            return false;
        }

        // Validar letra de control
        const letras = 'JABCDEFGHI';
        const numeroControl = parseInt(cifLimpio.substring(1, 8));
        const suma = this.calcularSumaCIF(numeroControl);
        
        const primerDigito = Math.floor(suma / 10);
        const segundoDigito = suma % 10;
        const digitoControl = (10 - segundoDigito) % 10;
        const letraControl = letras[digitoControl];
        
        const controlEsperado = (cifLimpio.charAt(0).match(/[ABCDEFGHJKLMNPQRSUVW]/)) ? 
            letraControl : digitoControl.toString();
        
        return controlEsperado === cifLimpio.charAt(8);
    }

    /**
     * Calcula la suma para validar CIF
     */
    static calcularSumaCIF(numero) {
        const digitos = numero.toString().split('').map(Number);
        let suma = 0;
        
        for (let i = 0; i < digitos.length; i++) {
            const digito = digitos[i];
            if (i % 2 === 0) {
                // Posiciones pares: multiplicar por 2 y sumar dígitos
                const resultado = digito * 2;
                suma += Math.floor(resultado / 10) + (resultado % 10);
            } else {
                // Posiciones impares: sumar directamente
                suma += digito;
            }
        }
        
        return suma;
    }

    /**
     * Valida el número catastral
     */
    static validarNumeroCatastral(numero) {
        // Formato: 14 dígitos (7 posiciones + 7 secciones) + letra de control
        const regex = /^\d{14}[A-Z0-9]$/i;
        
        if (!regex.test(numero)) {
            return false;
        }

        // Validación simplificada del dígito de control
        const posicion = numero.substring(0, 7);
        const seccion = numero.substring(7, 14);
        const control = numero.charAt(14);
        
        const letrasPosicion = 'BCDFGHJNPQRSTUVWXY';
        const letrasSeccion = 'BCDFGHJNPQRSTVWXYZ';
        
        // Validar primera parte (posición)
        const posicionValida = this.validarCatastralParte(posicion, letrasPosicion);
        if (!posicionValida) return false;
        
        // Validar segunda parte (sección)
        const seccionValida = this.validarCatastralParte(seccion, letrasSeccion);
        if (!seccionValida) return false;
        
        return true;
    }

    /**
     * Valida una parte del número catastral
     */
    static validarCatastralParte(parte, letras) {
        const letraControl = parte.charAt(0);
        const numero = parseInt(parte.substring(1));
        
        const letraCalculada = letras[numero % letras.length];
        return letraControl === letraCalculada;
    }

    /**
     * Valida el coeficiente (0-100)
     */
    static validarCoeficiente(coeficiente) {
        return typeof coeficiente === 'number' && 
               coeficiente >= 0 && 
               coeficiente <= 100;
    }

    /**
     * Valida el formato del piso
     */
    static validarPiso(piso) {
        // Validar formatos comunes: 1º, 2º, 3º, Bajo, Planta Baja, PB, 1ª, 2ª, etc.
        const regex = /^(\d+[ºª]?$|Bajo|Planta Baja|PB)$/i;
        return regex.test(piso.trim());
    }

    /**
     * Valida el formato de la letra
     */
    static validarLetra(letra) {
        if (!letra || letra.trim() === '') {
            return true; // La letra es opcional
        }
        
        const regex = /^[A-Z]$/i;
        return regex.test(letra.trim());
    }

    /**
     * Verifica si una provincia es válida (provincias españolas)
     */
    static provinciaValida(provincia) {
        const provincias = [
            'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz',
            'Barcelona', 'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real',
            'Córdoba', 'Cuenca', 'Gerona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva',
            'Huesca', 'Islas Baleares', 'Jaén', 'La Coruña', 'La Rioja', 'Las Palmas', 'León',
            'Lérida', 'Lugo', 'Madrid', 'Málaga', 'Murcia', 'Navarra', 'Orense', 'Palencia',
            'Las Palmas', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia',
            'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid',
            'Vizcaya', 'Zamora', 'Zaragoza'
        ];

        // Normalizar para comparación
        const provinciaNormalizada = provincia.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        return provincias.some(p => {
            const provinciaNormalizadaLista = p.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            return provinciaNormalizadaLista === provinciaNormalizada.toLowerCase();
        });
    }

    /**
     * Valida relaciones antes de eliminar una comunidad
     */
    static async validarEliminarComunidad(comunidadId, obtenerPropietariosFn) {
        const errores = [];

        try {
            const propietarios = await obtenerPropietariosFn(comunidadId);
            
            const propietariosActivos = propietarios.filter(p => p.activo);
            
            if (propietariosActivos.length > 0) {
                errores.push(`No se puede eliminar la comunidad porque tiene ${propietariosActivos.length} propietario(s) activo(s)`);
            }
        } catch (error) {
            errores.push('Error al verificar relaciones de la comunidad');
        }

        return {
            puedeEliminar: errores.length === 0,
            errores
        };
    }

    /**
     * Valida relaciones antes de eliminar un propietario
     */
    static async validarEliminarPropietario(propietarioId, obtenerJuntasFn) {
        const errores = [];

        try {
            const juntas = await obtenerJuntasFn(propietarioId);
            
            if (juntas.length > 0) {
                errores.push(`No se puede eliminar el propietario porque está asociado a ${juntas.length} junta(s)`);
            }
        } catch (error) {
            errores.push('Error al verificar relaciones del propietario');
        }

        return {
            puedeEliminar: errores.length === 0,
            errores
        };
    }

    /**
     * Valida datos de importación de propietarios desde CSV
     */
    static validarImportacionCSV(datosCSV) {
        const errores = [];
        const advertencias = [];
        const filasValidas = [];
        const filasInvalidas = [];

        if (!datosCSV || datosCSV.trim() === '') {
            errores.push('El archivo CSV está vacío');
            return { valida: false, errores, advertencias, filasValidas, filasInvalidas };
        }

        const lineas = datosCSV.split('\n');
        
        // Verificar encabezados
        const encabezados = lineas[0].split(';').map(h => h.trim().toLowerCase());
        
        const encabezadosRequeridos = ['nombre', 'apellidos', 'direccion', 'codigo postal', 'ciudad', 'coeficiente'];
        const encabezadosFaltantes = encabezadosRequeridos.filter(h => !encabezados.includes(h));
        
        if (encabezadosFaltantes.length > 0) {
            errores.push(`Faltan encabezados requeridos: ${encabezadosFaltantes.join(', ')}`);
            return { valida: false, errores, advertencias, filasValidas, filasInvalidas };
        }

        // Validar filas de datos
        for (let i = 1; i < lineas.length; i++) {
            if (lineas[i].trim() === '') continue;
            
            const campos = lineas[i].split(';').map(c => c.trim());
            
            if (campos.length !== encabezados.length) {
                advertencias.push(`Fila ${i + 1}: número de campos incorrecto`);
                filasInvalidas.push(i + 1);
                continue;
            }

            const fila = {};
            encabezados.forEach((encabezado, index) => {
                fila[encabezado] = campos[index] || '';
            });

            // Validar campos requeridos
            const validacionFila = this.validarPropietario({
                nombre: fila['nombre'] || '',
                apellidos: fila['apellidos'] || '',
                comunidadId: 1, // Se asignará después
                direccion: fila['direccion'] || '',
                codigoPostal: fila['codigo postal'] || '',
                ciudad: fila['ciudad'] || '',
                coeficiente: parseFloat(fila['coeficiente']) || 0,
                piso: fila['piso'] || '1º',
                dni: fila['dni'] || '',
                email: fila['email'] || '',
                telefono: fila['telefono'] || ''
            });

            if (validacionFila.valida) {
                filasValidas.push({ numeroFila: i + 1, datos: fila });
            } else {
                advertencias.push(`Fila ${i + 1}: ${validacionFila.errores.join(', ')}`);
                filasInvalidas.push(i + 1);
            }
        }

        return {
            valida: errores.length === 0,
            errores,
            advertencias,
            filasValidas,
            filasInvalidas,
            totalFilas: filasValidas.length + filasInvalidas.length
        };
    }

    /**
     * Genera un resumen de validación para mostrar al usuario
     */
    static generarResumenValidacion(validacion, tipo = 'comunidad') {
        let resumen = '';
        
        if (validacion.errores.length > 0) {
            resumen += `❌ Errores (${validacion.errores.length}):\n`;
            validacion.errores.forEach(error => {
                resumo += `  - ${error}\n`;
            });
            resumo += '\n';
        }
        
        if (validacion.advertencias.length > 0) {
            resumo += `⚠️ Advertencias (${validacion.advertencias.length}):\n`;
            validacion.advertencias.forEach(advertencia => {
                resumo += `  - ${advertencia}\n`;
            });
        }
        
        if (validacion.valida) {
            resumo += `✅ ${tipo === 'comunidad' ? 'Comunidad' : 'Propietario'} válido`;
        } else {
            resumo += `❌ ${tipo === 'comunidad' ? 'Comunidad' : 'Propietario'} inválido`;
        }
        
        return resumo;
    }
}

// Exportar la clase
export { ValidacionComunidadPropietario };
