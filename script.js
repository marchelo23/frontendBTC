// script.js (Versión Final con Carga de Wasm Corregida)

// Obtenemos las referencias a los elementos del DOM desde el principio
const predictBtn = document.getElementById('predictBtn');
const resultContainer = document.getElementById('result-container');
const loadingSpinner = document.getElementById('loadingSpinner');
const apiUrl = '/.netlify/functions/getPrediction'; // La URL segura de nuestra función BFF

// Ponemos el botón en estado de carga inicial
predictBtn.disabled = true;
predictBtn.textContent = 'Cargando Módulo Wasm...';

// Creamos y definimos el objeto global 'Module' ANTES de cargar el script de Emscripten.
// Esto asegura que nuestro callback 'onRuntimeInitialized' siempre esté disponible.
var Module = {
    // Esta función se ejecutará automáticamente cuando Wasm esté compilado y listo
    onRuntimeInitialized: function() {
        console.log("Wasm module is ready. Initializing app...");
        initializeApp();
    }
};

/**
 * Esta función contiene toda la lógica de la aplicación.
 * Solo se llama una vez que Wasm está listo.
 */
function initializeApp() {
    // Preparamos la función C++ para que sea fácil de llamar desde JavaScript
    const procesarPrediccionWasm = Module.cwrap(
        'generar_html_prediccion', 'string', ['number', 'number']
    );

    // Habilitamos el botón ahora que todo está listo
    predictBtn.disabled = false;
    predictBtn.textContent = 'Obtener Predicción';

    predictBtn.addEventListener('click', async () => {
        predictBtn.disabled = true;
        resultContainer.innerHTML = '';
        loadingSpinner.style.display = 'block';

        try {
            const response = await fetch(apiUrl, { method: 'POST' });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error desconocido del servidor.');
            }
            
            const htmlResultado = procesarPrediccionWasm(
                data.current_price_btc_usd,
                data.predicted_price_next_hour_btc_usd
            );
            
            resultContainer.innerHTML = htmlResultado;

        } catch (error) {
            console.error('Error:', error);
            resultContainer.innerHTML = `<p style="color: #cf6679;"><strong>Error:</strong> ${error.message}</p>`;
        } finally {
            loadingSpinner.style.display = 'none';
            predictBtn.disabled = false;
        }
    });
}

// Finalmente, creamos dinámicamente la etiqueta <script> para cargar el "glue code" de Emscripten.
// Esto inicia la descarga y compilación de procesador.js y procesador.wasm.
const emscriptenScript = document.createElement('script');
emscriptenScript.src = 'procesador.js';
document.body.appendChild(emscriptenScript);