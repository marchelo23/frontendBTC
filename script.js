document.addEventListener('DOMContentLoaded', function() {
    const predictBtn = document.getElementById('predictBtn');
    const resultBox = document.getElementById('resultBox');
    const apiUrl = '/.netlify/functions/getPrediction'; // La URL de nuestra API
    
    if (predictBtn && resultBox) {
        predictBtn.addEventListener('click', async function() {
            predictBtn.textContent = 'Processing...';
            predictBtn.disabled = true;
            
            try {
                const response = await fetch(apiUrl, { method: 'POST' });
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Error desconocido del servidor.');
                }
                
                // Generar el HTML de resultado
                const resultadoHTML = `
                    <div class="result-header">--- Result Processed with C++/Wasm ---</div>
                    <div class="result-content">
                        <div class="price-row">
                            <div class="price-label">Current Price:</div>
                            <div class="price-value current">$${data.current_price_btc_usd.toFixed(2)}</div>
                        </div>
                        <div class="price-row">
                            <div class="price-label">Predicted Price (1h):</div>
                            <div class="price-value predicted">$${data.predicted_price_next_hour_btc_usd.toFixed(2)}</div>
                        </div>
                        <div class="price-row">
                            <div class="price-label">Overall Trend:</div>
                            <div class="trend-value bearish">BEARISH ▼</div>
                        </div>
                    </div>
                `;
                
                resultBox.innerHTML = resultadoHTML;
                resultBox.style.display = 'block';
                
            } catch (error) {
                console.error('Error:', error);
                resultBox.innerHTML = `<p style="color: #cf6679;"><strong>Error:</strong> ${error.message}</p>`;
            } finally {
                predictBtn.textContent = 'Get Prediction';
                predictBtn.disabled = false;
            }
        });
    }
});