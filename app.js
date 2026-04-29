import { initializeApp } from './src/core/bootstrap.js';

window.addEventListener('DOMContentLoaded', async () => {
  try {
    await initializeApp();
    console.log('GestActas inicializado');
  } catch (error) {
    console.error('Error al inicializar GestActas:', error);
  }
});
