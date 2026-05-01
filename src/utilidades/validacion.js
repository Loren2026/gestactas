/**
 * GestActas - Utilidades de Validación
 * 
 * Utilidades para validar datos de entrada y de negocio.
 */

class ValidationUtils {
    /**
     * Valida un email
     */
    static validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Valida un teléfono español
     */
    static validarTelefono(telefono) {
        // Formatos: +34 123 456 789, 123 456 789, 123456789
        const regex = /^(\+34\s?)?(\d{3}\s?\d{3}\s?\d{3}|\d{9})$/;
        return regex.test(telefono);
    }

    /**
     * Valida un DNI español
     */
    static validarDNI(dni) {
        const regex = /^\d{8}[A-HJ-NP-TV-Z]$/i;
        
        if (!regex.test(dni)) {
            return false;
        }

        const letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
        const letra = dni.toUpperCase().slice(-1);
        const numero = parseInt(dni.slice(0, -1), 10);
        
        return letra === letras[numero % 23];
    }

    /**
     * Valida un NIF español
     */
    static validarNIF(nif) {
        // NIF para personas jurídicas (letra al principio)
        const regexLegal = /^[A-HJNPQRSUVW]\d{7}[0-9A-J]$/i;
        
        if (regexLegal.test(nif)) {
            return true;
        }

        // Para personas físicas, es igual que DNI
        return this.validarDNI(nif);
    }

    /**
     * Valida un código postal español
     */
    static validarCodigoPostal(codigoPostal) {
        const regex = /^(0[1-9]|[1-4][0-9]|5[0-2])\d{3}$/;
        return regex.test(codigoPostal);
    }

    /**
     * Valida un IBAN
     */
    static validarIBAN(iban) {
        // Eliminar espacios y convertir a mayúsculas
        const ibanLimpio = iban.replace(/\s/g, '').toUpperCase();
        
        // Verificar longitud mínima
        if (ibanLimpio.length < 15 || ibanLimpio.length > 34) {
            return false;
        }

        // Verificar que solo contiene letras y números
        if (!/^[A-Z0-9]+$/.test(ibanLimpio)) {
            return false;
        }

        // Mover los primeros 4 caracteres al final
        const ibanMovido = ibanLimpio.substring(4) + ibanLimpio.substring(0, 4);

        // Reemplazar letras por números
        let ibanNumerico = '';
        for (let i = 0; i < ibanMovido.length; i++) {
            const caracter = ibanMovido[i];
            if (/[A-Z]/.test(caracter)) {
                const valor = caracter.charCodeAt(0) - 55; // A=10, B=11, ..., Z=35
                ibanNumerico += valor;
            } else {
                ibanNumerico += caracter;
            }
        }

        // Calcular el módulo 97
        let resto = 0;
        for (let i = 0; i < ibanNumerico.length; i++) {
            resto = (resto * 10 + parseInt(ibanNumerico[i])) % 97;
        }

        return resto === 1;
    }

    /**
     * Valida una URL
     */
    static validarURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Valida una fecha
     */
    static validarFecha(fecha) {
        if (!fecha) return false;
        
        const fechaDate = new Date(fecha);
        return fechaDate instanceof Date && !isNaN(fechaDate);
    }

    /**
     * Valida una fecha futura
     */
    static validarFechaFutura(fecha) {
        if (!this.validarFecha(fecha)) return false;
        
        const fechaDate = new Date(fecha);
        const ahora = new Date();
        
        return fechaDate > ahora;
    }

    /**
     * Valida una fecha pasada
     */
    static validarFechaPasada(fecha) {
        if (!this.validarFecha(fecha)) return false;
        
        const fechaDate = new Date(fecha);
        const ahora = new Date();
        
        return fechaDate < ahora;
    }

    /**
     * Valida que un número esté en un rango
     */
    static validarRango(numero, min, max) {
        const num = parseFloat(numero);
        return !isNaN(num) && num >= min && num <= max;
    }

    /**
     * Valida un porcentaje (0-100)
     */
    static validarPorcentaje(porcentaje) {
        return this.validarRango(porcentaje, 0, 100);
    }

    /**
     * Valida que un campo no esté vacío
     */
    static validarNoVacio(valor) {
        if (valor === null || valor === undefined) return false;
        if (typeof valor === 'string') return valor.trim().length > 0;
        if (Array.isArray(valor)) return valor.length > 0;
        if (typeof valor === 'object') return Object.keys(valor).length > 0;
        return true;
    }

    /**
     * Valida una longitud mínima
     */
    static validarLongitudMinima(valor, minima) {
        if (!valor) return false;
        return valor.toString().length >= minima;
    }

    /**
     * Valida una longitud máxima
     */
    static validarLongitudMaxima(valor, maxima) {
        if (!valor) return true; // Aceptamos nulo/vacío
        return valor.toString().length <= maxima;
    }

    /**
     * Valida un patrón de expresión regular
     */
    static validarPatron(valor, patron) {
        if (!valor) return false;
        const regex = new RegExp(patron);
        return regex.test(valor);
    }

