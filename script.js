

// Esperamos a que la página cargue Y a que el módulo Wasm esté listo.
window.addEventListener('load', () => {

    const predictBtn = document.getElementById('predictBtn');
    const resultContainer = document.getElementById('result-container');
    const apiUrl = 'https://marchelo23-backendbtc.hf.space';

    // Emscripten crea un objeto global 'Module'.
    // Debemos esperar a que esté inicializado.
    Module.onRuntimeInitialized = () => {
        
        // Usamos cwrap para crear una función JS fácil de usar a partir de nuestra función C++
        // cwrap('nombre_funcion_cpp', 'tipo_de_retorno', ['tipo_arg1', 'tipo_arg2'])
        const procesarPrediccionWasm = Module.cwrap(
            'generar_html_prediccion', // Nombre de la función en C++
            'string',                  // Wasm devuelve un puntero, pero cwrap lo convierte a un string de JS
            ['number', 'number']       // Argumentos: precio_actual, precio_predicho
        );

        // Habilitamos el botón solo cuando Wasm está listo
        predictBtn.disabled = false;
        predictBtn.textContent = 'Obtener Predicción';

        predictBtn.addEventListener('click', async () => {
            predictBtn.disabled = true;
            resultContainer.innerHTML = '<p>Llamando a la API de Python...</p>';

            try {
                const response = await fetch(apiUrl, { method: 'POST' });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || `Error del servidor: ${response.status}`);
                }

                const data = await response.json();
                
                // --- ¡AQUÍ ESTÁ LA MAGIA! ---
                // Llamamos a nuestra función C++ compilada a Wasm
                console.log("Llamando a la función C++/Wasm...");
                const htmlResultado = procesarPrediccionWasm(
                    data.current_price_btc_usd,
                    data.predicted_price_next_hour_btc_usd
                );
                
                // Mostramos el HTML generado por Wasm
                resultContainer.innerHTML = htmlResultado;

            } catch (error) {
                console.error('Error:', error);
                resultContainer.innerHTML = `<p style="color: #cf6679;"><strong>Error:</strong> ${error.message}</p>`;
            } finally {
                predictBtn.disabled = false;
            }
        });
    };

    // Mensaje inicial mientras Wasm carga
    predictBtn.disabled = true;
    predictBtn.textContent = 'Cargando Módulo Wasm...';
});