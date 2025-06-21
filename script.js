// script.js (Versión Final Segura con BFF y Wasm)

/**
 * Esta función contiene toda la lógica principal de la aplicación.
 * Se ejecuta solo después de que el módulo WebAssembly esté completamente cargado y listo.
 */
function initializeApp() {
    console.log("Wasm module is ready. Initializing app...");

    // 1. OBTENER REFERENCIAS A LOS ELEMENTOS HTML
    const predictBtn = document.getElementById('predictBtn');
    const resultContainer = document.getElementById('result-container');
    const loadingSpinner = document.getElementById('loadingSpinner');
    
    // 2. DEFINIR LA URL DEL ENDPOINT BFF
    // Esta es una ruta relativa. Netlify la redirigirá automáticamente a nuestra función serverless.
    const apiUrl = '/.netlify/functions/getPrediction';

    // 3. PREPARAR LA FUNCIÓN WEBASSEMBLY
    // Creamos un 'wrapper' de JavaScript para nuestra función C++ para que sea fácil de llamar.
    const procesarPrediccionWasm = Module.cwrap(
        'generar_html_prediccion', // El nombre de la función en C++
        'string',                  // El tipo de dato que devuelve (Wasm devuelve un puntero, cwrap lo convierte a string)
        ['number', 'number']       // Los tipos de los argumentos que recibe (precio_actual, precio_predicho)
    );

    // 4. HABILITAR EL BOTÓN Y CONFIGURAR EL EVENTO DE CLICK
    predictBtn.disabled = false;
    predictBtn.textContent = 'Obtener Predicción';

    predictBtn.addEventListener('click', async () => {
        // --- Inicia el proceso al hacer clic ---
        predictBtn.disabled = true;
        resultContainer.innerHTML = ''; // Limpiamos resultados anteriores
        loadingSpinner.style.display = 'block'; // Mostramos el spinner

        try {
            // 5. LLAMAR A NUESTRA FUNCIÓN BFF (¡NO A LA API REAL!)
            // Esta petición es segura, no contiene ninguna clave secreta.
            const response = await fetch(apiUrl, {
                method: 'POST'
            });
            
            // Obtenemos la respuesta de nuestra función BFF
            const data = await response.json();

            // Si la respuesta de la función BFF indica un error, lo lanzamos para que lo capture el 'catch'
            if (!response.ok) {
                // El error viene del body que nuestra función BFF construyó
                throw new Error(data.error || 'Error desconocido del servidor.');
            }

            // 6. LLAMAR A WEBASSEMBLY CON LOS DATOS RECIBIDOS
            // Pasamos los datos de la predicción a nuestra función C++ para que genere el HTML
            console.log("Datos recibidos del BFF, llamando a la función C++/Wasm...");
            const htmlResultado = procesarPrediccionWasm(
                data.current_price_btc_usd,
                data.predicted_price_next_hour_btc_usd
            );
            
            // 7. MOSTRAR EL RESULTADO FINAL
            // Mostramos el HTML que fue generado por WebAssembly
            resultContainer.innerHTML = htmlResultado;

        } catch (error) {
            // Si ocurre cualquier error en el proceso, lo mostramos al usuario
            console.error('Error:', error);
            resultContainer.innerHTML = `<p style="color: #cf6679;"><strong>Error:</strong> ${error.message}</p>`;
        } finally {
            // Ocultamos el spinner y volvemos a habilitar el botón
            loadingSpinner.style.display = 'none';
            predictBtn.disabled = false;
        }
    });
}

// --- LÓGICA DE INICIALIZACIÓN ROBUSTA PARA WEBASSEMBLY ---
// Emscripten crea un objeto global 'Module'. Debemos esperar a que esté listo.
// Esta lógica evita "race conditions" si el módulo Wasm carga muy rápido.
if ('Module' in window && Module.calledRun) {
  // Si ya está cargado, inicializa la app inmediatamente.
  initializeApp();
} else {
  // Si no, le decimos que llame a initializeApp() cuando termine de cargar.
  window.Module = {
      onRuntimeInitialized: initializeApp
  };
  // Incluimos esta línea para asegurar que el script principal se cargue
  const script = document.createElement('script');
  script.src = 'procesador.js';
  document.body.appendChild(script);
}

// Mensaje inicial en el botón mientras Wasm carga
const initialPredictBtn = document.getElementById('predictBtn');
if(initialPredictBtn){
    initialPredictBtn.disabled = true;
    initialPredictBtn.textContent = 'Cargando Módulo Wasm...';
}