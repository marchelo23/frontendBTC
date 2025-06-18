// script.js (Versión con manejo de carga asíncrona de Wasm)

function initializeApp() {
    // This function contains all the logic that depends on Wasm being ready.
    console.log("Wasm module is ready. Initializing app...");

    const predictBtn = document.getElementById('predictBtn');
    const resultContainer = document.getElementById('result-container');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const apiUrl = 'https://marchelo23-backendbtc.hf.space/predict_btc_next_hour'; // Replace with your live API URL

    // Use cwrap to create a JS function from our C++ function
    const procesarPrediccionWasm = Module.cwrap(
        'generar_html_prediccion',
        'string',
        ['number', 'number']
    );

    // Enable the button now that everything is ready
    predictBtn.disabled = false;
    predictBtn.textContent = 'Obtener Predicción';

    predictBtn.addEventListener('click', async () => {
        predictBtn.disabled = true;
        resultContainer.innerHTML = '';
        loadingSpinner.style.display = 'block';

        try {
            const response = await fetch(apiUrl, { method: 'POST' });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error del servidor: ${response.status}`);
            }

            const data = await response.json();
            
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

// --- LÓGICA DE INICIALIZACIÓN ROBUSTA ---
// Emscripten creates a global 'Module' object. We check if it's already initialized.
if (Module.calledRun) {
  // If it's already initialized, run our app logic immediately.
  initializeApp();
} else {
  // Otherwise, set the onRuntimeInitialized callback to run our app logic when it's ready.
  Module.onRuntimeInitialized = initializeApp;
}

// Set initial button state while Wasm might be loading
const initialPredictBtn = document.getElementById('predictBtn');
if (initialPredictBtn.disabled) {
    initialPredictBtn.textContent = 'Cargando Módulo Wasm...';
}