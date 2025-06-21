// netlify/functions/getPrediction.js

// Usamos 'node-fetch' para hacer peticiones desde el servidor. 
// Netlify lo maneja automáticamente.
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event, context) => {
    // La URL de tu API real en Hugging Face
    const REAL_API_URL = 'https://marchelo23-backendbtc.hf.space/predict_btc_next_hour';
    
    // Obtenemos la clave secreta desde las variables de entorno de Netlify.
    // ¡NUNCA se expone al navegador!
    const API_KEY = process.env.HF_API_KEY;

    if (!API_KEY) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'La clave de API del servidor no está configurada.' })
        };
    }

    try {
        // La función BFF llama a la API real, añadiendo la clave secreta
        const response = await fetch(REAL_API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-API-Key': API_KEY // <-- Aquí se añade el secreto
            }
        });

        const data = await response.json();

        // Si la API real dio un error, lo pasamos al frontend
        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: data.detail || 'Error en la API de IA.' })
            };
        }

        // Si todo fue bien, devolvemos la predicción al frontend
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Error en la función BFF:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Fallo al contactar el servicio de predicción.' })
        };
    }
};