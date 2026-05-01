/**
 * GestActas - Servicio de Transcripción
 * 
 * Servicio para la transcripción de audio usando Whisper API y Web Speech API.
 */

const indexedDBServiceGlobal = window.indexedDBService;

class TranscripcionService {
    constructor() {
        this.apiKeyWhisper = null;
        this.whisperEndpoint = 'https://api.openai.com/v1/audio/transcriptions';
        this.isTranscribing = false;
        this.progresoTranscripcion = 0;
        this.recognition = null;
    }

    /**
     * Inicializa el servicio
     */
    async init(apiKeyWhisper = null) {
        this.apiKeyWhisper = apiKeyWhisper;
        await indexedDBServiceGlobal.init();
    }

    /**
     * Transcribe audio usando Whisper API
     */
    async transcribirConWhisper(grabacionId, opciones = {}) {
        try {
            if (!this.apiKeyWhisper) {
                throw new Error('API Key de Whisper no configurada');
            }

            this.isTranscribing = true;
            this.progresoTranscripcion = 0;

            // Obtener la grabación
            const grabacion = await indexedDBServiceGlobal.get('grabaciones', grabacionId);
            
            if (!grabacion) {
                throw new Error(`Grabación con ID ${grabacionId} no encontrada`);
            }

            // Convertir datos base64 a Blob
            const response = await fetch(grabacion.datosAudio);
            const audioBlob = await response.blob();

            // Crear FormData para la petición
            const formData = new FormData();
            formData.append('file', audioBlob, `grabacion_${grabacionId}.${grabacion.formato}`);
            formData.append('model', opciones.modelo || 'whisper-1');
            formData.append('language', opciones.idioma || 'es');
            formData.append('response_format', 'text');

            // Llamar a la API de Whisper
            const apiResponse = await fetch(this.whisperEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKeyWhisper}`
                },
                body: formData
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                throw new Error(`Error en Whisper API: ${errorData.error?.message || apiResponse.statusText}`);
            }

            this.progresoTranscripcion = 50;

            // Obtener texto transcrito
            const texto = await apiResponse.text();
            this.progresoTranscripcion = 100;

            // Guardar transcripción
            const transcripcion = {
                grabacionId: grabacionId,
                texto: texto,
                idioma: opciones.idioma || 'es',
                modelo: opciones.modelo || 'whisper-1',
                metodo: 'whisper_api',
                fecha: new Date().toISOString(),
                duracion: grabacion.duracion,
                confianza: 0.95 // Whisper suele tener alta confianza
            };

            const id = await indexedDBServiceGlobal.add('transcripciones', transcripcion);
            this.isTranscribing = false;

            console.log('Transcripción completada con ID:', id);
            return { ...transcripcion, id };
        } catch (error) {
            this.isTranscribing = false;
            console.error('Error al transcribir con Whisper:', error);
            throw error;
        }
    }

    /**
     * Transcribe audio usando Web Speech API (local, gratuito)
     */
    async transcribirConWebSpeechAPI(grabacionId, opciones = {}) {
        try {
            this.isTranscribing = true;
            this.progresoTranscripcion = 0;

            // Obtener la grabación
            const grabacion = await indexedDBServiceGlobal.get('grabaciones', grabacionId);
            
            if (!grabacion) {
                throw new Error(`Grabación con ID ${grabacionId} no encontrada`);
            }

            // Convertir datos base64 a Blob
            const response = await fetch(grabacion.datosAudio);
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            return new Promise((resolve, reject) => {
                // Verificar soporte del navegador
                if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                    reject(new Error('Web Speech API no soportada en este navegador'));
                    return;
                }

                // Crear instancia de reconocimiento
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                this.recognition = new SpeechRecognition();
                this.recognition.lang = opciones.idioma || 'es-ES';
                this.recognition.continuous = true;
                this.recognition.interimResults = true;
                this.recognition.maxAlternatives = 1;

                let textoCompleto = '';
                let textosIntermedios = [];

                this.recognition.onstart = () => {
                    console.log('Reconocimiento de voz iniciado');
                    this.progresoTranscripcion = 10;
                };

                this.recognition.onresult = (event) => {
                    let textoActual = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const resultado = event.results[i];
                        const texto = resultado[0].transcript;
                        
                        if (resultado.isFinal) {
                            textoActual += texto + ' ';
                        } else {
                            textosIntermedios.push(texto);
                        }
                    }

                    textoCompleto += textoActual;
                    this.progresoTranscripcion = Math.min(90, this.progresoTranscripcion + 5);
                };

                this.recognition.onerror = (event) => {
                    console.error('Error en reconocimiento de voz:', event.error);
                    
                    if (event.error === 'no-speech') {
                        this.isTranscribing = false;
                        reject(new Error('No se detectó voz en el audio'));
                    } else if (event.error === 'not-allowed') {
                        this.isTranscribing = false;
                        reject(new Error('Permiso de micrófono no otorgado'));
                    } else {
                        this.isTranscribing = false;
                        reject(new Error(`Error en Web Speech API: ${event.error}`));
                    }
                };

                this.recognition.onend = async () => {
                    this.progresoTranscripcion = 100;

                    // Guardar transcripción
                    const transcripcion = {
                        grabacionId: grabacionId,
                        texto: textoCompleto.trim(),
                        idioma: opciones.idioma || 'es-ES',
                        modelo: 'web_speech_api',
                        metodo: 'web_speech_api',
                        fecha: new Date().toISOString(),
                        duracion: grabacion.duracion,
                        confianza: 0.65 // Web Speech API suele tener ~65% de precisión
                    };

                    const id = await indexedDBServiceGlobal.add('transcripciones', transcripcion);
                    this.isTranscribing = false;

                    console.log('Transcripción completada con ID:', id);
                    resolve({ ...transcripcion, id });
                };

                // Reproducir audio para que el reconocimiento capture
                const audio = new Audio(audioUrl);
                audio.onended = () => {
                    this.recognition.stop();
                };
                audio.play();
            });
        } catch (error) {
            this.isTranscribing = false;
            console.error('Error al transcribir con Web Speech API:', error);
            throw error;
        }
    }

    /**
     * Obtiene todas las transcripciones de una grabación
     */
    async obtenerTranscripciones(grabacionId) {
        try {
            const transcripciones = await indexedDBServiceGlobal.getByIndex('transcripciones', 'grabacionId', grabacionId);
            return transcripciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        } catch (error) {
            console.error('Error al obtener transcripciones:', error);
            throw error;
        }
    }

    /**
     * Obtiene una transcripción por su ID
     */
    async obtenerTranscripcion(id) {
        try {
            const transcripcion = await indexedDBServiceGlobal.get('transcripciones', id);
            
            if (!transcripcion) {
                throw new Error(`Transcripción con ID ${id} no encontrada`);
            }

            return transcripcion;
        } catch (error) {
            console.error('Error al obtener transcripción:', error);
            throw error;
        }
    }

    /**
     * Actualiza el texto de una transcripción
     */
    async actualizarTranscripcion(id, nuevoTexto) {
        try {
            const transcripcionActual = await indexedDBServiceGlobal.get('transcripciones', id);
            
            if (!transcripcionActual) {
                throw new Error(`Transcripción con ID ${id} no encontrada`);
            }

            const transcripcionActualizada = {
                ...transcripcionActual,
                texto: nuevoTexto,
                fechaEdicion: new Date().toISOString()
            };

            await indexedDBServiceGlobal.update('transcripciones', transcripcionActualizada);
            console.log('Transcripción actualizada:', id);
            return transcripcionActualizada;
        } catch (error) {
            console.error('Error al actualizar transcripción:', error);
            throw error;
        }
    }

    /**
     * Elimina una transcripción
     */
    async eliminarTranscripcion(id) {
        try {
            await indexedDBServiceGlobal.delete('transcripciones', id);
            console.log('Transcripción eliminada:', id);
        } catch (error) {
            console.error('Error al eliminar transcripción:', error);
            throw error;
        }
    }

    /**
     * Exporta una transcripción como texto
     */
    exportarTranscripcionComoTexto(transcripcion) {
        try {
            const blob = new Blob([transcripcion.texto], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `transcripcion_${transcripcion.id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al exportar transcripción:', error);
            throw error;
        }
    }

    /**
     * Compara dos transcripciones y muestra diferencias
     */
    compararTranscripciones(transcripcion1, transcripcion2) {
        try {
            const texto1 = transcripcion1.texto.toLowerCase();
            const texto2 = transcripcion2.texto.toLowerCase();

            // Distancia de Levenshtein simple
            const matriz = [];
            for (let i = 0; i <= texto1.length; i++) {
                matriz[i] = [i];
            }
            for (let j = 0; j <= texto2.length; j++) {
                matriz[0][j] = j;
            }

            for (let i = 1; i <= texto1.length; i++) {
                for (let j = 1; j <= texto2.length; j++) {
                    if (texto1.charAt(i - 1) === texto2.charAt(j - 1)) {
                        matriz[i][j] = matriz[i - 1][j - 1];
                    } else {
                        matriz[i][j] = Math.min(
                            matriz[i - 1][j - 1] + 1,
                            matriz[i][j - 1] + 1,
                            matriz[i - 1][j] + 1
                        );
                    }
                }
            }

            const distancia = matriz[texto1.length][texto2.length];
            const longitudMaxima = Math.max(texto1.length, texto2.length);
            const similitud = longitudMaxima > 0 ? ((longitudMaxima - distancia) / longitudMaxima) * 100 : 100;

            return {
                distancia,
                similitud: Math.round(similitud * 100) / 100,
                metodo1: transcripcion1.metodo,
                metodo2: transcripcion2.metodo
            };
        } catch (error) {
            console.error('Error al comparar transcripciones:', error);
            throw error;
        }
    }

    /**
     * Obtiene el progreso actual de la transcripción
     */
    obtenerProgreso() {
        return {
            isTranscribing: this.isTranscribing,
            progreso: this.progresoTranscripcion
        };
    }

    /**
     * Cancela la transcripción en curso
     */
    cancelarTranscripcion() {
        if (this.recognition) {
            this.recognition.abort();
            this.recognition = null;
        }

        this.isTranscribing = false;
        this.progresoTranscripcion = 0;
        console.log('Transcripción cancelada');
    }
}

// Exportar instancia singleton
const transcripcionService = new TranscripcionService();

window.TranscripcionService = TranscripcionService;
window.transcripcionService = transcripcionService;
