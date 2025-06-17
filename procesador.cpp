// procesador.cpp

#include <emscripten.h> // Incluimos la librería de Emscripten
#include <string>
#include <sstream>
#include <iomanip>

// extern "C" asegura que el nombre de la función no sea modificado por el compilador de C++
extern "C" {

// EMSCRIPTEN_KEEPALIVE evita que Emscripten elimine esta función por no ser llamada desde main()
EMSCRIPTEN_KEEPALIVE
const char* generar_html_prediccion(double precio_actual, double precio_predicho) {
    std::stringstream ss;
    bool sube = precio_predicho > precio_actual;

    // Usamos stringstream para construir nuestra cadena de texto HTML
    ss << "<div class='wasm-result'>";
    ss << "<h4>--- Resultado Procesado con C++/Wasm ---</h4>";
    ss << "<p><strong>Precio Actual:</strong> $" << std::fixed << std::setprecision(2) << precio_actual << "</p>";
    ss << "<p><strong>Precio Predicho (1h):</strong> $" << std::fixed << std::setprecision(2) << precio_predicho << "</p>";
    
    if (sube) {
        ss << "<p style='color: #4CAF50;'><strong>Tendencia:</strong> ALCISTA ▲</p>";
    } else {
        ss << "<p style='color: #F44336;'><strong>Tendencia:</strong> BAJISTA ▼</p>";
    }
    ss << "</div>";

    // Creamos una cadena de C y la devolvemos.
    // Wasm no puede devolver objetos std::string directamente a JS, por eso usamos char*
    std::string resultado_str = ss.str();
    char* resultado_c_str = new char[resultado_str.length() + 1];
    strcpy(resultado_c_str, resultado_str.c_str());
    
    return resultado_c_str;
}

} // extern "C"