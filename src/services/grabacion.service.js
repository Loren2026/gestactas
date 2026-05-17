/**
 * GestActas - Servicio de Grabación
 * 
 * Servicio para la grabación de audio durante las juntas usando la API MediaRecorder.
 */

const indexedDBServiceGlobal = window.indexedDBService;

class GrabacionService {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.stream = null;
        this.isRecording = false;
        this.visualizadorCanvas = null;
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.animationId = null;
    }

    /**
     * Inicializa el servicio de grabación
     */
    async init() {
        // Inicializar IndexedDB si no está inicializado
        await indexedDBServiceGlobal.init();
    }

    /**
     * Solicita acceso al micrófono
     */
    async solicitarAccesoMicrofono() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            return this.stream;
        } catch (error) {
            console.error('Error al solicitar acceso al micrófono:', error);
            throw new Error('No se pudo acceder al micrófono. Verifica los permisos.');
        }
    }

    /**
     * Inicia la grabación
     */
    async iniciarGrabacion(juntaId, opciones = {}) {
        try {
            if (this.isRecording) {
                throw new Error('Ya hay una grabación en curso');
            }

            // Solicitar acceso al micrófono si no tenemos el stream
            if (!this.stream) {
                await this.solicitarAccesoMicrofono();
            }

            // Configurar MediaRecorder
            const mimeType = opciones.mimeType || 'audio/webm;codecs=opus';
            const opcionesGrabacion = {
                mimeType: mimeType,
                audioBitsPerSecond: opciones.audioBitsPerSecond || 128000
            };

            // Verificar si el formato es soportado
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                console.warn(`El formato ${mimeType} no es soportado, usando el formato por defecto`);
                delete opcionesGrabacion.mimeType;
            }

            this.mediaRecorder = new MediaRecorder(this.stream, opcionesGrabacion);
            this.audioChunks = [];

            // Evento cuando hay datos disponibles
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            // Evento cuando la grabación se detiene
            this.mediaRecorder.onstop = async () => {
                await this.guardarGrabacion(juntaId);
            };

            // Iniciar grabación
            this.mediaRecorder.start(opciones.intervalo || 1000); // 1 segundo por defecto
            this.isRecording = true;

            console.log('Grabación iniciada');
            return { estado: 'grabando', tiempoInicio: new Date() };
        } catch (error) {
            console.error('Error al iniciar grabación:', error);
            throw error;
        }
    }

    /**
     * Pausa la grabación
     */
    pausarGrabacion() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.pause();
            console.log('Grabación pausada');
            return { estado: 'pausado' };
        }
        throw new Error('No hay grabación en curso');
    }

    /**
     * Reanuda la grabación
     */
    reanudarGrabacion() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.resume();
            console.log('Grabación reanudada');
            return { estado: 'grabando' };
        }
        throw new Error('No hay grabación en curso');
    }

    /**
     * Detiene la grabación
     */
    async detenerGrabacion() {
        if (!this.mediaRecorder || !this.isRecording) {
            throw new Error('No hay grabación en curso');
        }

        return new Promise((resolve) => {
            this.mediaRecorder.onstop = async () => {
                const grabacion = await this.guardarGrabacion();
                this.isRecording = false;
                console.log('Grabación detenida');
                resolve(grabacion);
            };

            this.mediaRecorder.stop();
        });
    }

    /**
     * Guarda la grabación en IndexedDB
     */
    async guardarGrabacion(juntaId) {
        try {
            // Crear blob de audio
            const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
            const audioBlob = new Blob(this.audioChunks, { type: mimeType });

            // Convertir blob a base64 para almacenar
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            
            return new Promise((resolve, reject) => {
                reader.onload = async () => {
                    const audioData = reader.result;
                    const duracion = this.calcularDuracion();
                    const fechaIso = new Date().toISOString();
                    const formato = this.obtenerFormato(mimeType);
                    const fileName = `grabacion_${new Date().toISOString().replace(/[:.]/g, '-')}.${formato}`;

                    const grabacion = {
                        juntaId: juntaId,
                        datosAudio: audioData,
                        mimeType: mimeType,
                        duracion: duracion,
                        fecha: fechaIso,
                        tamaño: audioBlob.size,
                        formato: formato
                    };

                    const id = await indexedDBServiceGlobal.add('grabaciones', grabacion);
                    const grabacionLocal = { ...grabacion, id };

                    try {
                        const { grabacionesRepository } = await import('../modules/grabaciones/grabaciones.repository.js');

                        await grabacionesRepository.save({
                            junta_id: juntaId,
                            storage_path: 'local_only',
                            file_name: fileName,
                            mime_type: mimeType,
                            duracion_segundos: duracion,
                            tamano_bytes: audioBlob.size,
                            orden_segmento: 1,
                            origen: 'media_recorder',
                            estado: 'guardada',
                            error_message: null,
                            created_at: fechaIso,
                            updated_at: fechaIso
                        });
                    } catch (error) {
                        console.error('Error al persistir grabación en Supabase:', error);
                    }

                    console.log('Grabación guardada con ID:', id);
                    resolve(grabacionLocal);
                };

                reader.onerror = (error) => {
                    console.error('Error al convertir audio a base64:', error);
                    reject(error);
                };
            });
        } catch (error) {
            console.error('Error al guardar grabación:', error);
            throw error;
        }
    }

    /**
     * Obtiene todas las grabaciones de una junta
     */
    async obtenerGrabaciones(juntaId) {
        try {
            const grabaciones = await indexedDBServiceGlobal.getByIndex('grabaciones', 'juntaId', juntaId);
            return grabaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        } catch (error) {
            console.error('Error al obtener grabaciones:', error);
            throw error;
        }
    }

    /**
     * Obtiene una grabación por su ID
     */
    async obtenerGrabacion(id) {
        try {
            const grabacion = await indexedDBServiceGlobal.get('grabaciones', id);
            
            if (!grabacion) {
                throw new Error(`Grabación con ID ${id} no encontrada`);
            }

            return grabacion;
        } catch (error) {
            console.error('Error al obtener grabación:', error);
            throw error;
        }
    }

    /**
     * Elimina una grabación
     */
    async eliminarGrabacion(id) {
        try {
            // Verificar si hay transcripciones asociadas
            const transcripciones = await indexedDBServiceGlobal.getByIndex('transcripciones', 'grabacionId', id);
            
            if (transcripciones.length > 0) {
                throw new Error('No se puede eliminar la grabación porque tiene transcripciones asociadas');
            }

            await indexedDBServiceGlobal.delete('grabaciones', id);
            console.log('Grabación eliminada:', id);
        } catch (error) {
            console.error('Error al eliminar grabación:', error);
            throw error;
        }
    }

    /**
     * Reproduce una grabación
     */
    reproducirGrabacion(grabacion) {
        try {
            const audio = new Audio(grabacion.datosAudio);
            audio.play();
            return audio;
        } catch (error) {
            console.error('Error al reproducir grabación:', error);
            throw error;
        }
    }

    /**
     * Inicializa el visualizador de audio
     */
    inicializarVisualizador(canvasId) {
        try {
            this.visualizadorCanvas = document.getElementById(canvasId);
            
            if (!this.visualizadorCanvas) {
                throw new Error(`Canvas con ID ${canvasId} no encontrado`);
            }

            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 2048;

            if (this.stream) {
                this.source = this.audioContext.createMediaStreamSource(this.stream);
                this.source.connect(this.analyser);
            }

            console.log('Visualizador inicializado');
        } catch (error) {
            console.error('Error al inicializar visualizador:', error);
            throw error;
        }
    }

    /**
     * Inicia la animación del visualizador
     */
    iniciarVisualizador() {
        if (!this.visualizadorCanvas || !this.analyser) {
            throw new Error('Visualizador no inicializado');
        }

        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvasCtx = this.visualizadorCanvas.getContext('2d');
        const width = this.visualizadorCanvas.width;
        const height = this.visualizadorCanvas.height;

        const dibujar = () => {
            this.animationId = requestAnimationFrame(dibujar);

            this.analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, width, height);

            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

            canvasCtx.beginPath();

            const sliceWidth = width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * height / 2;

                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            canvasCtx.lineTo(width, height / 2);
            canvasCtx.stroke();
        };

        dibujar();
        console.log('Visualizador iniciado');
    }

    /**
     * Detiene la animación del visualizador
     */
    detenerVisualizador() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
            console.log('Visualizador detenido');
        }
    }

    /**
     * Limpia los recursos
     */
    limpiar() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.detenerVisualizador();
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;

        console.log('Recursos limpiados');
    }

    /**
     * Calcula la duración de la grabación
     */
    calcularDuracion() {
        if (!this.mediaRecorder || !this.mediaRecorder.stream) {
            return 0;
        }

        const tracks = this.mediaRecorder.stream.getAudioTracks();
        if (tracks.length === 0) {
            return 0;
        }

        const track = tracks[0];
        const settings = track.getSettings();
        
        if (settings && settings.sampleRate) {
            // Calcular duración aproximada basada en el tamaño de los chunks
            const totalSize = this.audioChunks.reduce((total, chunk) => total + chunk.size, 0);
            const bytesPerSecond = (settings.sampleRate * 16 * 2) / 8; // Aproximado
            return Math.floor(totalSize / bytesPerSecond);
        }

        return 0;
    }

    /**
     * Obtiene el formato del archivo de audio
     */
    obtenerFormato(mimeType) {
        if (mimeType.includes('webm')) return 'webm';
        if (mimeType.includes('mp4')) return 'mp4';
        if (mimeType.includes('wav')) return 'wav';
        if (mimeType.includes('ogg')) return 'ogg';
        return 'unknown';
    }

    /**
     * Convierte la grabación a Blob
     */
    async convertirABlob(grabacion) {
        try {
            const response = await fetch(grabacion.datosAudio);
            return await response.blob();
        } catch (error) {
            console.error('Error al convertir a blob:', error);
            throw error;
        }
    }

    /**
     * Descarga la grabación
     */
    async descargarGrabacion(grabacion, nombreArchivo = null) {
        try {
            const blob = await this.convertirABlob(grabacion);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo || `grabacion_${grabacion.id}.${grabacion.formato}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar grabación:', error);
            throw error;
        }
    }
}

// Exportar instancia singleton
const grabacionService = new GrabacionService();

window.GrabacionService = GrabacionService;
window.grabacionService = grabacionService;