    /**
     * Valida un código ISBN
     */
    static validarISBN(isbn) {
        // Eliminar guiones
        const isbnLimpio = isbn.replace(/[-\s]/g, '');
        
        // ISBN-10
        if (isbnLimpio.length === 10) {
            let suma = 0;
            for (let i = 0; i < 9; i++) {
                suma += parseInt(isbnLimpio[i]) * (10 - i);
            }
            
            const digitoControl = isbnLimpio[9].toUpperCase();
            const digitoCalculado = suma % 11;
            
            if (digitoCalculado === 10) {
                return digitoControl === 'X';
            } else {
                return parseInt(digitoControl) === digitoCalculado;
            }
        }
        
        // ISBN-13
        if (isbnLimpio.length === 13) {
            let suma = 0;
            for (let i = 0; i < 13; i++) {
                const digito = parseInt(isbnLimpio[i]);
                suma += (i % 2 === 0) ? digito : digito * 3;
            }
            
            return suma % 10 === 0;
        }
        
        return false;
    }

    /**
     * Valida datos de una comunidad
     */
    static validarComunidad(comunidad) {
        const errores = [];

        if (!this.validarNoVacio(comunidad.nombre)) {
            errores.push('El nombre de la comunidad es obligatorio');
        }

        if (!this.validarNoVacio(comunidad.direccion)) {
            errores.push('La dirección es obligatoria');
        }

        if (!this.validarCodigoPostal(comunidad.codigoPostal)) {
            errores.push('El código postal no es válido');
        }

        if (comunidad.cif && !this.validarNIF(comunidad.cif)) {
            errores.push('El CIF no es válido');
        }

        if (comunidad.email && !this.validarEmail(comunidad.email)) {
            errores.push('El email no es válido');
        }

        if (comunidad.telefono && !this.validarTelefono(comunidad.telefono)) {
            errores.push('El teléfono no es válido');
        }

        return {
            valida: errores.length === 0,
            errores
        };
    }

    /**
     * Valida datos de un propietario
     */
    static validarPropietario(propietario) {
        const errores = [];

        if (!this.validarNoVacio(propietario.nombre)) {
            errores.push('El nombre del propietario es obligatorio');
        }

        if (!this.validarRango(propietario.coeficiente, 0, 100)) {
            errores.push('El coeficiente debe estar entre 0 y 100');
        }

        if (propietario.dni && !this.validarDNI(propietario.dni)) {
            errores.push('El DNI no es válido');
        }

        if (propietario.email && !this.validarEmail(propietario.email)) {
            errores.push('El email no es válido');
        }

        if (propietario.telefono && !this.validarTelefono(propietario.telefono)) {
            errores.push('El teléfono no es válido');
        }

        return {
            valida: errores.length === 0,
            errores
        };
    }

    /**
     * Valida datos de una junta
     */
    static validarJunta(junta) {
        const errores = [];

        if (!this.validarNoVacio(junta.tipo)) {
            errores.push('El tipo de junta es obligatorio');
        }

        if (!this.validarFecha(junta.fecha)) {
            errores.push('La fecha no es válida');
        }

        if (!this.validarNoVacio(junta.hora)) {
            errores.push('La hora es obligatoria');
        }

        if (!this.validarNoVacio(junta.lugar)) {
            errores.push('El lugar es obligatorio');
        }

        if (!this.validarRango(junta.quorumRequerido, 0.01, 1)) {
            errores.push('El quórum requerido debe estar entre 1% y 100%');
        }

        if (!this.validarRango(junta.coeficienteTotal, 0.01, 10000)) {
            errores.push('El coeficiente total no es válido');
        }

        if (!junta.ordenDelDia || junta.ordenDelDia.length === 0) {
            errores.push('El orden del día es obligatorio');
        }

        return {
            valida: errores.length === 0,
            errores
        };
    }

    /**
     * Valida datos de un asistente
     */
    static validarAsistente(asistente) {
        const errores = [];

        if (!this.validarNoVacio(asistente.nombre)) {
            errores.push('El nombre del asistente es obligatorio');
        }

        if (!this.validarRango(asistente.coeficiente, 0, 100)) {
            errores.push('El coeficiente debe estar entre 0 y 100');
        }

        if (!asistente.asistePresencial && !asistente.asisteTelematico) {
            errores.push('El asistente debe asistir presencialmente o telemáticamente');
        }

        return {
            valida: errores.length === 0,
            errores
        };
    }

    /**
     * Muestra errores de validación en la UI
     */
    static mostrarErroresValidacion(errores, contenedorId) {
        const contenedor = document.getElementById(contenedorId);
        
        if (!contenedor) {
            console.error(`Contenedor con ID ${contenedorId} no encontrado`);
            return;
        }

        contenedor.innerHTML = '';

        if (errores.length === 0) {
            contenedor.style.display = 'none';
            return;
        }

        contenedor.style.display = 'block';
        
        const lista = document.createElement('ul');
        lista.className = 'errores-validacion';
        
        errores.forEach(error => {
            const item = document.createElement('li');
            item.textContent = error;
            lista.appendChild(item);
        });

        contenedor.appendChild(lista);
    }

    /**
     * Limpia errores de validación de la UI
     */
    static limpiarErroresValidacion(contenedorId) {
        const contenedor = document.getElementById(contenedorId);
        
        if (contenedor) {
            contenedor.innerHTML = '';
            contenedor.style.display = 'none';
        }
    }
}

// Exportar la clase

window.ValidationUtils = ValidationUtils;
