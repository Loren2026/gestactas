/**
 * GestActas - Utilidades de Feedback
 * 
 * Utilidades para mostrar feedback al usuario (notificaciones, confirmaciones, etc.).
 */

class FeedbackUtils {
    /**
     * Muestra una notificación toast
     */
    static mostrarNotificacion(mensaje, tipo = 'info', duracion = 3000) {
        const notificacion = document.createElement('div');
        notificacion.className = `toast toast-${tipo}`;
        notificacion.textContent = mensaje;
        
        document.body.appendChild(notificacion);
        
        // Animación de entrada
        requestAnimationFrame(() => {
            notificacion.classList.add('toast-visible');
        });

        // Auto-eliminar después de la duración
        setTimeout(() => {
            notificacion.classList.remove('toast-visible');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, duracion);
    }

    /**
     * Muestra una notificación de éxito
     */
    static mostrarExito(mensaje, duracion = 3000) {
        this.mostrarNotificacion(mensaje, 'success', duracion);
    }

    /**
     * Muestra una notificación de error
     */
    static mostrarError(mensaje, duracion = 5000) {
        this.mostrarNotificacion(mensaje, 'error', duracion);
    }

    /**
     * Muestra una notificación de advertencia
     */
    static mostrarAdvertencia(mensaje, duracion = 4000) {
        this.mostrarNotificacion(mensaje, 'warning', duracion);
    }

    /**
     * Muestra una notificación de información
     */
    static mostrarInformacion(mensaje, duracion = 3000) {
        this.mostrarNotificacion(mensaje, 'info', duracion);
    }

    /**
     * Muestra un diálogo de confirmación
     */
    static mostrarConfirmacion(mensaje, opciones = {}) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            
            const dialogo = document.createElement('div');
            dialogo.className = 'dialogo dialogo-confirmacion';
            
            const titulo = document.createElement('h3');
            titulo.textContent = opciones.titulo || 'Confirmación';
            
            const mensajeEl = document.createElement('p');
            mensajeEl.textContent = mensaje;
            
            const botones = document.createElement('div');
            botones.className = 'dialogo-botones';
            
            const botonCancelar = document.createElement('button');
            botonCancelar.textContent = opciones.textoCancelar || 'Cancelar';
            botonCancelar.className = 'boton boton-secundario';
            botonCancelar.onclick = () => {
                document.body.removeChild(overlay);
                resolve(false);
            };
            
            const botonConfirmar = document.createElement('button');
            botonConfirmar.textContent = opciones.textoConfirmar || 'Confirmar';
            botonConfirmar.className = 'boton boton-primario';
            botonConfirmar.onclick = () => {
                document.body.removeChild(overlay);
                resolve(true);
            };
            
            botones.appendChild(botonCancelar);
            botones.appendChild(botonConfirmar);
            
            dialogo.appendChild(titulo);
            dialogo.appendChild(mensajeEl);
            dialogo.appendChild(botones);
            
            overlay.appendChild(dialogo);
            document.body.appendChild(overlay);
            
            // Cerrar con Escape
            const manejadorEscape = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(overlay);
                    document.removeEventListener('keydown', manejadorEscape);
                    resolve(false);
                }
            };
            document.addEventListener('keydown', manejadorEscape);
        });
    }

    /**
     * Muestra un diálogo de alerta
     */
    static mostrarAlerta(mensaje, opciones = {}) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            
            const dialogo = document.createElement('div');
            dialogo.className = `dialogo dialogo-${opciones.tipo || 'info'}`;
            
            const titulo = document.createElement('h3');
            titulo.textContent = opciones.titulo || 'Alerta';
            
            const mensajeEl = document.createElement('p');
            mensajeEl.textContent = mensaje;
            
            const boton = document.createElement('button');
            boton.textContent = opciones.textoBoton || 'Aceptar';
            boton.className = 'boton boton-primario';
            boton.onclick = () => {
                document.body.removeChild(overlay);
                resolve();
            };
            
            dialogo.appendChild(titulo);
            dialogo.appendChild(mensajeEl);
            dialogo.appendChild(boton);
            
            overlay.appendChild(dialogo);
            document.body.appendChild(overlay);
            
            // Cerrar con Escape o Enter
            const manejadorTeclado = (e) => {
                if (e.key === 'Escape' || e.key === 'Enter') {
                    document.body.removeChild(overlay);
                    document.removeEventListener('keydown', manejadorTeclado);
                    resolve();
                }
            };
            document.addEventListener('keydown', manejadorTeclado);
        });
    }

    /**
     * Muestra un diálogo de carga
     */
    static mostrarCarga(mensaje, indeterminado = false) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.id = 'overlay-carga';
        
        const dialogo = document.createElement('div');
        dialogo.className = 'dialogo dialogo-carga';
        
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        
        const mensajeEl = document.createElement('p');
        mensajeEl.textContent = mensaje;
        
        dialogo.appendChild(spinner);
        dialogo.appendChild(mensajeEl);
        
        overlay.appendChild(dialogo);
        document.body.appendChild(overlay);
        
        return {
            overlay,
            actualizarMensaje: (nuevoMensaje) => {
                mensajeEl.textContent = nuevoMensaje;
            },
            ocultar: () => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }
        };
    }

    /**
     * Muestra un diálogo de progreso
     */
    static mostrarProgreso(mensaje, progreso = 0) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.id = 'overlay-progreso';
        
        const dialogo = document.createElement('div');
        dialogo.className = 'dialogo dialogo-progreso';
        
        const mensajeEl = document.createElement('p');
        mensajeEl.textContent = mensaje;
        
        const barraProgreso = document.createElement('div');
        barraProgreso.className = 'barra-progreso';
        
        const progresoBarra = document.createElement('div');
        progresoBarra.className = 'progreso-barra';
        progresoBarra.style.width = `${progreso}%`;
        
        const porcentaje = document.createElement('span');
        porcentaje.className = 'porcentaje';
        porcentaje.textContent = `${progreso}%`;
        
        barraProgreso.appendChild(progresoBarra);
        dialogo.appendChild(mensajeEl);
        dialogo.appendChild(barraProgreso);
        dialogo.appendChild(porcentaje);
        
        overlay.appendChild(dialogo);
        document.body.appendChild(overlay);
        
        return {
            overlay,
            actualizarProgreso: (nuevoProgreso, nuevoMensaje) => {
                if (nuevoMensaje) {
                    mensajeEl.textContent = nuevoMensaje;
                }
                progresoBarra.style.width = `${nuevoProgreso}%`;
                porcentaje.textContent = `${nuevoProgreso}%`;
            },
            ocultar: () => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }
        };
    }

    /**
     * Muestra un modal
     */
    static mostrarModal(contenido, opciones = {}) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'overlay';
            
            const modal = document.createElement('div');
            modal.className = 'modal';
            
            if (opciones.titulo) {
                const header = document.createElement('div');
                header.className = 'modal-header';
                
                const titulo = document.createElement('h3');
                titulo.textContent = opciones.titulo;
                
                const botonCerrar = document.createElement('button');
                botonCerrar.className = 'boton-cerrar';
                botonCerrar.innerHTML = '&times;';
                botonCerrar.onclick = () => {
                    document.body.removeChild(overlay);
                    resolve(null);
                };
                
                header.appendChild(titulo);
                header.appendChild(botonCerrar);
                modal.appendChild(header);
            }
            
            const body = document.createElement('div');
            body.className = 'modal-body';
            body.appendChild(contenido);
            modal.appendChild(body);
            
            if (opciones.botones) {
                const footer = document.createElement('div');
                footer.className = 'modal-footer';
                
                opciones.botones.forEach(boton => {
                    const botonEl = document.createElement('button');
                    botonEl.textContent = boton.texto;
                    botonEl.className = `boton ${boton.clase || 'boton-secundario'}`;
                    botonEl.onclick = () => {
                        document.body.removeChild(overlay);
                        resolve(boton.valor || boton.texto);
                    };
                    footer.appendChild(botonEl);
                });
                
                modal.appendChild(footer);
            }
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            // Cerrar con Escape
            const manejadorEscape = (e) => {
                if (e.key === 'Escape') {
                    document.body.removeChild(overlay);
                    document.removeEventListener('keydown', manejadorEscape);
                    resolve(null);
                }
            };
            document.addEventListener('keydown', manejadorEscape);
            
            // Cerrar al hacer clic fuera
            overlay.onclick = (e) => {
                if (e.target === overlay && opciones.cerrarAlClicExterior !== false) {
                    document.body.removeChild(overlay);
                    document.removeEventListener('keydown', manejadorEscape);
                    resolve(null);
                }
            };
        });
    }

    /**
     * Muestra un tooltip
     */
    static mostrarTooltip(elemento, texto, posicion = 'top') {
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${posicion}`;
        tooltip.textContent = texto;
        
        document.body.appendChild(tooltip);
        
        const rect = elemento.getBoundingClientRect();
        
        switch (posicion) {
            case 'top':
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
                break;
            case 'bottom':
                tooltip.style.left = `${rect.left + rect.width / 2}px`;
                tooltip.style.top = `${rect.bottom + 10}px`;
                break;
            case 'left':
                tooltip.style.left = `${rect.left - tooltip.offsetWidth - 10}px`;
                tooltip.style.top = `${rect.top + rect.height / 2}px`;
                break;
            case 'right':
                tooltip.style.left = `${rect.right + 10}px`;
                tooltip.style.top = `${rect.top + rect.height / 2}px`;
                break;
        }
        
        const ocultarTooltip = () => {
            if (document.body.contains(tooltip)) {
                document.body.removeChild(tooltip);
            }
            elemento.removeEventListener('mouseleave', ocultarTooltip);
        };
        
        elemento.addEventListener('mouseleave', ocultarTooltip);
    }

    /**
     * Resalta un campo con error
     */
    static resaltarError(elemento, mensaje) {
        elemento.classList.add('error');
        
        if (mensaje) {
            const mensajeError = document.createElement('div');
            mensajeError.className = 'mensaje-error';
            mensajeError.textContent = mensaje;
            
            elemento.parentNode.appendChild(mensajeError);
        }
    }

    /**
     * Limpia el resaltado de error
     */
    static limpiarError(elemento) {
        elemento.classList.remove('error');
        
        const mensajeError = elemento.parentNode.querySelector('.mensaje-error');
        if (mensajeError) {
            elemento.parentNode.removeChild(mensajeError);
        }
    }

    /**
     * Muestra un indicador de carga en un botón
     */
    static mostrarCargaEnBoton(boton, textoOriginal) {
        boton.disabled = true;
        boton.dataset.textoOriginal = textoOriginal || boton.textContent;
        boton.innerHTML = '<span class="spinner-small"></span> Cargando...';
    }

    /**
     * Oculta el indicador de carga en un botón
     */
    static ocultarCargaEnBoton(boton) {
        boton.disabled = false;
        if (boton.dataset.textoOriginal) {
            boton.textContent = boton.dataset.textoOriginal;
            delete boton.dataset.textoOriginal;
        }
    }
}

// Exportar la clase
export { FeedbackUtils };
